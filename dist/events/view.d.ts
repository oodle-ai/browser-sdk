/**
 * Views.
 *
 * A view is one page the user is on: the first page load
 * (`initial_load`) or each change of path in a single page app
 * (`route_change`). It has a stable `view_id`. Its state is
 * sent many times: at start, when its numbers change (at most
 * every UPDATE_THROTTLE_MS), when the tab hides, and once more
 * at its end with `view_is_active` 0. Each send has a higher
 * `view_update_seq`, so a reader keeps the last one per
 * `view_id`. Counting rows instead counts updates, which is
 * what made page view counts several times too high.
 *
 * Only a change of path starts a view. Frameworks call
 * `history.replaceState` for scroll state and query changes;
 * when each of those was a view, one page showed as many.
 *
 * LCP, FCP, TTFB and FID belong to the page load, so only the
 * `initial_load` view has them. CLS and INP are measured per
 * view from the browser's entries, so a route change has its
 * own values and does not inherit the page's.
 */
export declare const UPDATE_THROTTLE_MS = 3000;
export type EmitView = (data: Record<string, unknown>, sessionId: string) => void;
/**
 * The part of the URL that names a view. Hash routers keep the
 * route in the fragment (`#/settings`), so a fragment that looks
 * like a path is part of it; an anchor (`#section`) is not.
 */
export declare function viewKey(loc: Location): string;
/** Sends the current view's state now, cancelling a pending update. */
export declare function flushViewUpdate(): void;
export declare function currentViewId(): string;
export declare function currentViewPath(): string;
/**
 * Counts an event against the view it happened in, so the
 * view carries its own counts.
 */
export declare function countInView(data: Record<string, unknown>): void;
export declare function initViews(emitView: EmitView, viewUrl: (loc: Location) => string): void;
/**
 * Starts the first view after the session was created by a
 * later user action (the page loaded while the session was
 * expired and nothing was recorded until now).
 */
export declare function ensureView(): void;
export declare function destroyViews(): void;
