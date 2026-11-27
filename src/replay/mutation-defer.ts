/**
 * Moves rrweb's DOM-change processing out of the task that
 * changed the DOM.
 *
 * rrweb serializes every added node inside its
 * MutationObserver callback. That callback is a microtask
 * of whatever task changed the DOM, so when a click
 * re-renders a large table, the serialization runs before
 * the next paint and counts against the interaction's INP.
 * Here the callback only queues the records; rrweb gets them
 * when the browser is idle, and no later than
 * MAX_DELAY_MS.
 *
 * rrweb reads attributes and text from the live DOM when it
 * processes a record, not from the record, so a deferred
 * record yields the DOM as it is at processing time. Very
 * short-lived states are lost, never invented, and nodes
 * added and removed in between are skipped by rrweb's own
 * checks.
 *
 * Ordering rules the recorder must keep:
 * - flush before taking a full snapshot, or the queued
 *   records would describe changes the snapshot already
 *   contains;
 * - flush before stopping rrweb, so the last changes are
 *   kept;
 * - flush before rrweb records an event that names a target
 *   node (click, input, focus), if the target has no id yet
 *   because it was added by a queued change. The capture
 *   listeners below handle that: they run on `window`,
 *   before rrweb's own listeners on `document`. A target
 *   that already has an id needs no flush; flushing anyway
 *   would make each keystroke pay for the DOM changes the
 *   previous keystroke caused.
 *
 * Wired in at build time: a Vite plugin rewrites rrweb's
 * `initMutationObserver` to pass its (error-wrapped)
 * callback through `wrapMutationCallback`. rrweb rejects a patched global
 * `MutationObserver` (it fetches a clean one from an
 * iframe), so swapping the global would not work.
 */

type MutationCallback = (
  records: MutationRecord[],
  observer: MutationObserver,
) => void;

interface Pending {
  cb: MutationCallback;
  records: MutationRecord[];
  observer: MutationObserver;
}

/**
 * Upper bound on the wait. Matches the delay Datadog's
 * recorder uses for the same purpose.
 */
const MAX_DELAY_MS = 100;

/**
 * Used where requestIdleCallback is missing (Safari). One
 * frame is enough to get past the paint the change caused.
 */
const FALLBACK_DELAY_MS = 16;

/**
 * Events rrweb records with a target node id. Scroll and
 * mousemove are left out on purpose: they fire every frame
 * during a gesture, and flushing on them would put the work
 * back inside the gesture.
 */
const FLUSH_EVENTS = [
  'pointerdown',
  'pointerup',
  'mousedown',
  'mouseup',
  'touchstart',
  'touchend',
  'click',
  'dblclick',
  'contextmenu',
  // `focus`, not `focusin`: Chrome fires `focus` first, and
  // rrweb records that one. It does not bubble, but these
  // listeners run in the capture phase, which it does have.
  'focus',
  'input',
  'change',
  'submit',
] as const;

let enabled = false;
let queue: Pending[] = [];
let idleHandle: number | null = null;
let timeoutHandle: ReturnType<
  typeof setTimeout
> | null = null;
let listenersInstalled = false;
let flushing = false;
let isRecorded: ((node: Node) => boolean) | null = null;

/**
 * Called by the patched rrweb for every MutationObserver it
 * creates (document, shadow roots, same-origin iframes).
 * While deferral is off the callback runs as rrweb wrote it.
 */
export function wrapMutationCallback(
  cb: MutationCallback,
): MutationCallback {
  return (records, observer) => {
    if (!enabled) {
      cb(records, observer);
      return;
    }
    if (records.length === 0) return;
    // Consecutive deliveries for the same observer share an
    // entry, so one flush hands rrweb one batch.
    const last = queue[queue.length - 1];
    if (
      last &&
      last.cb === cb &&
      last.observer === observer
    ) {
      for (const r of records) last.records.push(r);
    } else {
      // The browser hands each callback a fresh array, so
      // keeping it is safe.
      queue.push({ cb, records, observer });
    }
    schedule();
  };
}

/**
 * Hands every queued record to rrweb now. Safe to call at any
 * time, including from inside a callback it triggers.
 */
export function flushDeferredMutations(): void {
  cancelScheduled();
  if (flushing) return;
  flushing = true;
  try {
    // A callback can trigger DOM changes of its own (rrweb
    // itself does not, but an emit handler might), which
    // queue new entries; keep going until the queue is
    // empty.
    while (queue.length > 0) {
      const batch = queue;
      queue = [];
      for (const p of batch) {
        try {
          p.cb(p.records, p.observer);
        } catch {
          // rrweb wraps its own callback; this only guards
          // the loop so one failure cannot strand the rest.
        }
      }
    }
  } finally {
    flushing = false;
  }
}

/** Drops queued records without processing them. */
export function discardDeferredMutations(): void {
  cancelScheduled();
  queue = [];
}

export function hasDeferredMutations(): boolean {
  return queue.length > 0;
}

/**
 * Turns deferral on or off. Turning it off flushes first, so
 * no record is left behind.
 *
 * `recorded` tells whether rrweb already has an id for a
 * node. Without it, every interaction flushes.
 */
export function setMutationDeferral(
  on: boolean,
  recorded?: (node: Node) => boolean,
): void {
  isRecorded = on ? (recorded ?? null) : null;
  if (on === enabled) return;
  if (!on) {
    flushDeferredMutations();
    removeListeners();
    enabled = false;
    return;
  }
  enabled = true;
  installListeners();
}

function schedule() {
  if (idleHandle !== null || timeoutHandle !== null) {
    return;
  }
  if (typeof requestIdleCallback === 'function') {
    idleHandle = requestIdleCallback(
      () => {
        idleHandle = null;
        flushDeferredMutations();
      },
      { timeout: MAX_DELAY_MS },
    );
    return;
  }
  timeoutHandle = setTimeout(() => {
    timeoutHandle = null;
    flushDeferredMutations();
  }, FALLBACK_DELAY_MS);
}

function cancelScheduled() {
  if (idleHandle !== null) {
    if (typeof cancelIdleCallback === 'function') {
      cancelIdleCallback(idleHandle);
    }
    idleHandle = null;
  }
  if (timeoutHandle !== null) {
    clearTimeout(timeoutHandle);
    timeoutHandle = null;
  }
}

function onFlushEvent(e: Event) {
  if (queue.length === 0) return;
  if (isRecorded) {
    // The innermost target, also inside a shadow root (on
    // window, `target` is retargeted to the host).
    const path =
      typeof e.composedPath === 'function'
        ? e.composedPath()
        : [];
    const target = (path[0] ?? e.target) as Node | null;
    try {
      if (target && isRecorded(target)) return;
    } catch {
      // Fall through and flush.
    }
  }
  flushDeferredMutations();
}

const LISTENER_OPTS: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

function installListeners() {
  if (listenersInstalled) return;
  if (typeof window === 'undefined') return;
  for (const type of FLUSH_EVENTS) {
    window.addEventListener(
      type,
      onFlushEvent,
      LISTENER_OPTS,
    );
  }
  listenersInstalled = true;
}

function removeListeners() {
  if (!listenersInstalled) return;
  for (const type of FLUSH_EVENTS) {
    window.removeEventListener(
      type,
      onFlushEvent,
      LISTENER_OPTS,
    );
  }
  listenersInstalled = false;
}
