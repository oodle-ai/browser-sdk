import type { OodleRumConfig } from '../core/config';
export interface OtelConfig {
    enabled: boolean;
    tracesEndpoint?: string;
    customAttributes?: Record<string, string>;
}
export declare function initOtelTracing(config: OodleRumConfig): Promise<void>;
