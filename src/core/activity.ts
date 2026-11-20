/**
 * Page activity: DOM mutations and network requests.
 *
 * A view's loading time and an action's duration both end
 * when the page stops doing work. The page is idle when no
 * request is pending and nothing changed for IDLE_MS. Both
 * measures use this one tracker, so a view and the click that
 * opened it agree on when the work ended.
 *
 * Requests are counted by the fetch and XHR wrappers
 * (`requestStarted` / `requestEnded`). Without the count, a
 * slow request with no DOM change in flight looks like idle
 * time, and a loading time ends before the data arrives.
 */

export const IDLE_MS = 100;
export const MAX_WAIT_MS = 10_000;

/**
 * What changed: a DOM change, or a request that started or ended. A
 * request carries its index, so a wait can ignore requests that were
 * already in flight when it began.
 */
type ActivityEvent =
  | { kind: 'dom' }
  | { kind: 'start'; index: number }
  | { kind: 'end'; index: number };
type Listener = (e: ActivityEvent) => void;

const listeners = new Set<Listener>();
let pendingRequests = 0;
let nextRequestIndex = 0;
let observer: MutationObserver | null = null;

function notify(e: ActivityEvent) {
  for (const l of listeners) {
    try {
      l(e);
    } catch {
      // One listener must not stop the others.
    }
  }
}

// One shared event: DOM changes come often, and need no fields.
const DOM_EVENT: ActivityEvent = { kind: 'dom' };
const notifyDom = () => notify(DOM_EVENT);

function ensureObserver() {
  if (observer || typeof MutationObserver === 'undefined') return;
  if (typeof document === 'undefined' || !document.documentElement) {
    return;
  }
  observer = new MutationObserver(notifyDom);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });
}

function releaseObserver() {
  if (listeners.size > 0 || !observer) return;
  observer.disconnect();
  observer = null;
}

/** Returns the request's index, to pass to `requestEnded`. */
export function requestStarted(): number {
  pendingRequests++;
  const index = nextRequestIndex++;
  notify({ kind: 'start', index });
  return index;
}

export function requestEnded(index: number) {
  pendingRequests = Math.max(0, pendingRequests - 1);
  notify({ kind: 'end', index });
}

export function pendingRequestCount(): number {
  return pendingRequests;
}

/**
 * Calls `onAny` on every DOM change and request start until the returned
 * function is called. A click watches the page from its pointer down,
 * as some controls (tabs, selects) change the page on pointer down,
 * before the click event fires.
 */
export function watchActivity(onAny: () => void): () => void {
  const listener: Listener = (e) => {
    if (e.kind !== 'end') onAny();
  };
  listeners.add(listener);
  ensureObserver();
  return () => {
    listeners.delete(listener);
    releaseObserver();
  };
}

export interface ActivityResult {
  /** Epoch ms of the last activity, or null when there was none. */
  endMs: number | null;
  /** False when the page did nothing within IDLE_MS of the start. */
  hadActivity: boolean;
  /** True when activity went on past MAX_WAIT_MS. */
  timedOut: boolean;
}

/**
 * Calls `done` once the page is idle after `startMs`. The
 * caller can cancel with the returned function, for example
 * when a new view starts before the old one finished loading.
 */
export function waitForIdle(
  startMs: number,
  done: (r: ActivityResult) => void,
  maxWaitMs = MAX_WAIT_MS,
): () => void {
  let lastActivity: number | null = null;
  // Only requests that start after the wait began are its work. A
  // request already in flight, such as a background poll, is neither a
  // response to a click nor a reason to keep waiting: counting it would
  // hide every dead click on a page that polls.
  const firstIndex = nextRequestIndex;
  let pending = 0;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;
  let finished = false;

  const finish = (r: ActivityResult) => {
    if (finished) return;
    finished = true;
    if (idleTimer) clearTimeout(idleTimer);
    if (maxTimer) clearTimeout(maxTimer);
    listeners.delete(onActivity);
    releaseObserver();
    done(r);
  };

  const armIdle = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (pending > 0) {
        armIdle();
        return;
      }
      finish({
        endMs: lastActivity,
        hadActivity: lastActivity !== null,
        timedOut: false,
      });
    }, IDLE_MS);
  };

  function onActivity(e: ActivityEvent) {
    if (e.kind !== 'dom') {
      if (e.index < firstIndex) return;
      pending = Math.max(0, pending + (e.kind === 'start' ? 1 : -1));
    }
    lastActivity = Date.now();
    armIdle();
  }

  listeners.add(onActivity);
  ensureObserver();
  armIdle();
  // An infinite wait has no timer: setTimeout would read Infinity as 0
  // and end the wait at once.
  if (Number.isFinite(maxWaitMs)) {
    maxTimer = setTimeout(() => {
      finish({
        endMs: lastActivity,
        hadActivity: lastActivity !== null,
        timedOut: true,
      });
    }, maxWaitMs);
  }

  return () => {
    finished = true;
    if (idleTimer) clearTimeout(idleTimer);
    if (maxTimer) clearTimeout(maxTimer);
    listeners.delete(onActivity);
    releaseObserver();
  };
}

export function resetActivity() {
  listeners.clear();
  pendingRequests = 0;
  nextRequestIndex = 0;
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
