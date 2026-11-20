/**
 * Sessions.
 *
 * One session is shared by every tab of the site, and its
 * record lives in localStorage. Each tab also has
 * its own state in sessionStorage: a tab id, its event counts
 * and its replay segment counter. Replay segments are keyed by
 * session and tab, so two tabs that share a session never
 * write the same object or mix two DOMs in one recording.
 *
 * A session ends after SESSION_TIMEOUT_MS without user
 * activity, or SESSION_MAX_DURATION_MS after it started. An
 * expired session is not renewed by background work (polling,
 * timers): only user activity or a page load starts the next
 * one. Until then getSessionId() returns '' and nothing is
 * recorded. Without this, a tab left open made a new session
 * every timeout, and session counts grew with idle tabs.
 *
 * A tab that was opened by an SDK before this model kept its
 * session in sessionStorage. That session is adopted, so an
 * upgrade in the middle of a session keeps its id, its start
 * is not counted again, and its replay keeps its old path.
 */
export declare const SESSION_TIMEOUT_MS: number;
export declare const SESSION_MAX_DURATION_MS: number;
export declare function generateId(): string;
export declare function setSampleRates(sessionRate: number, replayRate: number): void;
type RenewListener = (previousId: string, nextId: string) => void;
/**
 * Called when the session this tab records under changes:
 * this tab renewed it, or another tab did. The view module
 * ends the current view and starts one in the new session,
 * so no view spans two sessions.
 */
export declare function onSessionRenewed(cb: RenewListener): () => void;
/**
 * Records user activity. Starts a session when none is live:
 * a page load and a user action are what may start one.
 */
/**
 * Extends the live session without starting a new one. A tab that only
 * became or stayed visible keeps its session going, but it is no user
 * action, so it must not start the next session: switching back to an
 * idle tab would otherwise count as a new visit.
 */
export declare function extendSession(): void;
/** How often a visible tab extends its session while it stays visible. */
export declare const VISIBLE_EXTEND_MS = 60000;
export declare function touchSession(): void;
/**
 * The live session id, or '' when the session expired and no
 * user activity has started the next one. Never starts a
 * session by itself.
 */
export declare function getSessionId(): string;
/**
 * When the session `id` stopped being live: its last activity plus the
 * inactivity timeout, or its maximum duration, whichever comes first.
 * Null when the shared record is not that session (another tab renewed
 * it) or the session is still live.
 */
export declare function sessionEndedAt(id: string): number | null;
export declare function getTabId(): string;
/** True when this tab's replay keeps the pre-tab storage path. */
export declare function isLegacyReplayTab(): boolean;
/**
 * True exactly once per session, for the first event any tab
 * sends in it. The flag is written before the event leaves, so
 * a second tab cannot claim it too.
 */
export declare function claimSessionStart(): boolean;
/**
 * Segment indices name the stored object server-side, so they
 * have to be unique for the life of the session in this tab. A
 * reload keeps the tab state (sessionStorage) but resets module
 * state, so the counter is written through immediately: losing
 * an increment to a debounced save would let the next page load
 * overwrite a stored segment.
 */
export declare function nextReplaySegmentIndex(): number;
export declare function isSessionSampled(): boolean;
export declare function isReplaySampled(): boolean;
export declare function initSessionListeners(): void;
export declare function destroySessionListeners(): void;
export declare function incrementSessionCount(eventType: string): void;
export declare function getSessionCounts(): {
    viewCount: number;
    errorCount: number;
    actionCount: number;
};
/** Test hook: forget module state, as a page reload does. */
export declare function _resetSessionModule(): void;
export {};
