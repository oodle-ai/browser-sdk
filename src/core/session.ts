/**
 * Sessions.
 *
 * One session is shared by every tab of the site, and its
 * record lives in localStorage. Each tab also has
 * its own state in sessionStorage: a tab id, its event counts
 * and its replay segment counter. Replay segments are keyed by
 * session and tab, so two tabs that share a session never
 * write the same object or mix two DOMs in one recording.
 *
 * A session ends after SESSION_TIMEOUT_MS without user
 * activity, or SESSION_MAX_DURATION_MS after it started. An
 * expired session is not renewed by background work (polling,
 * timers): only user activity or a page load starts the next
 * one. Until then getSessionId() returns '' and nothing is
 * recorded. Without this, a tab left open made a new session
 * every timeout, and session counts grew with idle tabs.
 *
 * A tab that was opened by an SDK before this model kept its
 * session in sessionStorage. That session is adopted, so an
 * upgrade in the middle of a session keeps its id, its start
 * is not counted again, and its replay keeps its old path.
 */

const SHARED_KEY = '__oodle_session_v2';
const TAB_KEY = '__oodle_tab';
const LEGACY_KEY = '__oodle_session';

export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
export const SESSION_MAX_DURATION_MS = 4 * 60 * 60 * 1000;

/** Activity is written to shared storage at most this often. */
const ACTIVITY_WRITE_MS = 1000;

interface SharedSession {
  id: string;
  createdAt: number;
  lastActivity: number;
  sampled: boolean;
  replaySampled: boolean;
  /** The session start was sent by some tab. */
  started: boolean;
}

interface TabState {
  tabId: string;
  sessionId: string;
  viewCount: number;
  errorCount: number;
  actionCount: number;
  replaySegmentSeq: number;
  /** Replay segments go to the pre-tab path. */
  legacyReplay: boolean;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    },
  );
}

// Storage can throw (blocked cookies, private mode) or be
// absent. The in-memory copies keep the SDK working for the
// life of the page in that case.
let memShared: SharedSession | null = null;
let memTab: TabState | null = null;

function readJSON(store: Storage | undefined, key: string): any {
  try {
    const raw = store?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJSON(store: Storage | undefined, key: string, v: unknown) {
  try {
    store?.setItem(key, JSON.stringify(v));
  } catch {
    // Storage unavailable: the in-memory copy is used.
  }
}

function local(): Storage | undefined {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : undefined;
  } catch {
    return undefined;
  }
}

function tabStore(): Storage | undefined {
  try {
    return typeof sessionStorage !== 'undefined'
      ? sessionStorage
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Every event reads the session, and a page load can emit
 * thousands of resource events. The shared record is re-read at
 * most every SHARED_CACHE_MS, and at once when another tab writes
 * it (the `storage` event). A tab sees another tab's renewal at
 * most that late, which only moves the boundary between two
 * sessions by that much.
 */
const SHARED_CACHE_MS = 1000;
let sharedReadAt = 0;

function loadShared(): SharedSession | null {
  const now = Date.now();
  if (memShared && now - sharedReadAt < SHARED_CACHE_MS) return memShared;
  sharedReadAt = now;
  const p = readJSON(local(), SHARED_KEY);
  if (p && typeof p.id === 'string' && p.id) {
    return cacheShared({
      id: p.id,
      createdAt: p.createdAt ?? Date.now(),
      lastActivity: p.lastActivity ?? Date.now(),
      sampled: p.sampled ?? true,
      replaySampled: p.replaySampled ?? true,
      started: p.started ?? true,
    });
  }
  return memShared;
}

/**
 * The last record this tab saw of each session, by id. When another tab
 * replaces a session, the shared record no longer holds it, and a view
 * of the old session needs the old record to know when it ended.
 */
const seenSessions = new Map<string, { lastActivity: number; createdAt: number }>();

function remember(s: SharedSession) {
  const prev = seenSessions.get(s.id);
  seenSessions.set(s.id, {
    lastActivity: Math.max(prev?.lastActivity ?? 0, s.lastActivity),
    createdAt: s.createdAt,
  });
  // Few sessions a tab ever sees; a cap keeps a long-lived tab small.
  if (seenSessions.size > 20) {
    const oldest = seenSessions.keys().next().value;
    if (oldest !== undefined) seenSessions.delete(oldest);
  }
}

function cacheShared(s: SharedSession | null): SharedSession | null {
  if (s) {
    memShared = s;
    remember(s);
  }
  return s;
}

function saveShared(s: SharedSession) {
  memShared = s;
  remember(s);
  sharedReadAt = Date.now();
  writeJSON(local(), SHARED_KEY, s);
}

function loadTab(): TabState | null {
  // Only this tab writes its tab state, so the in-memory copy
  // is current once it exists.
  if (memTab) return memTab;
  const p = readJSON(tabStore(), TAB_KEY);
  if (p && typeof p.tabId === 'string') {
    const loaded: TabState = {
      tabId: p.tabId,
      sessionId: p.sessionId ?? '',
      viewCount: p.viewCount ?? 0,
      errorCount: p.errorCount ?? 0,
      actionCount: p.actionCount ?? 0,
      replaySegmentSeq: p.replaySegmentSeq ?? 0,
      legacyReplay: p.legacyReplay ?? false,
    };
    memTab = loaded;
    return loaded;
  }
  return memTab;
}

function saveTab(t: TabState) {
  memTab = t;
  writeJSON(tabStore(), TAB_KEY, t);
}

let tabSaveTimer: ReturnType<typeof setTimeout> | null = null;

function saveTabSoon(t: TabState) {
  memTab = t;
  if (tabSaveTimer) return;
  tabSaveTimer = setTimeout(() => {
    tabSaveTimer = null;
    if (memTab) writeJSON(tabStore(), TAB_KEY, memTab);
  }, 1000);
}

function saveTabNow(t: TabState) {
  if (tabSaveTimer) {
    clearTimeout(tabSaveTimer);
    tabSaveTimer = null;
  }
  saveTab(t);
}

let _sessionSampleRate = 100;
let _replaySampleRate = 100;

export function setSampleRates(sessionRate: number, replayRate: number) {
  _sessionSampleRate = Math.max(0, Math.min(100, sessionRate));
  _replaySampleRate = Math.max(0, Math.min(100, replayRate));
}

function rollSample(rate: number): boolean {
  return Math.random() * 100 < rate;
}

function isLive(s: SharedSession | null, now: number): s is SharedSession {
  return (
    !!s &&
    now - s.lastActivity <= SESSION_TIMEOUT_MS &&
    now - s.createdAt <= SESSION_MAX_DURATION_MS
  );
}

/**
 * Adopts the session a pre-v2 SDK kept in this tab, when no
 * shared session is live. Its start was already counted the
 * old way (first view with session_view_count 1), so it is
 * marked started.
 */
function adoptLegacy(now: number): boolean {
  const p = readJSON(tabStore(), LEGACY_KEY);
  if (!p || typeof p.id !== 'string') return false;
  const legacy: SharedSession = {
    id: p.id,
    createdAt: p.createdAt ?? now,
    lastActivity: p.lastActivity ?? now,
    sampled: p.sampled ?? true,
    replaySampled: p.replaySampled ?? true,
    started: true,
  };
  // The old timeout was 30 minutes; a session the old SDK
  // would still continue is continued.
  if (
    now - legacy.lastActivity > 30 * 60 * 1000 ||
    now - legacy.createdAt > SESSION_MAX_DURATION_MS
  ) {
    return false;
  }
  saveShared(legacy);
  saveTabNow({
    tabId: generateId(),
    sessionId: legacy.id,
    viewCount: p.viewCount ?? 0,
    errorCount: p.errorCount ?? 0,
    actionCount: p.actionCount ?? 0,
    replaySegmentSeq: p.replaySegmentSeq ?? 0,
    legacyReplay: true,
  });
  try {
    tabStore()?.removeItem(LEGACY_KEY);
  } catch {
    // Left behind; it is only read when no session is live.
  }
  return true;
}

function newSession(now: number): SharedSession {
  const sampled = rollSample(_sessionSampleRate);
  const s: SharedSession = {
    id: generateId(),
    createdAt: now,
    lastActivity: now,
    sampled,
    replaySampled: sampled && rollSample(_replaySampleRate),
    started: false,
  };
  saveShared(s);
  return s;
}

type RenewListener = (previousId: string, nextId: string) => void;
const renewListeners = new Set<RenewListener>();

/**
 * Called when the session this tab records under changes:
 * this tab renewed it, or another tab did. The view module
 * ends the current view and starts one in the new session,
 * so no view spans two sessions.
 */
export function onSessionRenewed(cb: RenewListener): () => void {
  renewListeners.add(cb);
  return () => renewListeners.delete(cb);
}

function currentTab(): TabState {
  let t = loadTab();
  if (!t) {
    t = {
      tabId: generateId(),
      sessionId: '',
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      replaySegmentSeq: 0,
      legacyReplay: false,
    };
    saveTabNow(t);
  }
  return t;
}

/** Points this tab at `id`, resetting its per-session state. */
function bindTab(id: string) {
  const t = currentTab();
  if (t.sessionId === id) return;
  const previous = t.sessionId;
  t.sessionId = id;
  t.viewCount = 0;
  t.errorCount = 0;
  t.actionCount = 0;
  t.replaySegmentSeq = 0;
  t.legacyReplay = false;
  saveTabNow(t);
  if (previous) {
    for (const cb of renewListeners) {
      try {
        cb(previous, id);
      } catch {
        // A listener must not stop the session change.
      }
    }
  }
}

let lastActivityWrite = 0;

/**
 * Records user activity. Starts a session when none is live:
 * a page load and a user action are what may start one.
 */
/**
 * Extends the live session without starting a new one. A tab that only
 * became or stayed visible keeps its session going, but it is no user
 * action, so it must not start the next session: switching back to an
 * idle tab would otherwise count as a new visit.
 */
export function extendSession() {
  const now = Date.now();
  sharedReadAt = 0;
  const s = loadShared();
  if (!isLive(s, now)) return;
  if (now - lastActivityWrite >= ACTIVITY_WRITE_MS) {
    s.lastActivity = Math.max(s.lastActivity, now);
    saveShared(s);
    lastActivityWrite = now;
  }
  bindTab(s.id);
}

/** How often a visible tab extends its session while it stays visible. */
export const VISIBLE_EXTEND_MS = 60_000;

export function touchSession() {
  const now = Date.now();
  let s = loadShared();
  if (!isLive(s, now)) {
    // The cache may be stale; another tab may have started the
    // next session within the last second.
    sharedReadAt = 0;
    s = loadShared();
  }
  if (!isLive(s, now)) {
    if (!adoptLegacy(now)) {
      s = newSession(now);
    } else {
      s = loadShared();
    }
    lastActivityWrite = now;
  } else if (now - lastActivityWrite >= ACTIVITY_WRITE_MS) {
    s.lastActivity = Math.max(s.lastActivity, now);
    saveShared(s);
    lastActivityWrite = now;
  }
  if (s) bindTab(s.id);
}

/**
 * The live session id, or '' when the session expired and no
 * user activity has started the next one. Never starts a
 * session by itself.
 */
export function getSessionId(): string {
  const now = Date.now();
  const s = loadShared();
  if (!isLive(s, now)) return '';
  // A tab whose own session another tab replaced stays out of the new
  // one until its user acts in it (touchSession). Adopting on any event,
  // a background poll included, started views in tabs nobody was using,
  // and moved the new session's start to the first of those tabs.
  const bound = loadTab()?.sessionId;
  if (bound && bound !== s.id) return '';
  bindTab(s.id);
  return s.id;
}

/**
 * When the session `id` stopped being live: its last activity plus the
 * inactivity timeout, or its maximum duration, whichever comes first.
 * Null when the shared record is not that session (another tab renewed
 * it) or the session is still live.
 */
export function sessionEndedAt(id: string): number | null {
  sharedReadAt = 0;
  const s = loadShared();
  // A session another tab replaced has ended too: by the record this
  // tab last saw of it. Without that, a view of a replaced session kept
  // updating under it until the page went away, which made sessions of
  // one view that lasted most of an hour.
  const rec = s && s.id === id ? s : seenSessions.get(id);
  if (!rec) return s && s.id !== id ? Date.now() : null;
  const end = Math.min(
    rec.lastActivity + SESSION_TIMEOUT_MS,
    rec.createdAt + SESSION_MAX_DURATION_MS,
  );
  if (s && s.id !== id) return Math.min(end, Date.now());
  return Date.now() > end ? end : null;
}

export function getTabId(): string {
  return currentTab().tabId;
}

/** True when this tab's replay keeps the pre-tab storage path. */
export function isLegacyReplayTab(): boolean {
  return currentTab().legacyReplay;
}

/**
 * True exactly once per session, for the first event any tab
 * sends in it. The flag is written before the event leaves, so
 * a second tab cannot claim it too.
 */
export function claimSessionStart(): boolean {
  const now = Date.now();
  const s = loadShared();
  if (!isLive(s, now) || s.started) return false;
  s.started = true;
  saveShared(s);
  return true;
}

/**
 * Segment indices name the stored object server-side, so they
 * have to be unique for the life of the session in this tab. A
 * reload keeps the tab state (sessionStorage) but resets module
 * state, so the counter is written through immediately: losing
 * an increment to a debounced save would let the next page load
 * overwrite a stored segment.
 */
export function nextReplaySegmentIndex(): number {
  if (!getSessionId()) return 0;
  const t = currentTab();
  const index = t.replaySegmentSeq;
  t.replaySegmentSeq = index + 1;
  saveTabNow(t);
  return index;
}

export function isSessionSampled(): boolean {
  const s = loadShared();
  return s?.sampled ?? true;
}

export function isReplaySampled(): boolean {
  const s = loadShared();
  return s?.replaySampled ?? true;
}

let activityHandler: (() => void) | null = null;
let visHandler: (() => void) | null = null;
let visibleTimer: ReturnType<typeof setInterval> | null = null;
let storageHandler: ((e: StorageEvent) => void) | null = null;
const ACTIVITY_EVENTS = ['click', 'keydown', 'touchstart', 'scroll'];

export function initSessionListeners() {
  if (typeof document === 'undefined') return;
  destroySessionListeners();
  // Scroll and key events come in bursts; one touch a second
  // is enough to keep a 15 minute timeout fresh.
  let lastTouch = 0;
  activityHandler = () => {
    const now = Date.now();
    if (now - lastTouch < ACTIVITY_WRITE_MS) return;
    lastTouch = now;
    touchSession();
  };
  for (const ev of ACTIVITY_EVENTS) {
    document.addEventListener(ev, activityHandler, {
      capture: true,
      passive: true,
    });
  }
  storageHandler = (e: StorageEvent) => {
    if (e.key === SHARED_KEY) sharedReadAt = 0;
  };
  window.addEventListener('storage', storageHandler);
  visHandler = () => {
    if (document.visibilityState === 'visible') {
      extendSession();
    } else if (memTab) {
      saveTabNow(memTab);
    }
  };
  document.addEventListener('visibilitychange', visHandler);
  // A tab on screen is in use even when the user only reads it, so it
  // keeps the session going while it stays visible.
  visibleTimer = setInterval(() => {
    if (document.visibilityState === 'visible') extendSession();
  }, VISIBLE_EXTEND_MS);
}

export function destroySessionListeners() {
  if (typeof document === 'undefined') return;
  if (activityHandler) {
    for (const ev of ACTIVITY_EVENTS) {
      document.removeEventListener(ev, activityHandler, {
        capture: true,
      } as EventListenerOptions);
    }
    activityHandler = null;
  }
  if (visHandler) {
    document.removeEventListener('visibilitychange', visHandler);
    visHandler = null;
  }
  if (visibleTimer) {
    clearInterval(visibleTimer);
    visibleTimer = null;
  }
  if (storageHandler) {
    window.removeEventListener('storage', storageHandler);
    storageHandler = null;
  }
}

export function incrementSessionCount(eventType: string) {
  if (!getSessionId()) return;
  const t = currentTab();
  if (eventType === 'view' || eventType === 'page_load') {
    t.viewCount++;
  } else if (eventType === 'error') {
    t.errorCount++;
  } else if (eventType === 'action') {
    t.actionCount++;
  }
  saveTabSoon(t);
}

export function getSessionCounts(): {
  viewCount: number;
  errorCount: number;
  actionCount: number;
} {
  const t = memTab ?? loadTab();
  return {
    viewCount: t?.viewCount ?? 0,
    errorCount: t?.errorCount ?? 0,
    actionCount: t?.actionCount ?? 0,
  };
}

/** Test hook: forget module state, as a page reload does. */
export function _resetSessionModule() {
  memShared = null;
  memTab = null;
  sharedReadAt = 0;
  lastActivityWrite = 0;
  renewListeners.clear();
  seenSessions.clear();
  if (tabSaveTimer) clearTimeout(tabSaveTimer);
  tabSaveTimer = null;
}
