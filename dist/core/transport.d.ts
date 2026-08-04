export declare const SDK_VERSION: string;
type Payload = Record<string, unknown>;
/**
 * Lets the replay recorder re-base its stream when the
 * transport has to throw a segment away. rrweb events
 * are deltas, so a dropped segment invalidates every
 * later event until a new full snapshot is taken.
 */
export declare function setReplayDropHandler(cb: () => void): void;
export declare function enqueue(batchKey: string, item: Payload, bytesHint?: number): void;
export declare function upsert(batchKey: string, key: string, item: Payload): void;
/**
 * Registers a producer that keeps its own buffer, so an
 * exit flush can collect from it before building the
 * envelope.
 *
 * A producer cannot do this from its own
 * `visibilitychange` listener. Listeners run in
 * registration order and the transport registers first,
 * so anything handed over from a later listener lands in
 * the queue after the exit flush has already run, and
 * then waits on the debounce while the page goes away.
 * `pagehide` has no second listener at all.
 */
export declare function setExitFlushHook(fn: (() => void) | null): void;
export declare function flushAll(isExit?: boolean): void;
export declare function isServerRateLimited(category: string): boolean;
export declare function setReinitCallback(cb: () => void): void;
export declare function initTransportListeners(): void;
export declare function destroyTransportListeners(): void;
export {};
