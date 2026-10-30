declare interface NetworkBodiesConfig {
    urls: (string | RegExp)[];
    maxBodySize?: number;
}

declare interface NetworkHeadersConfig {
    urls: (string | RegExp)[];
}

export declare const OodleRum: {
    init(config: OodleRumConfig): void;
    setTags(tags: Record<string, string>): void;
    identify(user: UserInfo): void;
    trackEvent(name: string, properties?: Record<string, unknown>): void;
    addFeatureFlag(name: string, value: string): void;
    getSessionId(): string;
    getUserId(): string;
    flush(): void;
    stop(): void;
};

export declare interface OodleRumConfig {
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
    viewUrlQueryParams?: readonly string[];
    openTelemetry?: boolean | OtelConfig;
    flushIntervalMs?: number;
    replayFlushIntervalMs?: number;
    shouldSendData?: () => boolean;
    replayIdlePauseMs?: number;
    replayIdleExpireMs?: number;
}

export declare interface OtelConfig {
    enabled: boolean;
    tracesEndpoint?: string;
    customAttributes?: Record<string, string>;
}

export declare interface UserInfo {
    id: string;
    name?: string;
    email?: string;
}

export { }
