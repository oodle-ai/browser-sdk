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
    /** Full snapshots taken: start, checkout and re-base. */
    replay_full_snapshots: number;
    replay_snapshot_ms_total: number;
    /** Longest single full snapshot since the last flush. */
    replay_snapshot_ms_max: number;
}
export declare function incrTelemetry(key: keyof TelemetryCounters, amount?: number): void;
/**
 * Records one full snapshot's duration. Rounded to whole
 * milliseconds; finer is noise at this scale.
 */
export declare function recordSnapshotTelemetry(ms: number): void;
export declare function initTelemetry(): void;
export declare function destroyTelemetry(): void;
export {};
