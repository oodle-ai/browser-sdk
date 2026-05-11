export declare function setSampleRates(sessionRate: number, replayRate: number): void;
export declare function getSessionId(): string;
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
