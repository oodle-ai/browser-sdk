declare interface NetworkBodiesConfig {
    urls: (string | RegExp)[];
    maxBodySize?: number;
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
    tags?: Record<string, string>;
}

export declare interface UserInfo {
    id: string;
    name?: string;
    email?: string;
}

export { }
