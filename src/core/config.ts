export interface NetworkBodiesConfig {
  urls: (string | RegExp)[];
  maxBodySize?: number;
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
  tags?: Record<string, string>;
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

export function setConfig(
  config: OodleRumConfig,
) {
  if (!isAllowedEndpoint(config.endpoint)) {
    console.error(
      '[@oodle-ai/rum] endpoint must be on' +
        ' *.oodle.ai or localhost.' +
        ` Got: ${config.endpoint}`,
    );
    return;
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
