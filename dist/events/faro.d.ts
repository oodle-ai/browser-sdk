export declare function initEvents(): void;
/**
 * Records tab switches, so a replay can show that the user
 * left the tab and when (or whether) they came back.
 *
 * The two events carry no duration of their own: the time
 * away is the gap between a `tab_hidden` and the next
 * `tab_visible`. A session that ends while hidden simply
 * has no closing event, which reads correctly as "never
 * came back" rather than as a fabricated return.
 *
 * Registered from `init()` *before* `initTransportListeners`
 * rather than from `initEvents()` with the other producers.
 * Listeners fire in registration order, so going first means
 * the `tab_hidden` event is already queued when the
 * transport's own `visibilitychange` listener runs its exit
 * flush, and it leaves on that beacon. Registering later
 * would mean either losing the event whenever the tab is
 * discarded without being shown again (the case most worth
 * recording) or forcing a second beacon on every tab hide.
 * `setExitFlushHook` would also solve the ordering, but it
 * is a single slot and the replay recorder owns it.
 */
export declare function initVisibilityTracking(): void;
export declare function trackPageView(): void;
export declare function trackAction(type: string, target: string, selector: string, text: string, isFrustration: boolean, clickX?: number, clickY?: number): void;
export declare function trackCustomEvent(name: string, properties?: Record<string, unknown>): void;
export declare function destroyEvents(): void;
