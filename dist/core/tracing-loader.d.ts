import type { OodleRumConfig } from './config';
type TracingInit = (config: OodleRumConfig) => Promise<void>;
export declare function setTracingInit(init: TracingInit): void;
export declare function getTracingInit(): TracingInit | undefined;
export {};
