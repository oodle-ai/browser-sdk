import { type ActionTextMode, type ConsoleLevel, type MessageMode, type QueryStringMode, type ReferrerMode, type UserAgentMode, type UserInfoMode } from './privacy';
export interface NetworkBodiesConfig {
    urls: (string | RegExp)[];
    maxBodySize?: number;
}
export interface NetworkHeadersConfig {
    urls: (string | RegExp)[];
}
/**
 * An event as it is sent. `event_type` is one of `view`,
 * `page_load`, `action`, `error`, `console`, `resource`,
 * `long_task`, `custom` or `visibility`; the other fields
 * depend on it.
 */
export interface RumEvent {
    event_type: string;
    session_id: string;
    timestamp: string;
    [field: string]: unknown;
}
/** What `beforeSendNetwork` gets for one request. */
export interface NetworkCapture {
    /** The request URL as it is sent: no query, path masked. */
    url: string;
    method: string;
    /** 0 when the request failed. */
    status: number;
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    requestBody?: string;
    responseBody?: string;
}
export interface OtelConfig {
    enabled: boolean;
    tracesEndpoint?: string;
    customAttributes?: Record<string, string>;
}
export interface OodleRumConfig {
    instanceId: string;
    apiKey: string;
    endpoint: string;
    service: string;
    env?: string;
    version?: string;
    sessionReplay?: boolean;
    sessionSampleRate?: number;
    replaySampleRate?: number;
    privacyLevel?: 'mask-user-input' | 'mask' | 'allow';
    allowedTracingUrls?: (string | RegExp)[];
    forwardNetworkBodies?: NetworkBodiesConfig;
    forwardNetworkHeaders?: NetworkHeadersConfig;
    /**
     * More header names that are never sent, on top of the built-in
     * list (authorization, cookies, API keys and client IP headers
     * such as x-forwarded-for). A string matches the whole name,
     * ignoring case; a RegExp is tested against the lowercase name.
     * Applies to request and response headers.
     */
    redactHeaders?: readonly (string | RegExp)[];
    /**
     * More JSON or form body keys whose values are replaced with
     * `[REDACTED]`, on top of the built-in list (passwords,
     * tokens, secrets, card data, SSNs, IP addresses). A string
     * matches the whole key, ignoring case, `-`, `_` and `.`; a
     * RegExp is tested against the key as written.
     */
    redactBodyKeys?: readonly (string | RegExp)[];
    /**
     * Changes or removes the headers and bodies captured by
     * `forwardNetworkHeaders` and `forwardNetworkBodies` before
     * they are sent. Change the object it gets and return nothing,
     * or return a new one. Return `null` to send none of them. The
     * request's timing event is sent either way. If it throws, no
     * headers or bodies are sent. `url`, `method` and `status` are
     * for reading only.
     */
    beforeSendNetwork?: (capture: NetworkCapture) => NetworkCapture | null | void;
    tags?: Record<string, string>;
    /**
     * Query parameter names to keep in `view_url`. All other
     * parameters are dropped, because a query string can hold
     * tokens or personal data. Keep only IDs that the app puts in
     * the URL to address a page state, such as the selected record.
     * Names match exactly (case-sensitive). The kept parameters are
     * on every event, because every event carries `view_url`.
     */
    viewUrlQueryParams?: readonly string[];
    /**
     * Route templates whose `:name` segments replace the matching
     * parts of URL paths before they are sent, for example
     * `'/projects/:projectId/tables/:tableId'`. A trailing `/*`
     * replaces all further segments with `*`. The first matching
     * pattern wins; a path that matches none is sent unchanged.
     * Applies to `view_url`, `view_url_path`, `referrer_url`,
     * `resource_url`, the replay page URL and span `url.full`.
     */
    urlPathPatterns?: readonly string[];
    /**
     * Rewrites URL paths before they are sent, after
     * `urlPathPatterns`. Gets and returns a path such as
     * `/projects/acme`. If it throws or returns a non-string, the
     * path is sent as `/:redacted`. Applies where
     * `urlPathPatterns` does.
     */
    maskUrlPath?: (path: string) => string;
    /**
     * What `referrer_url` holds: `'path'` (default) the origin and
     * path, `'origin'` the origin only, `'none'` nothing.
     */
    referrerUrl?: ReferrerMode;
    /**
     * Console levels recorded as console events. Default
     * `['error', 'warn']`; `[]` records no console output.
     */
    consoleLevels?: readonly ConsoleLevel[];
    /**
     * What error and console messages hold: `'full'` (default) as
     * written, `'scrub'` with quoted strings, URLs, emails, IDs and
     * long numbers replaced, `'none'` no message text. Stack
     * frames are kept in every mode.
     */
    errorMessages?: MessageMode;
    /**
     * `'mask'` sends no element text with click events (only the
     * tag, id and classes). Default `'mask'` when `privacyLevel` is
     * `'mask'`, otherwise `'full'`. Elements marked for masking or
     * hiding in replay never have their text sent.
     */
    actionText?: ActionTextMode;
    /**
     * `'none'` sends `user_agent` empty. `browser_name`, `os_name`
     * and `device_type` are still sent. Default `'full'`.
     */
    userAgent?: UserAgentMode;
    /**
     * Where query strings are removed. `'events'` (default) removes
     * them from event fields; the replay page URL and span
     * `url.full` keep the full URL. `'all'` removes them there too,
     * keeping only `viewUrlQueryParams` in the replay page URL.
     */
    stripQueryStrings?: QueryStringMode;
    /**
     * Which `identify()` fields are sent on events: `'full'`
     * (default) id, name and email; `'id'` the id only; `'none'`
     * none of them. `user_status` is always sent.
     */
    userInfo?: UserInfoMode;
    /**
     * Called with every event before it is queued. Change the
     * event and return nothing, return a new object, or return
     * `null` or `false` to drop it. If it throws, the event is
     * dropped. `session_id`, `event_type` and `timestamp` cannot be
     * changed. Session replay data does not pass through it.
     */
    beforeSend?: (event: RumEvent) => RumEvent | null | false | void;
    openTelemetry?: boolean | OtelConfig;
    flushIntervalMs?: number;
    replayFlushIntervalMs?: number;
    shouldSendData?: () => boolean;
    replayIdlePauseMs?: number;
    replayIdleExpireMs?: number;
}
/**
 * Returns false when the config was rejected, so init()
 * can stop rather than come up half-built: without a
 * stored config every getConfig() downstream throws.
 */
export declare function setConfig(config: OodleRumConfig): boolean;
/**
 * Keeps only an array of non-empty strings. The allowlist is read
 * for every event, so a wrong type must not reach it: a string
 * would match by substring and keep parameters it does not name,
 * and any other non-array value would throw and stop all events.
 */
export declare function normalizeQueryParamNames(value: unknown): readonly string[] | undefined;
export declare function getConfig(): OodleRumConfig;
