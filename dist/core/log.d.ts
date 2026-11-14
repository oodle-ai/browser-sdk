/**
 * Marks the SDK's console wrappers, so SDK warnings can go to
 * the console method the wrapper replaced. They are shown to
 * the developer but not recorded as the app's console events.
 */
export declare const ORIGINAL = "__oodleOriginal";
export declare function sdkWarn(message: string): void;
