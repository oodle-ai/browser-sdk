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
  _config = config;
  return true;
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
