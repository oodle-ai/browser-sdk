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
  viewUrlQueryParams?: string[];
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
  _config = {
    ...config,
    viewUrlQueryParams: normalizeQueryParamNames(
      config.viewUrlQueryParams,
    ),
  };
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
): string[] | undefined {
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
