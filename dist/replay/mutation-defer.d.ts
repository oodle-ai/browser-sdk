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
 *   node (click, input, focus), so the target already has an
 *   id. The capture listeners below handle that: they run on
 *   `window`, before rrweb's own listeners on `document`.
 *
 * Wired in at build time: a Vite plugin rewrites rrweb's
 * `initMutationObserver` to pass its (error-wrapped)
 * callback through `wrapMutationCallback`. rrweb rejects a patched global
 * `MutationObserver` (it fetches a clean one from an
 * iframe), so swapping the global would not work.
 */
type MutationCallback = (records: MutationRecord[], observer: MutationObserver) => void;
/**
 * Called by the patched rrweb for every MutationObserver it
 * creates (document, shadow roots, same-origin iframes).
 * While deferral is off the callback runs as rrweb wrote it.
 */
export declare function wrapMutationCallback(cb: MutationCallback): MutationCallback;
/**
 * Hands every queued record to rrweb now. Safe to call at any
 * time, including from inside a callback it triggers.
 */
export declare function flushDeferredMutations(): void;
/** Drops queued records without processing them. */
export declare function discardDeferredMutations(): void;
export declare function hasDeferredMutations(): boolean;
/**
 * Turns deferral on or off. Turning it off flushes first, so
 * no record is left behind.
 */
export declare function setMutationDeferral(on: boolean): void;
export {};
