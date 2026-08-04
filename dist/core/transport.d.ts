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
export declare function flushAll(isExit?: boolean): void;
export declare function isServerRateLimited(category: string): boolean;
export declare function setReinitCallback(cb: () => void): void;
export declare function initTransportListeners(): void;
export declare function destroyTransportListeners(): void;
export {};
