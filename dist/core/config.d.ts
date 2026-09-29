export interface NetworkBodiesConfig {
    urls: (string | RegExp)[];
    maxBodySize?: number;
}
export interface NetworkHeadersConfig {
    urls: (string | RegExp)[];
}
export interface OtelConfig {
    enabled: boolean;
    tracesEndpoint?: string;
    customAttributes?: Record<string, string>;
}
export interface OodleRumConfig {
    instanceId: string;
    apiKey: string;
    endpoint: string;
    service: string;
    env?: string;
    version?: string;
    sessionReplay?: boolean;
    sessionSampleRate?: number;
    replaySampleRate?: number;
    privacyLevel?: 'mask-user-input' | 'mask' | 'allow';
    allowedTracingUrls?: (string | RegExp)[];
    forwardNetworkBodies?: NetworkBodiesConfig;
    forwardNetworkHeaders?: NetworkHeadersConfig;
    tags?: Record<string, string>;
    /**
     * Query parameter names to keep in `view_url`. All other
     * parameters are dropped, because a query string can hold
     * tokens or personal data. Keep only IDs that the app puts in
     * the URL to address a page state, such as the selected record.
     * Names match exactly (case-sensitive). The kept parameters are
     * on every event, because every event carries `view_url`.
     */
    viewUrlQueryParams?: string[];
    openTelemetry?: boolean | OtelConfig;
    flushIntervalMs?: number;
    replayFlushIntervalMs?: number;
    shouldSendData?: () => boolean;
    replayIdlePauseMs?: number;
    replayIdleExpireMs?: number;
}
/**
 * Returns false when the config was rejected, so init()
 * can stop rather than come up half-built: without a
 * stored config every getConfig() downstream throws.
 */
export declare function setConfig(config: OodleRumConfig): boolean;
/**
 * Keeps only an array of non-empty strings. The allowlist is read
 * for every event, so a wrong type must not reach it: a string
 * would match by substring and keep parameters it does not name,
 * and any other non-array value would throw and stop all events.
 */
export declare function normalizeQueryParamNames(value: unknown): string[] | undefined;
export declare function getConfig(): OodleRumConfig;
