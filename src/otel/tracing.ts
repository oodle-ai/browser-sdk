import type { OodleRumConfig } from '../core/config';
import { setOtelApi } from '../core/otel-bridge';

export interface OtelConfig {
  enabled: boolean;
  tracesEndpoint?: string;
  customAttributes?: Record<string, string>;
}

export async function initOtelTracing(
  config: OodleRumConfig,
): Promise<void> {
  const otelOpt = config.openTelemetry;
  if (!otelOpt) return;

  const otelConfig: OtelConfig =
    typeof otelOpt === 'boolean'
      ? { enabled: otelOpt }
      : otelOpt;

  if (!otelConfig.enabled) return;

  let sdkTraceWeb: typeof import(
    '@opentelemetry/sdk-trace-web'
  );
  let otlpExporter: typeof import(
    '@opentelemetry/exporter-trace-otlp-http'
  );
  let contextZone: typeof import(
    '@opentelemetry/context-zone'
  );
  let resources: typeof import(
    '@opentelemetry/resources'
  );
  let autoInstrumentations: typeof import(
    '@opentelemetry/auto-instrumentations-web'
  );
  let core: typeof import(
    '@opentelemetry/core'
  );
  let otelApi: typeof import(
    '@opentelemetry/api'
  );

  try {
    [
      sdkTraceWeb,
      otlpExporter,
      contextZone,
      resources,
      autoInstrumentations,
      core,
      otelApi,
    ] = await Promise.all([
      import('@opentelemetry/sdk-trace-web'),
      import(
        '@opentelemetry/exporter-trace-otlp-http'
      ),
      import('@opentelemetry/context-zone'),
      import('@opentelemetry/resources'),
      import(
        '@opentelemetry/auto-instrumentations-web'
      ),
      import('@opentelemetry/core'),
      import('@opentelemetry/api'),
    ]);
  } catch (e) {
    console.warn(
      '[@oodle-ai/rum] OpenTelemetry peer deps' +
        ' not installed. Install them to enable' +
        ' browser tracing:\n' +
        '  npm install @opentelemetry/api' +
        ' @opentelemetry/auto-instrumentations-web' +
        ' @opentelemetry/sdk-trace-web' +
        ' @opentelemetry/exporter-trace-otlp-http' +
        ' @opentelemetry/context-zone' +
        ' @opentelemetry/resources zone.js',
    );
    return;
  }

  const tracesUrl =
    otelConfig.tracesEndpoint ||
    `${config.endpoint}/v1/rum/traces`;

  const resourceAttrs: Record<string, string> = {
    'service.name': config.service,
    ...(config.env && {
      'deployment.environment': config.env,
    }),
    ...(config.version && {
      'service.version': config.version,
    }),
    'oodle.instance_id': config.instanceId,
    ...(otelConfig.customAttributes || {}),
  };

  const resource =
    resources.resourceFromAttributes(
      resourceAttrs,
    );

  const exporter =
    new otlpExporter.OTLPTraceExporter({
      url: tracesUrl,
      headers: {
        'X-OODLE-INSTANCE': config.instanceId,
        'X-API-KEY': config.apiKey,
      },
    });

  const provider =
    new sdkTraceWeb.WebTracerProvider({
      resource,
      spanProcessors: [
        new sdkTraceWeb.BatchSpanProcessor(
          exporter,
        ),
      ],
    });

  const corsUrls = buildCorsUrls(config);
  const ignoreUrls = [
    new RegExp(
      escapeRegExp(config.endpoint) +
        '/v1/rum/',
    ),
  ];

  provider.register({
    contextManager:
      new contextZone.ZoneContextManager(),
    propagator:
      new core.W3CTraceContextPropagator(),
  });

  setOtelApi(otelApi.trace, otelApi.context);

  const instrumentations =
    autoInstrumentations.getWebAutoInstrumentations(
      {
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: corsUrls,
          ignoreUrls,
        },
        '@opentelemetry/instrumentation-xml-http-request':
          {
            propagateTraceHeaderCorsUrls:
              corsUrls,
            ignoreUrls,
          },
        '@opentelemetry/instrumentation-user-interaction':
          { enabled: false },
        '@opentelemetry/instrumentation-document-load':
          { enabled: false },
      },
    );

  const { registerInstrumentations } =
    await import(
      '@opentelemetry/instrumentation'
    );

  registerInstrumentations({
    instrumentations,
    tracerProvider: provider,
  });

  console.debug(
    '[@oodle-ai/rum] OpenTelemetry tracing' +
      ' initialized, exporting to:',
    tracesUrl,
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildCorsUrls(
  config: OodleRumConfig,
): (string | RegExp)[] {
  if (
    config.allowedTracingUrls &&
    config.allowedTracingUrls.length > 0
  ) {
    return config.allowedTracingUrls;
  }
  return [/.*/];
}
