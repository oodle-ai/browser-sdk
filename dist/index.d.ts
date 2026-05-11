import { type OodleRumConfig, type OtelConfig } from './core/config';
import { type UserInfo } from './core/user';
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
export type { OodleRumConfig, OtelConfig, UserInfo, };
