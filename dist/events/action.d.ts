/**
 * Click actions.
 *
 * A click is an action that lasts until the page stops doing
 * work because of it (see core/activity). The event is sent
 * when the action ends, with its loading time, how many errors,
 * resources and long tasks happened during it, and its
 * frustration types. Events that happen during the action carry
 * its `action_id`, which links an error to the click that
 * caused it.
 *
 * Frustrations:
 * - rage: RAGE_CLICKS or more clicks on one element within
 *   RAGE_WINDOW_MS. They are sent as one action.
 * - dead: a click on an element that is not a form field, after
 *   which the page did nothing.
 * - error: a JS error happened during the action.
 */
export declare const RAGE_CLICKS = 3;
export declare const RAGE_WINDOW_MS = 1000;
export type EmitAction = (data: Record<string, unknown>) => void;
/** The most recent action still in progress, for linking events. */
export declare function currentActionId(): string;
/** Counts an event against every action in progress. */
export declare function countInAction(data: Record<string, unknown>): void;
/**
 * Sends every click still in progress when the page goes away. A click
 * with no response ends within 100 ms, so one still waiting got a
 * response: it is sent as a click, with its loading time up to now.
 * Without this, the click that left the page, often a link, is lost.
 */
export declare function sendPendingOnExit(): void;
export declare function onPointerDown(): void;
export declare function onClick(e: MouseEvent): void;
export declare function initActions(emitAction: EmitAction): void;
export declare function destroyActions(): void;
