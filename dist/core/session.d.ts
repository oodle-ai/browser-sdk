export declare function setSampleRates(sessionRate: number, replayRate: number): void;
export declare function getSessionId(): string;
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
export declare function nextReplaySegmentIndex(): number;
export declare function isSessionSampled(): boolean;
export declare function isReplaySampled(): boolean;
export declare function touchSession(): void;
export declare function initSessionListeners(): void;
export declare function destroySessionListeners(): void;
export declare function incrementSessionCount(eventType: string): void;
export declare function getSessionCounts(): {
    viewCount: number;
    errorCount: number;
    actionCount: number;
};
