interface TelemetryCounters {
    events_rate_limited: number;
    events_should_send_dropped: number;
    send_failures: number;
    compression_failures: number;
    retry_drops: number;
}
export declare function incrTelemetry(key: keyof TelemetryCounters, amount?: number): void;
export declare function initTelemetry(): void;
export declare function destroyTelemetry(): void;
export {};
