import {
  configurePrivacy,
  type ActionTextMode,
  type ConsoleLevel,
  type MessageMode,
  type QueryStringMode,
  type ReferrerMode,
  type UserAgentMode,
  type UserInfoMode,
} from './privacy';

export interface NetworkBodiesConfig {
  urls: (string | RegExp)[];
  maxBodySize?: number;
}

export interface NetworkHeadersConfig {
  urls: (string | RegExp)[];
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
  privacyLevel?:
    | 'mask-user-input'
    | 'mask'
    | 'allow';
  allowedTracingUrls?: (string | RegExp)[];
  forwardNetworkBodies?: NetworkBodiesConfig;
  forwardNetworkHeaders?: NetworkHeadersConfig;
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
  openTelemetry?: boolean | OtelConfig;
  flushIntervalMs?: number;
  replayFlushIntervalMs?: number;
  shouldSendData?: () => boolean;
  replayIdlePauseMs?: number;
  replayIdleExpireMs?: number;
}

let _config: OodleRumConfig | null = null;

function isAllowedEndpoint(
  endpoint: string,
): boolean {
  try {
    const host = new URL(endpoint).hostname
      .toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.oodle.ai') ||
      host === 'oodle.ai'
    );
  } catch {
    return false;
  }
}

/**
 * Returns false when the config was rejected, so init()
 * can stop rather than come up half-built: without a
 * stored config every getConfig() downstream throws.
 */
export function setConfig(
  config: OodleRumConfig,
): boolean {
  if (!isAllowedEndpoint(config.endpoint)) {
    console.error(
      '[@oodle-ai/rum] endpoint must be on' +
        ' *.oodle.ai or localhost.' +
        ` Got: ${config.endpoint}`,
    );
    return false;
  }
  if (
    typeof window !== 'undefined' &&
    config.endpoint.startsWith('http://') &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    console.warn(
      '[@oodle-ai/rum] endpoint uses plain HTTP.' +
        ' Use HTTPS in production.',
    );
  }
  const viewUrlQueryParams = normalizeQueryParamNames(
    config.viewUrlQueryParams,
  );
  configurePrivacy({ ...config, viewUrlQueryParams });
  _config = { ...config, viewUrlQueryParams };
  return true;
}

/**
 * Keeps only an array of non-empty strings. The allowlist is read
 * for every event, so a wrong type must not reach it: a string
 * would match by substring and keep parameters it does not name,
 * and any other non-array value would throw and stop all events.
 */
export function normalizeQueryParamNames(
  value: unknown,
): readonly string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    console.warn(
      '[@oodle-ai/rum] viewUrlQueryParams must be an' +
        ' array of parameter names. It is ignored.',
    );
    return undefined;
  }
  const names = value.filter(
    (v): v is string => typeof v === 'string' && v !== '',
  );
  if (names.length !== value.length) {
    console.warn(
      '[@oodle-ai/rum] viewUrlQueryParams holds values' +
        ' that are not parameter names. They are ignored.',
    );
  }
  return names;
}

export function getConfig(): OodleRumConfig {
  if (!_config) {
    throw new Error(
      '[@oodle-ai/rum] Not initialized.' +
        ' Call OodleRum.init() first.',
    );
  }
  return _config;
}
