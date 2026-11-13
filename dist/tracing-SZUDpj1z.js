import { r as g, s as U, c as P, a as h } from "./index-ChlUV2RW.js";
const A = ["url.full", "http.url"], E = {
  onStart() {
  },
  onEnd(e) {
    const t = e.attributes;
    for (const r of A) {
      const o = t[r];
      typeof o == "string" && (t[r] = h(o));
    }
  },
  forceFlush: () => Promise.resolve(),
  shutdown: () => Promise.resolve()
};
async function I(e) {
  const t = e.openTelemetry;
  if (!t) return;
  const r = typeof t == "boolean" ? { enabled: t } : t;
  if (!r.enabled) return;
  let o, s, a, i, l, c, n;
  try {
    [
      o,
      s,
      a,
      i,
      l,
      c,
      n
    ] = await Promise.all([
      import("@opentelemetry/sdk-trace-web"),
      import("@opentelemetry/exporter-trace-otlp-http"),
      import("@opentelemetry/context-zone"),
      import("@opentelemetry/resources"),
      import("@opentelemetry/auto-instrumentations-web"),
      import("@opentelemetry/core"),
      import("@opentelemetry/api")
    ]);
  } catch (x) {
    console.warn(
      "[@oodle-ai/rum] Failed to load OpenTelemetry. Browser tracing is off:",
      x
    );
    return;
  }
  const p = r.tracesEndpoint || `${e.endpoint}/v1/rum/traces`, v = {
    "service.name": e.service,
    ...e.env && {
      "deployment.environment": e.env
    },
    ...e.version && {
      "service.version": e.version
    },
    "oodle.instance_id": e.instanceId,
    ...r.customAttributes || {}
  }, T = i.resourceFromAttributes(
    v
  ), w = new s.OTLPTraceExporter({
    url: p,
    headers: {
      "X-OODLE-INSTANCE": e.instanceId,
      "X-API-KEY": e.apiKey
    }
  }), u = new o.WebTracerProvider({
    resource: T,
    spanProcessors: [
      ...g() ? [E] : [],
      new o.BatchSpanProcessor(
        w
      )
    ]
  }), m = O(e), d = [
    new RegExp(
      C(e.endpoint) + "/v1/rum/"
    )
  ];
  u.register({
    contextManager: new a.ZoneContextManager(),
    propagator: new c.W3CTraceContextPropagator()
  }), U(n.trace, n.context), P();
  const y = l.getWebAutoInstrumentations(
    {
      "@opentelemetry/instrumentation-fetch": {
        propagateTraceHeaderCorsUrls: m,
        ignoreUrls: d
      },
      "@opentelemetry/instrumentation-xml-http-request": {
        propagateTraceHeaderCorsUrls: m,
        ignoreUrls: d
      },
      "@opentelemetry/instrumentation-user-interaction": { enabled: !1 },
      "@opentelemetry/instrumentation-document-load": { enabled: !1 }
    }
  ), { registerInstrumentations: b } = await import("@opentelemetry/instrumentation");
  b({
    instrumentations: y,
    tracerProvider: u
  }), console.debug(
    "[@oodle-ai/rum] OpenTelemetry tracing initialized, exporting to:",
    p
  );
}
function C(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function O(e) {
  return e.allowedTracingUrls && e.allowedTracingUrls.length > 0 ? e.allowedTracingUrls : [/.*/];
}
export {
  I as initOtelTracing,
  E as urlMaskingProcessor
};
