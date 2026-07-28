const SESSION_KEY = '__oodle_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_MAX_DURATION_MS = 4 * 60 * 60 * 1000;

interface SessionData {
  id: string;
  createdAt: number;
  lastActivity: number;
  viewCount: number;
  errorCount: number;
  actionCount: number;
  sampled: boolean;
  replaySampled: boolean;
  replaySegmentSeq: number;
}

function generateId(): string {
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

function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      id: parsed.id,
      createdAt: parsed.createdAt ?? Date.now(),
      lastActivity: parsed.lastActivity ?? Date.now(),
      viewCount: parsed.viewCount ?? 0,
      errorCount: parsed.errorCount ?? 0,
      actionCount: parsed.actionCount ?? 0,
      sampled: parsed.sampled ?? true,
      replaySampled: parsed.replaySampled ?? true,
      replaySegmentSeq: parsed.replaySegmentSeq ?? 0,
    };
  } catch {
    return null;
  }
}

function writeSession(data: SessionData) {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify(data),
    );
  } catch {
    // storage unavailable
  }
}

let saveTimer: ReturnType<
  typeof setTimeout
> | null = null;

function saveSession(data: SessionData) {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    writeSession(data);
  }, 1000);
}

function saveSessionImmediate(
  data: SessionData,
) {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  writeSession(data);
}

let currentSession: SessionData | null = null;
let _sessionSampleRate = 100;
let _replaySampleRate = 100;

export function setSampleRates(
  sessionRate: number,
  replayRate: number,
) {
  _sessionSampleRate = Math.max(
    0,
    Math.min(100, sessionRate),
  );
  _replaySampleRate = Math.max(
    0,
    Math.min(100, replayRate),
  );
}

function rollSample(rate: number): boolean {
  return Math.random() * 100 < rate;
}

export function getSessionId(): string {
  const now = Date.now();

  if (!currentSession) {
    currentSession = loadSession();
  }

  if (
    !currentSession ||
    now - currentSession.lastActivity >
      SESSION_TIMEOUT_MS ||
    now - currentSession.createdAt >
      SESSION_MAX_DURATION_MS
  ) {
    const sampled =
      rollSample(_sessionSampleRate);
    currentSession = {
      id: generateId(),
      createdAt: now,
      lastActivity: now,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled,
      replaySampled:
        sampled &&
        rollSample(_replaySampleRate),
      replaySegmentSeq: 0,
    };
    saveSessionImmediate(currentSession);
  } else {
    currentSession.lastActivity = now;
    saveSession(currentSession);
  }

  return currentSession.id;
}

/**
 * Segment indices name the stored object server-side,
 * so they have to be unique for the life of the
 * session. A page reload keeps the session (it lives in
 * sessionStorage) but resets module state, so the
 * counter is persisted with the session rather than
 * held in the recorder. Written through immediately:
 * losing an increment to the debounced save would let
 * the next page load overwrite a stored segment.
 */
export function nextReplaySegmentIndex(): number {
  getSessionId();
  if (!currentSession) return 0;
  const index = currentSession.replaySegmentSeq;
  currentSession.replaySegmentSeq = index + 1;
  saveSessionImmediate(currentSession);
  return index;
}

export function isSessionSampled(): boolean {
  getSessionId();
  return currentSession?.sampled ?? true;
}

export function isReplaySampled(): boolean {
  getSessionId();
  return currentSession?.replaySampled ?? true;
}

export function touchSession() {
  if (currentSession) {
    currentSession.lastActivity = Date.now();
    saveSession(currentSession);
  }
}

let sessionVisHandler:
  | (() => void)
  | null = null;

export function initSessionListeners() {
  if (typeof document === 'undefined') return;
  destroySessionListeners();
  sessionVisHandler = () => {
    if (
      document.visibilityState === 'hidden' &&
      currentSession
    ) {
      saveSessionImmediate(currentSession);
    }
  };
  document.addEventListener(
    'visibilitychange',
    sessionVisHandler,
  );
}

export function destroySessionListeners() {
  if (
    sessionVisHandler &&
    typeof document !== 'undefined'
  ) {
    document.removeEventListener(
      'visibilitychange',
      sessionVisHandler,
    );
    sessionVisHandler = null;
  }
}

export function incrementSessionCount(
  eventType: string,
) {
  getSessionId();
  if (!currentSession) return;
  if (
    eventType === 'view' ||
    eventType === 'page_load'
  ) {
    currentSession.viewCount++;
  } else if (eventType === 'error') {
    currentSession.errorCount++;
  } else if (eventType === 'action') {
    currentSession.actionCount++;
  }
  saveSession(currentSession);
}

export function getSessionCounts(): {
  viewCount: number;
  errorCount: number;
  actionCount: number;
} {
  getSessionId();
  return {
    viewCount: currentSession?.viewCount ?? 0,
    errorCount: currentSession?.errorCount ?? 0,
    actionCount: currentSession?.actionCount ?? 0,
  };
}
