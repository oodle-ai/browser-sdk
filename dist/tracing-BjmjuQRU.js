import { s as g } from "./index-00ga0Ug6.js";
async function E(e) {
  const t = e.openTelemetry;
  if (!t) return;
  const r = typeof t == "boolean" ? { enabled: t } : t;
  if (!r.enabled) return;
  let n, s, a, i, l, c, o;
  try {
    [
      n,
      s,
      a,
      i,
      l,
      c,
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
  } catch (y) {
    console.warn(
      "[@oodle-ai/rum] Failed to load OpenTelemetry. Browser tracing is off:",
      y
    );
    return;
  }
  const p = r.tracesEndpoint || `${e.endpoint}/v1/rum/traces`, T = {
    "service.name": e.service,
    ...e.env && {
      "deployment.environment": e.env
    },
    ...e.version && {
      "service.version": e.version
    },
    "oodle.instance_id": e.instanceId,
    ...r.customAttributes || {}
  }, v = i.resourceFromAttributes(
    T
  ), w = new s.OTLPTraceExporter({
    url: p,
    headers: {
      "X-OODLE-INSTANCE": e.instanceId,
      "X-API-KEY": e.apiKey
    }
  }), m = new n.WebTracerProvider({
    resource: v,
    spanProcessors: [
      new n.BatchSpanProcessor(
        w
      )
    ]
  }), u = A(e), d = [
    new RegExp(
      U(e.endpoint) + "/v1/rum/"
    )
  ];
  m.register({
    contextManager: new a.ZoneContextManager(),
    propagator: new c.W3CTraceContextPropagator()
  }), g(o.trace, o.context);
  const x = l.getWebAutoInstrumentations(
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
  ), { registerInstrumentations: b } = await import("@opentelemetry/instrumentation");
  b({
    instrumentations: x,
    tracerProvider: m
  }), console.debug(
    "[@oodle-ai/rum] OpenTelemetry tracing initialized, exporting to:",
    p
  );
}
function U(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function A(e) {
  return e.allowedTracingUrls && e.allowedTracingUrls.length > 0 ? e.allowedTracingUrls : [/.*/];
}
export {
  E as initOtelTracing
};
