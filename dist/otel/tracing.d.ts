import type { OodleRumConfig } from '../core/config';
/**
 * Masks URL paths on spans as they end. Listed ahead of the
 * batch processor, which holds the same span object and
 * reads its attributes only when it exports.
 */
export declare const urlMaskingProcessor: {
    onStart(): void;
    onEnd(span: {
        attributes: Record<string, unknown>;
    }): void;
    forceFlush: () => Promise<void>;
    shutdown: () => Promise<void>;
};
export interface OtelConfig {
    enabled: boolean;
    tracesEndpoint?: string;
    customAttributes?: Record<string, string>;
}
export declare function initOtelTracing(config: OodleRumConfig): Promise<void>;
