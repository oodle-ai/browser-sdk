export declare function setOtelApi(traceApi: any, contextApi: any): void;
export declare function getActiveTraceContext(): {
    traceId: string;
    spanId: string;
} | null;
