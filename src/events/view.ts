/**
 * Views.
 *
 * A view is one page the user is on: the first page load
 * (`initial_load`) or each change of path in a single page app
 * (`route_change`). It has a stable `view_id`. Its state is
 * sent many times: at start, when its numbers change (at most
 * every UPDATE_THROTTLE_MS), when the tab hides, and once more
 * at its end with `view_is_active` 0. Each send has a higher
 * `view_update_seq`, so a reader keeps the last one per
 * `view_id`. Counting rows instead counts updates, which is
 * what made page view counts several times too high.
 *
 * Only a change of path starts a view. Frameworks call
 * `history.replaceState` for scroll state and query changes;
 * when each of those was a view, one page showed as many.
 *
 * LCP, FCP, TTFB and FID belong to the page load, so only the
 * `initial_load` view has them. CLS and INP are measured per
 * view from the browser's entries, so a route change has its
 * own values and does not inherit the page's.
 */

import { onFCP, onFID, onLCP, onTTFB } from 'web-vitals';
import { maskPath } from '../core/privacy';
import {
  generateId,
  getSessionId,
  onSessionRenewed,
  sessionEndedAt,
} from '../core/session';
import { waitForIdle } from '../core/activity';

export const UPDATE_THROTTLE_MS = 3000;

export type EmitView = (
  data: Record<string, unknown>,
  sessionId: string,
) => void;

interface ViewState {
  id: string;
  sessionId: string;
  loadingType: 'initial_load' | 'route_change' | 'bf_cache';
  startEpoch: number;
  startPerf: number;
  url: string;
  urlPath: string;
  seq: number;
  active: boolean;
  /** Set when the view ended with its session: the session's end. */
  endEpoch?: number;
  /** The update that ended the view with its session was sent. */
  expirySent?: boolean;
  actionCount: number;
  errorCount: number;
  resourceCount: number;
  longTaskCount: number;
  frustrationCount: number;
  loadingTimeMs: number;
  vitals: Record<string, number>;
  cls: { value: number; windowValue: number; windowStart: number; last: number };
  interactions: Map<number, number>;
  cancelIdle: (() => void) | null;
}

let emit: EmitView | null = null;
let urlOf: (loc: Location) => string = (loc) => loc.href;
let current: ViewState | null = null;
let updateTimer: ReturnType<typeof setTimeout> | null = null;
let teardown: Array<() => void> = [];

function perfNow(): number {
  return typeof performance !== 'undefined' ? performance.now() : 0;
}

function timeOrigin(): number {
  if (typeof performance !== 'undefined' && performance.timeOrigin) {
    return performance.timeOrigin;
  }
  return Date.now();
}

/**
 * The part of the URL that names a view. Hash routers keep the
 * route in the fragment (`#/settings`), so a fragment that looks
 * like a path is part of it; an anchor (`#section`) is not.
 */
export function viewKey(loc: Location): string {
  const hash = loc.hash ?? '';
  const hashRoute = hash.startsWith('#/') ? hash.split('?')[0] : '';
  return loc.pathname + hashRoute;
}

function newView(
  loadingType: ViewState['loadingType'],
  startEpoch: number,
  startPerf: number,
): ViewState {
  return {
    id: generateId(),
    sessionId: getSessionId(),
    loadingType,
    startEpoch,
    startPerf,
    url: urlOf(window.location),
    urlPath: maskPath(window.location.pathname),
    seq: 0,
    active: true,
    actionCount: 0,
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    frustrationCount: 0,
    loadingTimeMs: 0,
    vitals: {},
    cls: { value: 0, windowValue: 0, windowStart: 0, last: 0 },
    interactions: new Map(),
    cancelIdle: null,
  };
}

function inpOf(v: ViewState): number {
  const durations = Array.from(v.interactions.values()).sort((a, b) => b - a);
  if (durations.length === 0) return 0;
  // The web-vitals rule: ignore one outlier per 50
  // interactions, so a page with many interactions is not
  // judged by its single worst one.
  const idx = Math.min(durations.length - 1, Math.floor(durations.length / 50));
  return durations[idx];
}

function viewData(v: ViewState): Record<string, unknown> {
  // A view that ended with its session is dated at the session's end,
  // not when the tab next woke up.
  const now = v.endEpoch ?? Date.now();
  const vitals = v.vitals;
  const isPageLoad = v.loadingType === 'initial_load' && v.loadingTimeMs > 0;
  return {
    // `page_load` keeps backends that predate view ids
    // counting the page load as before.
    event_type: isPageLoad ? 'page_load' : 'view',
    timestamp: new Date(now).toISOString(),
    view_id: v.id,
    view_loading_type: v.loadingType,
    view_update_seq: v.seq,
    view_is_active: v.active ? 1 : 0,
    view_start: new Date(v.startEpoch).toISOString(),
    view_time_spent_ms: Math.max(0, Math.round(now - v.startEpoch)),
    view_loading_time_ms: Math.round(v.loadingTimeMs),
    view_action_count: v.actionCount,
    view_error_count: v.errorCount,
    view_resource_count: v.resourceCount,
    view_long_task_count: v.longTaskCount,
    view_frustration_count: v.frustrationCount,
    view_url: v.url,
    view_url_path: v.urlPath,
    page_load_ms: Math.round(v.loadingTimeMs),
    lcp_ms: vitals.lcp ?? 0,
    fcp_ms: vitals.fcp ?? 0,
    ttfb_ms: vitals.ttfb ?? 0,
    fid_ms: vitals.fid ?? 0,
    inp_ms: inpOf(v),
    cls: Math.round(v.cls.value * 10000) / 10000,
    dns_ms: vitals.dns_ms ?? 0,
    connect_ms: vitals.connect_ms ?? 0,
    tls_ms: vitals.tls_ms ?? 0,
    download_ms: vitals.download_ms ?? 0,
    dom_interactive_ms: vitals.dom_interactive_ms ?? 0,
    dom_complete_ms: vitals.dom_complete_ms ?? 0,
  };
}

function sendUpdate(v: ViewState) {
  if (!emit || !v.sessionId) return;
  // A view lives no longer than its session. A tab left open used to
  // keep sending updates under its expired session (on each hide, on
  // each count), which stretched the session past its timeout and its
  // maximum length and grew the view's time spent for hours. The view
  // now ends at the session's end with one last update, and sends
  // nothing after it.
  if (v.endEpoch !== undefined) {
    if (v.expirySent) return;
    v.expirySent = true;
  } else if (v.active) {
    const ended = sessionEndedAt(v.sessionId);
    if (ended !== null) {
      v.active = false;
      v.endEpoch = Math.max(v.startEpoch, ended);
      v.expirySent = true;
      if (v.cancelIdle) v.cancelIdle();
      if (current === v) current = null;
    }
  }
  v.seq++;
  emit(viewData(v), v.sessionId);
}

/** Sends the current view's state now, cancelling a pending update. */
export function flushViewUpdate() {
  if (updateTimer) {
    clearTimeout(updateTimer);
    updateTimer = null;
  }
  if (current) sendUpdate(current);
}

function scheduleUpdate() {
  if (updateTimer || !current) return;
  updateTimer = setTimeout(() => {
    updateTimer = null;
    if (current) sendUpdate(current);
  }, UPDATE_THROTTLE_MS);
}

/**
 * Views that ended recently, by id. An action belongs to the view it
 * started in, and the click that changes the route ends after the next
 * view started, so its count still goes to the ended view. An ended
 * view keeps its counts open for 5 minutes.
 */
const ENDED_VIEW_KEEP_MS = 5 * 60_000;
const endedViews = new Map<string, { v: ViewState; until: number }>();

function rememberEnded(v: ViewState) {
  const now = Date.now();
  for (const [id, e] of endedViews) if (e.until <= now) endedViews.delete(id);
  endedViews.set(v.id, { v, until: now + ENDED_VIEW_KEEP_MS });
}

function endView() {
  const v = current;
  if (!v) return;
  rememberEnded(v);
  if (v.cancelIdle) v.cancelIdle();
  if (updateTimer) {
    clearTimeout(updateTimer);
    updateTimer = null;
  }
  v.active = false;
  sendUpdate(v);
  current = null;
}

function measureLoading(v: ViewState) {
  v.cancelIdle = waitForIdle(v.startEpoch, (r) => {
    v.cancelIdle = null;
    if (current !== v) return;
    let loading = r.endMs !== null && !r.timedOut ? r.endMs - v.startEpoch : 0;
    if (v.loadingType === 'initial_load') {
      // The page load is not over before the load event, even
      // when the DOM settled earlier.
      loading = Math.max(loading, v.vitals.load_event_ms ?? 0);
    }
    v.loadingTimeMs = Math.max(0, loading);
    flushViewUpdate();
  });
}

function startView(loadingType: ViewState['loadingType'], startEpoch: number, startPerf: number) {
  endView();
  const v = newView(loadingType, startEpoch, startPerf);
  if (!v.sessionId) return;
  current = v;
  sendUpdate(v);
  measureLoading(v);
}

export function currentViewId(): string {
  return current?.id ?? '';
}

export function currentViewPath(): string {
  return current?.urlPath ?? '';
}

/**
 * Counts an event against the view it happened in, so the
 * view carries its own counts.
 */
export function countInView(data: Record<string, unknown>) {
  const id = typeof data.view_id === 'string' ? data.view_id : '';
  let v = current;
  let ended = false;
  if (id && v?.id !== id) {
    const e = endedViews.get(id);
    if (!e || e.until <= Date.now()) return;
    v = e.v;
    ended = true;
  }
  if (!v) return;
  switch (data.event_type) {
    case 'action':
      v.actionCount++;
      if (data.is_frustration === 1) v.frustrationCount++;
      break;
    case 'error':
      v.errorCount++;
      break;
    case 'console':
      if (data.console_level === 'error') v.errorCount++;
      break;
    case 'resource':
      v.resourceCount++;
      break;
    case 'long_task':
      v.longTaskCount++;
      break;
    default:
      return;
  }
  // An ended view gets one more update with the new count; it stays
  // ended. Such counts are rare: a click that changed the route.
  if (ended) sendUpdate(v);
  else scheduleUpdate();
}

function collectNavigationTiming(v: ViewState) {
  const nav = performance.getEntriesByType?.('navigation')?.[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (!nav || nav.loadEventEnd <= 0) return false;
  const r = Math.round;
  v.vitals.load_event_ms = r(nav.loadEventEnd - nav.startTime);
  v.vitals.dns_ms = r(nav.domainLookupEnd - nav.domainLookupStart);
  v.vitals.connect_ms = r(nav.connectEnd - nav.connectStart);
  v.vitals.tls_ms = r(
    nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0,
  );
  v.vitals.download_ms = r(nav.responseEnd - nav.responseStart);
  v.vitals.dom_interactive_ms = r(nav.domInteractive - nav.startTime);
  v.vitals.dom_complete_ms = r(nav.domComplete - nav.startTime);
  return true;
}

function observe(type: string, cb: (entries: PerformanceEntry[]) => void, opts: Record<string, unknown> = {}) {
  if (typeof PerformanceObserver === 'undefined') return;
  try {
    const o = new PerformanceObserver((list) => cb(list.getEntries()));
    o.observe({ type, buffered: true, ...opts } as PerformanceObserverInit);
    teardown.push(() => o.disconnect());
  } catch {
    // Entry type not supported by this browser.
  }
}

/** CLS session windows: gaps of 1s close a window, 5s caps it. */
function addLayoutShift(v: ViewState, value: number, at: number) {
  const c = v.cls;
  if (c.windowValue > 0 && at - c.last < 1000 && at - c.windowStart < 5000) {
    c.windowValue += value;
  } else {
    c.windowValue = value;
    c.windowStart = at;
  }
  c.last = at;
  if (c.windowValue > c.value) c.value = c.windowValue;
}

function initPerViewVitals() {
  observe('layout-shift', (entries) => {
    const v = current;
    if (!v) return;
    let changed = false;
    for (const e of entries as any[]) {
      if (e.hadRecentInput || e.startTime < v.startPerf) continue;
      addLayoutShift(v, e.value, e.startTime);
      changed = true;
    }
    if (changed) scheduleUpdate();
  });
  observe(
    'event',
    (entries) => {
      const v = current;
      if (!v) return;
      let changed = false;
      for (const e of entries as any[]) {
        if (!e.interactionId || e.startTime < v.startPerf) continue;
        const prev = v.interactions.get(e.interactionId) ?? 0;
        if (e.duration > prev) {
          v.interactions.set(e.interactionId, e.duration);
          changed = true;
        }
      }
      if (changed) scheduleUpdate();
    },
    { durationThreshold: 40 },
  );
}

function initPageLoadVitals(v: ViewState) {
  const set = (k: string, value: number) => {
    if (current !== v && !v.active) return;
    v.vitals[k] = Math.round(value * 100) / 100;
    if (current === v) scheduleUpdate();
  };
  try {
    onLCP((m) => set('lcp', m.value));
    onFCP((m) => set('fcp', m.value));
    onTTFB((m) => set('ttfb', m.value));
    onFID((m) => set('fid', m.value));
  } catch {
    // web-vitals needs browser APIs a test DOM may lack.
  }
  let tries = 0;
  const tryNav = () => {
    if (collectNavigationTiming(v)) {
      if (current === v) scheduleUpdate();
    } else if (++tries < 50) {
      setTimeout(tryNav, 200);
    }
  };
  if (document.readyState === 'complete') setTimeout(tryNav, 0);
  else window.addEventListener('load', () => setTimeout(tryNav, 0), { once: true });
}

let lastKey = '';
// Set while the page is being left. Events still fire after pagehide
// (a last request, the replay flush), and without this each one would
// open a new view at the moment the page closes.
let pageLeft = false;

function onLocationChange() {
  const key = viewKey(window.location);
  if (key === lastKey) return;
  lastKey = key;
  startView('route_change', Date.now(), perfNow());
}

export function initViews(
  emitView: EmitView,
  viewUrl: (loc: Location) => string,
) {
  if (typeof window === 'undefined') return;
  destroyViews();
  pageLeft = false;
  emit = emitView;
  urlOf = viewUrl;
  lastKey = viewKey(window.location);

  const origin = timeOrigin();
  const first = newView('initial_load', origin, 0);
  if (first.sessionId) {
    current = first;
    sendUpdate(first);
    measureLoading(first);
    initPageLoadVitals(first);
  }
  initPerViewVitals();

  const origPush = history.pushState;
  const origReplace = history.replaceState;
  history.pushState = function (...args) {
    origPush.apply(this, args as any);
    onLocationChange();
  };
  history.replaceState = function (...args) {
    origReplace.apply(this, args as any);
    onLocationChange();
  };
  window.addEventListener('popstate', onLocationChange);
  window.addEventListener('hashchange', onLocationChange);

  // Hidden: the last chance to send while the page may die.
  // The view stays active; the user may come back.
  const onHidden = () => {
    if (document.visibilityState === 'hidden') flushViewUpdate();
  };
  document.addEventListener('visibilitychange', onHidden);
  const onPageHide = () => {
    endView();
    pageLeft = true;
  };
  window.addEventListener('pagehide', onPageHide);
  // A page restored from the back/forward cache is shown again
  // without a load, so it starts a view of its own.
  const onPageShow = (e: PageTransitionEvent) => {
    if (!e.persisted) return;
    pageLeft = false;
    lastKey = viewKey(window.location);
    startView('bf_cache', Date.now(), perfNow());
  };
  window.addEventListener('pageshow', onPageShow);

  const offRenew = onSessionRenewed((previousId) => {
    // The view that was open belongs to the old session; its
    // last update keeps that id. The next view starts in the
    // new session.
    if (current && current.sessionId === previousId) {
      endView();
    }
    lastKey = viewKey(window.location);
    startView('route_change', Date.now(), perfNow());
  });

  teardown.push(() => {
    history.pushState = origPush;
    history.replaceState = origReplace;
    window.removeEventListener('popstate', onLocationChange);
    window.removeEventListener('hashchange', onLocationChange);
    document.removeEventListener('visibilitychange', onHidden);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    offRenew();
  });
}

/**
 * Starts the first view after the session was created by a
 * later user action (the page loaded while the session was
 * expired and nothing was recorded until now).
 */
export function ensureView() {
  if (current || pageLeft || !emit || typeof window === 'undefined') return;
  lastKey = viewKey(window.location);
  startView('route_change', Date.now(), perfNow());
}

export function destroyViews() {
  endView();
  endedViews.clear();
  for (const fn of teardown) fn();
  teardown = [];
  emit = null;
  current = null;
}
