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

type Listener = () => void;

const listeners = new Set<Listener>();
let pendingRequests = 0;
let observer: MutationObserver | null = null;

function notify() {
  for (const l of listeners) {
    try {
      l();
    } catch {
      // One listener must not stop the others.
    }
  }
}

function ensureObserver() {
  if (observer || typeof MutationObserver === 'undefined') return;
  if (typeof document === 'undefined' || !document.documentElement) {
    return;
  }
  observer = new MutationObserver(notify);
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

export function requestStarted() {
  pendingRequests++;
  notify();
}

export function requestEnded() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  notify();
}

export function pendingRequestCount(): number {
  return pendingRequests;
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
      if (pendingRequests > 0) {
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

  function onActivity() {
    lastActivity = Date.now();
    armIdle();
  }

  listeners.add(onActivity);
  ensureObserver();
  if (pendingRequests > 0) lastActivity = startMs;
  armIdle();
  maxTimer = setTimeout(() => {
    finish({
      endMs: lastActivity,
      hadActivity: lastActivity !== null,
      timedOut: true,
    });
  }, maxWaitMs);

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
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
