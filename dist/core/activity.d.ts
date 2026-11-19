/**
 * Page activity: DOM mutations and network requests.
 *
 * A view's loading time and an action's duration both end
 * when the page stops doing work. The page is idle when no
 * request is pending and nothing changed for IDLE_MS. Both
 * measures use this one tracker, so a view and the click that
 * opened it agree on when the work ended.
 *
 * Requests are counted by the fetch and XHR wrappers
 * (`requestStarted` / `requestEnded`). Without the count, a
 * slow request with no DOM change in flight looks like idle
 * time, and a loading time ends before the data arrives.
 */
export declare const IDLE_MS = 100;
export declare const MAX_WAIT_MS = 10000;
export declare function requestStarted(): void;
export declare function requestEnded(): void;
export declare function pendingRequestCount(): number;
export interface ActivityResult {
    /** Epoch ms of the last activity, or null when there was none. */
    endMs: number | null;
    /** False when the page did nothing within IDLE_MS of the start. */
    hadActivity: boolean;
    /** True when activity went on past MAX_WAIT_MS. */
    timedOut: boolean;
}
/**
 * Calls `done` once the page is idle after `startMs`. The
 * caller can cancel with the returned function, for example
 * when a new view starts before the old one finished loading.
 */
export declare function waitForIdle(startMs: number, done: (r: ActivityResult) => void, maxWaitMs?: number): () => void;
export declare function resetActivity(): void;
