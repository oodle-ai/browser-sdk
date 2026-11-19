/**
 * The page URL without its query string, except for the
 * parameters in `viewUrlQueryParams`. Those stay, so that a
 * view records the page state the app keeps in the URL (for
 * example the record that a drawer shows).
 */
export declare function viewUrl(location: Pick<Location, 'origin' | 'pathname' | 'search'>, keep: readonly string[] | undefined): string;
export declare function initEvents(): void;
/**
 * Records rejections of zone.js promises. Called once zone.js
 * has loaded (browser tracing).
 *
 * zone.js replaces the global Promise, and the browser fires
 * no `unhandledrejection` for a promise it did not create.
 * zone.js's own bridge to that event does not work either: by
 * default it hands the bare error to a `PromiseRejectionEvent`
 * constructor, which throws for want of a promise, and the
 * throw is swallowed. So no listener, however it was added,
 * hears about these rejections. zone.js does call the handler
 * in this slot, so the SDK wraps it.
 *
 * The native listener stays: promises zone.js does not own,
 * such as those async functions return, still fire the
 * browser's event. A rejection takes one path or the other,
 * so none is recorded twice.
 */
export declare function captureZoneRejections(): void;
/**
 * Records tab switches, so a replay can show that the user
 * left the tab and when (or whether) they came back.
 *
 * The two events carry no duration of their own: the time
 * away is the gap between a `tab_hidden` and the next
 * `tab_visible`. An unpaired hide is not evidence that the
 * user stayed away — far more often the tab died while
 * hidden — so consumers should read it as the end of what we
 * know, and everything below exists to make it rare.
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
 *
 * `tab_visible` gets its own flush because it has none of
 * that protection. The transport only flushes on the way
 * out, so a return event would otherwise sit in the batch
 * until the debounce elapsed, and the next thing to carry it
 * anywhere was the following hide's exit send: a beacon that
 * is skipped above `BEACON_MAX_BYTES`, falls back to a fetch
 * marked `keepalive: false` at exactly that size, and has no
 * retry queue behind it. Sessions came back with runs of
 * consecutive `tab_hidden` and no partner, which reads as
 * the user never returning. Flushing here instead sends it
 * while the page is alive and foregrounded, through the
 * retrying path.
 */
export declare function initVisibilityTracking(): void;
/**
 * The resource types. The browser's initiatorType says
 * which element asked (`link`, `img`, `script`), not what came
 * back, so the file extension decides when it is clearer.
 */
export declare function resourceType(initiator: string, url: string): string;
/**
 * The phases of a resource's waterfall. Zero when
 * the server sends no Timing-Allow-Origin header: the browser
 * then hides the phases of a cross-origin request.
 */
export declare function resourceTimingFields(r: PerformanceResourceTiming): Record<string, number>;
export declare function trackCustomEvent(name: string, properties?: Record<string, unknown>): void;
export declare function getDeviceType(ua: string): string;
export declare function getBrowserName(ua: string): string;
export declare function getBrowserVersion(ua: string): string;
/**
 * Checked before the desktop systems: an iPhone says "like Mac
 * OS X" and Android says "Linux".
 */
export declare function getOSName(ua: string): string;
export declare function getOSVersion(ua: string): string;
export declare function destroyEvents(): void;
