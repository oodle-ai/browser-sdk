export declare function initEvents(): void;
export declare function trackPageView(): void;
export declare function trackAction(type: string, target: string, selector: string, text: string, isFrustration: boolean, clickX?: number, clickY?: number): void;
export declare function trackCustomEvent(name: string, properties?: Record<string, unknown>): void;
export declare function destroyEvents(): void;
