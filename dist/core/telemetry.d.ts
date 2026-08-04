interface TelemetryCounters {
    events_rate_limited: number;
    events_should_send_dropped: number;
    send_failures: number;
    compression_failures: number;
    retry_drops: number;
    transport_drops: number;
    exit_send_failures: number;
    replay_events_dropped: number;
    replay_rebases: number;
    replay_overload_pauses: number;
    replay_expensive_snapshots: number;
    replay_attributes_throttled: number;
    replay_emit_errors: number;
}
export declare function incrTelemetry(key: keyof TelemetryCounters, amount?: number): void;
export declare function initTelemetry(): void;
export declare function destroyTelemetry(): void;
export {};
