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
    openTelemetry?: boolean | OtelConfig;
    flushIntervalMs?: number;
    replayFlushIntervalMs?: number;
    shouldSendData?: () => boolean;
    replayIdlePauseMs?: number;
    replayIdleExpireMs?: number;
}
export declare function setConfig(config: OodleRumConfig): void;
export declare function getConfig(): OodleRumConfig;
