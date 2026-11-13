/**
 * Data minimization settings for what leaves the browser.
 *
 * Every option defaults to the behavior the SDK had before it
 * existed, so an app that sets none of them sends the same
 * events. The state lives here rather than being read through
 * getConfig() so that the helpers below are safe to call before
 * init() and from tests that never configure the SDK.
 */
export type ConsoleLevel = 'error' | 'warn';
export type ReferrerMode = 'path' | 'origin' | 'none';
export type MessageMode = 'full' | 'scrub' | 'none';
export type ActionTextMode = 'full' | 'mask';
export type UserAgentMode = 'full' | 'none';
export interface PrivacyOptions {
    urlPathPatterns?: readonly string[];
    maskUrlPath?: (path: string) => string;
    referrerUrl?: ReferrerMode;
    consoleLevels?: readonly ConsoleLevel[];
    errorMessages?: MessageMode;
    actionText?: ActionTextMode;
    userAgent?: UserAgentMode;
    privacyLevel?: string;
}
interface CompiledPattern {
    /** Literal segments, or `:name` for any one segment. */
    segs: string[];
    /** Ends in `*`: matches any number of further segments. */
    rest: boolean;
}
/** Placeholder for a path whose mask function failed. */
export declare const REDACTED_PATH = "/:redacted";
export declare function compilePathPattern(pattern: string): CompiledPattern | null;
export declare function configurePrivacy(opts: PrivacyOptions): void;
/** Test hook: back to the behavior with no options set. */
export declare function resetPrivacy(): void;
export declare function hasPathMasking(): boolean;
/**
 * The URL path with `urlPathPatterns` and `maskUrlPath`
 * applied. Called for every event, so it returns at once when
 * nothing is configured and caches results otherwise: the page
 * path rarely changes, and API paths repeat.
 */
export declare function maskPath(path: string): string;
/**
 * A request URL without its query string or fragment, with the
 * path masked. A relative URL stays relative (as the resolved
 * path) so that it does not gain an origin it never had; before
 * this, a relative URL failed to parse and was sent with its
 * query string intact.
 */
export declare function sanitizeResourceUrl(url: string, base?: string): string;
/**
 * Masks only the path of a full URL and keeps its query and
 * fragment. Used where the SDK sent the full URL before (the
 * replay page URL, span `url.full`), so that path masking does
 * not also change what else those fields hold.
 */
export declare function maskUrlPathOnly(url: string): string;
export declare function sanitizeReferrer(referrer: string): string;
export declare function consoleLevels(): readonly ConsoleLevel[];
export declare function messageMode(): MessageMode;
export declare function sendUserAgent(): boolean;
/**
 * Replaces the parts of a message that most often hold data
 * rather than describe the failure: quoted strings, URLs,
 * emails, IDs and long numbers. What is left still groups
 * errors of the same kind together.
 */
export declare function scrubMessage(msg: string): string;
/** A message as `errorMessages` says it may be sent. */
export declare function sanitizeMessage(msg: string): string;
/**
 * The stack with its message replaced to match
 * `sanitizeMessage`. V8 opens a stack with "Name: message";
 * the frames below hold script URLs and line numbers, which
 * are left alone so stacks still map to source.
 */
export declare function sanitizeStack(stack: string, rawMessage: string): string;
/**
 * Elements whose text the replay masks or omits. Click events
 * read the same markers so that text kept out of the replay
 * is not sent in an action instead. Kept here so the recorder
 * and click tracking cannot drift apart.
 */
export declare const BLOCK_SELECTOR: string;
export declare const MASK_TEXT_SELECTOR: string;
export declare function isActionTextMasked(el: Element): boolean;
export {};
