import { s as x, b as g } from "./tracing-loader-DVdE_ng2.js";
async function I(e) {
  const t = e.openTelemetry;
  if (!t) return;
  const r = typeof t == "boolean" ? { enabled: t } : t;
  if (!r.enabled) return;
  let n, s, a, l, i, p, o;
  try {
    [
      n,
      s,
      a,
      l,
      i,
      p,
      o
    ] = await Promise.all([
      import("@opentelemetry/sdk-trace-web"),
      import("@opentelemetry/exporter-trace-otlp-http"),
      import("@opentelemetry/context-zone"),
      import("@opentelemetry/resources"),
      import("@opentelemetry/auto-instrumentations-web"),
      import("@opentelemetry/core"),
      import("@opentelemetry/api")
    ]);
  } catch {
    console.warn(
      `[@oodle-ai/rum] OpenTelemetry peer deps not installed. Install them to enable browser tracing:
  npm install @opentelemetry/api @opentelemetry/auto-instrumentations-web @opentelemetry/sdk-trace-web @opentelemetry/exporter-trace-otlp-http @opentelemetry/context-zone @opentelemetry/resources zone.js`
    );
    return;
  }
  const c = r.tracesEndpoint || `${e.endpoint}/v1/rum/traces`, y = {
    "service.name": e.service,
    ...e.env && {
      "deployment.environment": e.env
    },
    ...e.version && {
      "service.version": e.version
    },
    "oodle.instance_id": e.instanceId,
    ...r.customAttributes || {}
  }, b = l.resourceFromAttributes(
    y
  ), T = new s.OTLPTraceExporter({
    url: c,
    headers: {
      "X-OODLE-INSTANCE": e.instanceId,
      "X-API-KEY": e.apiKey
    }
  }), m = new n.WebTracerProvider({
    resource: b,
    spanProcessors: [
      new n.BatchSpanProcessor(
        T
      )
    ]
  }), u = h(e), d = [
    new RegExp(
      U(e.endpoint) + "/v1/rum/"
    )
  ];
  m.register({
    contextManager: new a.ZoneContextManager(),
    propagator: new p.W3CTraceContextPropagator()
  }), x(o.trace, o.context);
  const w = i.getWebAutoInstrumentations(
    {
      "@opentelemetry/instrumentation-fetch": {
        propagateTraceHeaderCorsUrls: u,
        ignoreUrls: d
      },
      "@opentelemetry/instrumentation-xml-http-request": {
        propagateTraceHeaderCorsUrls: u,
        ignoreUrls: d
      },
      "@opentelemetry/instrumentation-user-interaction": { enabled: !1 },
      "@opentelemetry/instrumentation-document-load": { enabled: !1 }
    }
  ), { registerInstrumentations: v } = await import("@opentelemetry/instrumentation");
  v({
    instrumentations: w,
    tracerProvider: m
  }), console.debug(
    "[@oodle-ai/rum] OpenTelemetry tracing initialized, exporting to:",
    c
  );
}
function U(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function h(e) {
  return e.allowedTracingUrls && e.allowedTracingUrls.length > 0 ? e.allowedTracingUrls : [/.*/];
}
g(I);
