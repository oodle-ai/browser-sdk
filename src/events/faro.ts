import {
  onLCP,
  onFID,
  onINP,
  onCLS,
  onFCP,
  onTTFB,
} from 'web-vitals';
import { getConfig } from '../core/config';
import type {
  NetworkBodiesConfig,
  NetworkHeadersConfig,
} from '../core/config';
import {
  getSessionId,
  incrementSessionCount,
  getSessionCounts,
  isSessionSampled,
} from '../core/session';
import {
  getUserId,
  getUserName,
  getUserEmail,
  getUserStatus,
} from '../core/user';
import { getFeatureFlags } from '../core/flags';
import {
  enqueue,
  upsert,
  flushAll,
  isServerRateLimited,
} from '../core/transport';
import { tryConsume } from '../core/rate-limiter';
import { incrTelemetry } from '../core/telemetry';
import {
  getActiveTraceContext,
} from '../core/otel-bridge';
import {
  isReplayActive,
  hasReplayFlushed,
} from '../replay/recorder';

let teardownFns: Array<() => void> = [];

let cachedContext: {
  device_type: string;
  browser_name: string;
  os_name: string;
  user_agent: string;
  language: string;
} | null = null;

const RATE_LIMITED_TYPES = [
  'error',
  'action',
  'console',
  'resource',
  'visibility',
];

function isRateLimited(
  eventType: string,
): boolean {
  if (
    !RATE_LIMITED_TYPES.includes(eventType)
  ) {
    return false;
  }
  if (isServerRateLimited(eventType)) {
    incrTelemetry('events_rate_limited');
    return true;
  }
  if (!tryConsume(eventType)) {
    incrTelemetry('events_rate_limited');
    return true;
  }
  return false;
}

function stripQuery(url: string): string {
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

function ensureCachedContext() {
  if (!cachedContext) {
    cachedContext = {
      device_type: getDeviceType(),
      browser_name: getBrowserName(),
      os_name: getOSName(),
      user_agent: navigator.userAgent,
      language: navigator.language,
    };
  }
}

function baseContext(): Record<string, unknown> {
  ensureCachedContext();
  const counts = getSessionCounts();
  const flags = getFeatureFlags();
  const config = getConfig();
  const ctx: Record<string, unknown> = {
    session_id: getSessionId(),
    user_id: getUserId(),
    user_name: getUserName(),
    user_email: getUserEmail(),
    user_status: getUserStatus(),
    service: config.service,
    env: config.env ?? '',
    version: config.version ?? '',
    timestamp: new Date().toISOString(),
    view_url:
      window.location.origin +
      window.location.pathname,
    view_url_host: window.location.hostname,
    view_url_path: window.location.pathname,
    referrer_url: stripQuery(document.referrer),
    device_type: cachedContext!.device_type,
    browser_name: cachedContext!.browser_name,
    os_name: cachedContext!.os_name,
    user_agent: cachedContext!.user_agent,
    language: cachedContext!.language,
    session_view_count: counts.viewCount,
    session_error_count: counts.errorCount,
    session_action_count: counts.actionCount,
    replay_id:
      isReplayActive() && hasReplayFlushed()
        ? getSessionId()
        : '',
  };
  if (Object.keys(flags).length > 0) {
    ctx.feature_flags = flags;
  }
  return ctx;
}

function scheduleIdleWork(fn: () => void) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn, { timeout: 1000 });
  } else {
    setTimeout(fn, 0);
  }
}

const EVENTS_BATCH_KEY = 'events';

function emitEvent(
  buildData: () => Record<string, unknown>,
) {
  if (!isSessionSampled()) return;
  if (isServerRateLimited('events')) return;
  const data = buildData();
  const eventType =
    data.event_type as string;
  if (isRateLimited(eventType)) return;
  incrementSessionCount(eventType);
  const ctx = baseContext();
  enqueue(
    EVENTS_BATCH_KEY,
    { ...ctx, ...data },
  );
}

function emitEventDeferred(
  buildData: () => Record<string, unknown>,
) {
  scheduleIdleWork(() =>
    emitEvent(buildData),
  );
}

function emitViewEvent(
  buildData: () => Record<string, unknown>,
) {
  if (!isSessionSampled()) return;
  if (isServerRateLimited('events')) return;
  const data = buildData();
  const eventType =
    data.event_type as string;
  incrementSessionCount(eventType);
  const ctx = baseContext();
  const viewId =
    (ctx.session_id as string) +
    ':' +
    ctx.view_url_path;
  upsert(
    EVENTS_BATCH_KEY,
    viewId,
    { ...ctx, ...data },
  );
}

export function initEvents() {
  initErrorTracking();
  initConsoleTracking();
  initWebVitals();
  initResourceTracking();
  initPageLoadTracking();
  initFetchPatching();
  initXHRPatching();
  initIframePatching();
  initLongTaskTracking();
  initViewMetricsVisibility();
}

function initErrorTracking() {
  const onError = (event: ErrorEvent) => {
    emitEvent(() => ({
      event_type: 'error',
      error_message: event.message ?? '',
      error_type:
        event.error?.name ?? 'Error',
      error_stack:
        event.error?.stack ?? '',
      error_source: 'source',
    }));
  };

  const onUnhandledRejection = (
    event: PromiseRejectionEvent,
  ) => {
    const reason = event.reason;
    emitEvent(() => ({
      event_type: 'error',
      error_message:
        reason?.message ?? String(reason),
      error_type:
        reason?.name ??
        'UnhandledRejection',
      error_stack: reason?.stack ?? '',
      error_source: 'promise',
    }));
  };

  window.addEventListener('error', onError);
  window.addEventListener(
    'unhandledrejection',
    onUnhandledRejection,
  );

  teardownFns.push(() => {
    window.removeEventListener('error', onError);
    window.removeEventListener(
      'unhandledrejection',
      onUnhandledRejection,
    );
  });
}

function safeStringify(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function initConsoleTracking() {
  const original = {
    error: console.error,
    warn: console.warn,
  };

  console.error = (...args: unknown[]) => {
    const msg = args
      .map(safeStringify)
      .join(' ');
    emitEvent(() => ({
      event_type: 'console',
      console_level: 'error',
      console_message: msg,
    }));
    original.error.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    const msg = args
      .map(safeStringify)
      .join(' ');
    emitEvent(() => ({
      event_type: 'console',
      console_level: 'warn',
      console_message: msg,
    }));
    original.warn.apply(console, args);
  };

  teardownFns.push(() => {
    console.error = original.error;
    console.warn = original.warn;
  });
}

const viewMetrics: Record<string, number> = {};
let viewFlushTimer: ReturnType<
  typeof setTimeout
> | null = null;
let viewFirstMetricAt = 0;
let viewLastSnapshot = '';

function flushViewMetrics() {
  const snap = JSON.stringify(viewMetrics);
  if (snap === viewLastSnapshot) return;
  viewLastSnapshot = snap;
  viewFirstMetricAt = 0;
  const loadMs =
    viewMetrics.page_load_ms ||
    viewMetrics.lcp ||
    viewMetrics.dom_complete_ms ||
    0;
  const hasLoadTiming = loadMs > 0;
  emitViewEvent(() => ({
    event_type: hasLoadTiming
      ? 'page_load'
      : 'view',
    page_load_ms: loadMs,
    lcp_ms: viewMetrics.lcp ?? 0,
    fid_ms: viewMetrics.fid ?? 0,
    inp_ms: viewMetrics.inp ?? 0,
    cls: viewMetrics.cls ?? 0,
    fcp_ms: viewMetrics.fcp ?? 0,
    ttfb_ms: viewMetrics.ttfb ?? 0,
    dns_ms: viewMetrics.dns_ms ?? 0,
    connect_ms: viewMetrics.connect_ms ?? 0,
    dom_interactive_ms:
      viewMetrics.dom_interactive_ms ?? 0,
    dom_complete_ms:
      viewMetrics.dom_complete_ms ?? 0,
  }));
}

function scheduleViewMetricsFlush() {
  const now = Date.now();
  if (!viewFirstMetricAt) viewFirstMetricAt = now;

  const elapsed = now - viewFirstMetricAt;
  const remaining = Math.max(0, 5000 - elapsed);

  if (viewFlushTimer) {
    clearTimeout(viewFlushTimer);
  }
  viewFlushTimer = setTimeout(() => {
    viewFlushTimer = null;
    flushViewMetrics();
  }, remaining);
}

function initViewMetricsVisibility() {
  if (typeof document === 'undefined') return;
  const handler = () => {
    if (document.visibilityState === 'hidden') {
      if (viewFlushTimer) {
        clearTimeout(viewFlushTimer);
        viewFlushTimer = null;
      }
      flushViewMetrics();
    }
  };
  document.addEventListener(
    'visibilitychange',
    handler,
  );
  teardownFns.push(() => {
    document.removeEventListener(
      'visibilitychange',
      handler,
    );
  });
}

/**
 * Records tab switches, so a replay can show that the user
 * left the tab and when (or whether) they came back.
 *
 * The two events carry no duration of their own: the time
 * away is the gap between a `tab_hidden` and the next
 * `tab_visible`. A session that ends while hidden simply
 * has no closing event, which reads correctly as "never
 * came back" rather than as a fabricated return.
 *
 * Registered from `init()` *before* `initTransportListeners`
 * rather than from `initEvents()` with the other producers.
 * Listeners fire in registration order, so going first means
 * the `tab_hidden` event is already queued when the
 * transport's own `visibilitychange` listener runs its exit
 * flush, and it leaves on that beacon. Registering later
 * would mean either losing the event whenever the tab is
 * discarded without being shown again (the case most worth
 * recording) or forcing a second beacon on every tab hide.
 * `setExitFlushHook` would also solve the ordering, but it
 * is a single slot and the replay recorder owns it.
 *
 * `tab_visible` gets its own flush because it has none of
 * that protection. The transport only flushes on the way
 * out, so a return event would otherwise sit in the batch
 * until the debounce elapsed, and the next thing to carry it
 * anywhere was the following hide's exit send: a beacon that
 * is skipped above `BEACON_MAX_BYTES`, falls back to a fetch
 * marked `keepalive: false` at exactly that size, and has no
 * retry queue behind it. Sessions came back with runs of
 * consecutive `tab_hidden` and no partner, which reads as
 * the user never returning. Flushing here instead sends it
 * while the page is alive and foregrounded, through the
 * retrying path.
 */
export function initVisibilityTracking() {
  if (typeof document === 'undefined') return;
  const handler = () => {
    const hidden =
      document.visibilityState === 'hidden';
    // Synchronous: emitEvent enqueues before flushAll
    // drains, so the event is in the batch it builds.
    emitEvent(() => ({
      event_type: 'visibility',
      action_type: hidden
        ? 'tab_hidden'
        : 'tab_visible',
    }));
    if (!hidden) flushAll();
  };
  document.addEventListener(
    'visibilitychange',
    handler,
  );
  teardownFns.push(() => {
    document.removeEventListener(
      'visibilitychange',
      handler,
    );
  });
}

function initWebVitals() {
  onLCP((m) => {
    viewMetrics.lcp = m.value;
    scheduleViewMetricsFlush();
  });
  onFID((m) => {
    viewMetrics.fid = m.value;
    scheduleViewMetricsFlush();
  });
  onINP((m) => {
    viewMetrics.inp = m.value;
    scheduleViewMetricsFlush();
  });
  onCLS((m) => {
    viewMetrics.cls = m.value;
    scheduleViewMetricsFlush();
  });
  onFCP((m) => {
    viewMetrics.fcp = m.value;
    scheduleViewMetricsFlush();
  });
  onTTFB((m) => {
    viewMetrics.ttfb = m.value;
    scheduleViewMetricsFlush();
  });
}

function isOodleInternalUrl(url: string): boolean {
  const endpoint = getConfig().endpoint;
  return url.startsWith(endpoint);
}

function initResourceTracking() {
  if (
    typeof PerformanceObserver === 'undefined'
  ) {
    return;
  }

  const observer = new PerformanceObserver(
    (list) => {
      for (const entry of list.getEntries()) {
        const res =
          entry as PerformanceResourceTiming;
        const initiator =
          res.initiatorType ?? '';

        if (
          initiator === 'fetch' ||
          initiator === 'xmlhttprequest'
        ) {
          continue;
        }

        if (isOodleInternalUrl(res.name)) {
          continue;
        }

        const url = stripQuery(res.name);
        const dur = res.duration;
        const sz = res.transferSize ?? 0;
        const init = initiator;
        emitEventDeferred(
          () => ({
            event_type: 'resource',
            resource_url: url,
            resource_method: '',
            resource_duration_ms: dur,
            resource_size: sz,
            resource_type: init,
          }),
        );
      }
    },
  );

  observer.observe({
    type: 'resource',
    buffered: true,
  });
  teardownFns.push(() => observer.disconnect());

  if (typeof performance !== 'undefined') {
    const onBufferFull = () => {
      performance.clearResourceTimings();
    };
    performance.addEventListener(
      'resourcetimingbufferfull',
      onBufferFull,
    );
    teardownFns.push(() => {
      performance.removeEventListener(
        'resourcetimingbufferfull',
        onBufferFull,
      );
    });
  }
}

function generateHexId(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) =>
      b.toString(16).padStart(2, '0'),
    )
    .join('');
}

function resolveUrl(url: string): string {
  try {
    return new URL(url, location.href).href;
  } catch {
    return url;
  }
}

function matchesUrlPattern(
  resolved: string,
  raw: string,
  patterns: (string | RegExp)[],
): boolean {
  return patterns.some((p) =>
    typeof p === 'string'
      ? resolved.startsWith(p) ||
        raw.startsWith(p)
      : p.test(resolved) || p.test(raw),
  );
}

interface UrlDecisions {
  resolved: string;
  trace: boolean;
  bodyCfg: NetworkBodiesConfig | null;
  captureHeaders: boolean;
}

function resolveUrlDecisions(
  url: string,
): UrlDecisions {
  const resolved = resolveUrl(url);
  const config = getConfig();

  let trace = false;
  const tracingUrls =
    config.allowedTracingUrls;
  if (tracingUrls && tracingUrls.length > 0) {
    trace = matchesUrlPattern(
      resolved,
      url,
      tracingUrls,
    );
  }

  let bodyCfg: NetworkBodiesConfig | null =
    null;
  const bodyConfig =
    config.forwardNetworkBodies;
  if (bodyConfig) {
    if (
      matchesUrlPattern(
        resolved,
        url,
        bodyConfig.urls,
      )
    ) {
      bodyCfg = bodyConfig;
    }
  }

  let captureHeaders = false;
  const hdrConfig =
    config.forwardNetworkHeaders;
  if (hdrConfig) {
    captureHeaders = matchesUrlPattern(
      resolved,
      url,
      hdrConfig.urls,
    );
  }

  return {
    resolved,
    trace,
    bodyCfg,
    captureHeaders,
  };
}

const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'proxy-authorization',
]);

function headersToRecord(
  h:
    | Headers
    | Record<string, string>
    | [string, string][]
    | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!h) return out;
  if (
    typeof (h as any).forEach === 'function' &&
    typeof (h as any).get === 'function'
  ) {
    (h as Headers).forEach((v, k) => {
      const lk = k.toLowerCase();
      if (!SENSITIVE_HEADERS.has(lk)) {
        out[lk] = v;
      }
    });
  } else if (Array.isArray(h)) {
    for (const [k, v] of h) {
      const lk = k.toLowerCase();
      if (!SENSITIVE_HEADERS.has(lk)) {
        out[lk] = v;
      }
    }
  } else {
    for (const k of Object.keys(
      h as Record<string, string>,
    )) {
      const lk = k.toLowerCase();
      if (!SENSITIVE_HEADERS.has(lk)) {
        out[lk] = (
          h as Record<string, string>
        )[k];
      }
    }
  }
  return out;
}

function parseRawHeaders(
  raw: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split('\r\n')) {
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const k = line
      .slice(0, idx)
      .trim()
      .toLowerCase();
    if (SENSITIVE_HEADERS.has(k)) continue;
    out[k] = line.slice(idx + 1).trim();
  }
  return out;
}

function truncateBody(
  body: string,
  maxSize: number,
): string {
  if (body.length <= maxSize) return body;
  return body.slice(0, maxSize);
}

async function readBodyLimited(
  response: Response,
  maxBytes: number,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    return text.slice(0, maxBytes);
  }

  const decoder = new TextDecoder();
  let result = '';
  while (result.length < maxBytes) {
    const { done, value } =
      await reader.read();
    if (done) break;
    result += decoder.decode(value, {
      stream: true,
    });
  }
  reader.cancel();
  return result.slice(0, maxBytes);
}

function extractUrl(
  input: RequestInfo | URL,
): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function captureReqHeaders(
  headers:
    | HeadersInit
    | undefined,
): string {
  if (!headers) return '';
  try {
    return JSON.stringify(
      headersToRecord(
        headers as
          | Headers
          | Record<string, string>
          | [string, string][],
      ),
    );
  } catch {
    return '';
  }
}

function captureResHeaders(
  headers: Headers,
): string {
  try {
    return JSON.stringify(
      headersToRecord(headers),
    );
  } catch {
    return '';
  }
}

interface FetchWrapOpts {
  injectTracing: boolean;
}

function isRequestLike(
  input: RequestInfo | URL,
): input is Request {
  return (
    input instanceof Request ||
    (typeof input === 'object' &&
      input !== null &&
      'method' in input &&
      'body' in input &&
      'clone' in input &&
      typeof (input as any).clone ===
        'function')
  );
}

function extractBodySync(
  init: RequestInit | undefined,
  input: RequestInfo | URL,
  maxSize: number,
): { sync: string; asyncP: Promise<string> | null } {
  if (init?.body) {
    if (typeof init.body === 'string') {
      return {
        sync: truncateBody(init.body, maxSize),
        asyncP: null,
      };
    }
    if (
      typeof URLSearchParams !== 'undefined' &&
      init.body instanceof URLSearchParams
    ) {
      return {
        sync: truncateBody(
          init.body.toString(),
          maxSize,
        ),
        asyncP: null,
      };
    }
    return { sync: '', asyncP: null };
  }
  if (
    isRequestLike(input) &&
    input.body !== null
  ) {
    const asyncP = input
      .clone()
      .text()
      .then((t) => truncateBody(t, maxSize))
      .catch(() => '');
    return { sync: '', asyncP };
  }
  return { sync: '', asyncP: null };
}

function wrapFetch(
  target: { fetch: typeof fetch },
  origFetch: typeof fetch,
  opts: FetchWrapOpts,
): () => void {
  // origFetch must always be invoked with `target` as the receiver, never
  // the caller's ambient `this`. This wrapper lives in the SDK's realm; when
  // strict-mode code inside a patched same-origin iframe calls a bare
  // fetch('relative/url'), `this` is undefined and the browser falls back to
  // the captured function's own realm to resolve relative URLs — which can be
  // the parent document, misrouting the request (e.g. Grafana-in-iframe
  // requests resolving against the parent page's path).
  const patched = function (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url = extractUrl(input);
    if (isOodleInternalUrl(url)) {
      return origFetch.apply(target, [
        input,
        init,
      ] as any);
    }

    const isReq = isRequestLike(input);
    const method = (
      init?.method ??
      (isReq ? input.method : 'GET')
    ).toUpperCase();
    const start = performance.now();
    const decisions =
      resolveUrlDecisions(url);

    let traceId = '';
    let spanId = '';
    if (opts.injectTracing) {
      const otelCtx =
        getActiveTraceContext();
      if (otelCtx) {
        traceId = otelCtx.traceId;
        spanId = otelCtx.spanId;
      } else if (decisions.trace) {
        traceId = generateHexId(16);
        spanId = generateHexId(8);
        const headers = new Headers(
          init?.headers ?? {},
        );
        headers.set(
          'traceparent',
          `00-${traceId}-${spanId}-01`,
        );
        init = { ...init, headers };
      }
    }

    let requestBody = '';
    let reqBodyP: Promise<string> | null = null;
    if (decisions.bodyCfg) {
      const maxSize =
        decisions.bodyCfg.maxBodySize ?? 65536;
      const extracted = extractBodySync(
        init,
        input,
        maxSize,
      );
      requestBody = extracted.sync;
      reqBodyP = extracted.asyncP;
    }

    let reqHdrsJson = '';
    if (decisions.captureHeaders) {
      if (init?.headers) {
        reqHdrsJson = captureReqHeaders(
          init.headers,
        );
      } else if (isReq) {
        reqHdrsJson = captureResHeaders(
          input.headers,
        );
      }
    }

    return origFetch
      .apply(target, [input, init] as any)
      .then((response: Response) => {
        const status = response.status;
        const dur = Math.round(
          performance.now() - start,
        );
        let resHdrsJson = '';
        if (decisions.captureHeaders) {
          resHdrsJson = captureResHeaders(
            response.headers,
          );
        }
        const emitBase = (
          resolvedReqBody: string,
        ) => {
          const d: Record<
            string,
            unknown
          > = {
            event_type: 'resource',
            resource_url: stripQuery(url),
            resource_method: method,
            resource_status: status,
            resource_duration_ms: dur,
            resource_size: 0,
            resource_type: 'fetch',
          };
          if (traceId) {
            d.trace_id = traceId;
            d.span_id = spanId;
          }
          if (resolvedReqBody) {
            d.request_body = resolvedReqBody;
          }
          if (reqHdrsJson) {
            d.request_headers = reqHdrsJson;
          }
          if (resHdrsJson) {
            d.response_headers =
              resHdrsJson;
          }
          return d;
        };

        const bodyReady: Promise<string> =
          reqBodyP
            ? reqBodyP
            : Promise.resolve(requestBody);

        if (decisions.bodyCfg) {
          const maxSize =
            decisions.bodyCfg.maxBodySize ??
            65536;
          Promise.all([
            bodyReady,
            readBodyLimited(
              response.clone(),
              maxSize,
            ).catch(() => ''),
          ])
            .then(([reqB, resB]) => {
              emitEvent(() => {
                const d = emitBase(reqB);
                if (resB) {
                  d.response_body = resB;
                }
                return d;
              });
            })
            .catch(() => {
              bodyReady.then((reqB) => {
                emitEvent(
                  () => emitBase(reqB),
                );
              });
            });
        } else {
          bodyReady.then((reqB) => {
            emitEvent(() => emitBase(reqB));
          });
        }
        return response;
      })
      .catch((err: unknown) => {
        const dur = Math.round(
          performance.now() - start,
        );
        const bodyReady: Promise<string> =
          reqBodyP
            ? reqBodyP
            : Promise.resolve(requestBody);
        bodyReady.then((reqB) => {
          emitEvent(() => {
            const d: Record<
              string,
              unknown
            > = {
              event_type: 'resource',
              resource_url: stripQuery(url),
              resource_method: method,
              resource_status: 0,
              resource_duration_ms: dur,
              resource_size: 0,
              resource_type: 'fetch',
            };
            if (traceId) {
              d.trace_id = traceId;
              d.span_id = spanId;
            }
            if (reqB) {
              d.request_body = reqB;
            }
            if (reqHdrsJson) {
              d.request_headers =
                reqHdrsJson;
            }
            return d;
          });
        });
        throw err;
      });
  };
  target.fetch = patched as typeof fetch;
  return () => {
    target.fetch = origFetch;
  };
}

interface XHRProtos {
  open: typeof XMLHttpRequest.prototype.open;
  send: typeof XMLHttpRequest.prototype.send;
  setRequestHeader: typeof XMLHttpRequest
    .prototype.setRequestHeader;
}

function wrapXHR(
  proto: XMLHttpRequest,
  origSetHeader: XHRProtos['setRequestHeader'],
  opts: FetchWrapOpts,
): () => void {
  const origOpen = proto.open;
  const origSend = proto.send;
  const origSH = origSetHeader;

  (proto as any).open = function (
    method: string,
    url: string | URL,
    async_?: boolean,
    username?: string | null,
    password?: string | null,
  ) {
    (this as any).__oodleMethod =
      method.toUpperCase();
    (this as any).__oodleUrl =
      typeof url === 'string'
        ? url
        : url.href;
    (this as any).__oodleReqHeaders =
      {} as Record<string, string>;
    return origOpen.call(
      this,
      method,
      url,
      async_ ?? true,
      username,
      password,
    );
  };

  (proto as any).setRequestHeader = function (
    name: string,
    value: string,
  ) {
    const hdrs =
      (this as any).__oodleReqHeaders;
    if (hdrs) {
      hdrs[name.toLowerCase()] = value;
    }
    return origSH.call(this, name, value);
  };

  (proto as any).send = function (
    body?:
      | Document
      | XMLHttpRequestBodyInit
      | null,
  ) {
    const xhrUrl =
      (this as any).__oodleUrl ?? '';
    if (isOodleInternalUrl(xhrUrl)) {
      return origSend.apply(this, [body]);
    }

    const xhrMethod =
      (this as any).__oodleMethod ?? 'GET';
    const decisions =
      resolveUrlDecisions(xhrUrl);

    let traceId = '';
    let spanId = '';
    if (opts.injectTracing) {
      const otelCtx =
        getActiveTraceContext();
      if (otelCtx) {
        traceId = otelCtx.traceId;
        spanId = otelCtx.spanId;
      } else if (decisions.trace) {
        traceId = generateHexId(16);
        spanId = generateHexId(8);
        origSH.call(
          this,
          'traceparent',
          `00-${traceId}-${spanId}-01`,
        );
      }
    }

    let requestBody = '';
    if (decisions.bodyCfg && body) {
      const maxSz =
        decisions.bodyCfg.maxBodySize ?? 65536;
      if (typeof body === 'string') {
        requestBody = truncateBody(
          body,
          maxSz,
        );
      } else if (
        typeof URLSearchParams !== 'undefined' &&
        body instanceof URLSearchParams
      ) {
        requestBody = truncateBody(
          body.toString(),
          maxSz,
        );
      }
    }

    let reqHdrsJson = '';
    if (decisions.captureHeaders) {
      try {
        const hdrs =
          (this as any).__oodleReqHeaders;
        if (
          hdrs &&
          Object.keys(hdrs).length > 0
        ) {
          reqHdrsJson = JSON.stringify(hdrs);
        }
      } catch {}
    }

    const start = performance.now();
    const xhrThis = this;
    const tid = traceId;
    const sid = spanId;
    const reqBody = requestBody;
    const bc = decisions.bodyCfg;
    const rh = reqHdrsJson;
    const doHdrs = decisions.captureHeaders;
    this.addEventListener(
      'loadend',
      () => {
        const dur = Math.round(
          performance.now() - start,
        );
        const xhrMethod =
          (xhrThis as any).__oodleMethod ??
          'GET';
        emitEvent(() => {
          const d: Record<
            string,
            unknown
          > = {
            event_type: 'resource',
            resource_url: stripQuery(xhrUrl),
            resource_method: xhrMethod,
            resource_status: xhrThis.status,
            resource_duration_ms: dur,
            resource_size: 0,
            resource_type: 'xhr',
          };
          if (tid) {
            d.trace_id = tid;
            d.span_id = sid;
          }
          if (reqBody) {
            d.request_body = reqBody;
          }
          if (bc) {
            try {
              const text =
                xhrThis.responseText ?? '';
              d.response_body = truncateBody(
                text,
                bc.maxBodySize ?? 65536,
              );
            } catch {}
          }
          if (rh) {
            d.request_headers = rh;
          }
          if (doHdrs) {
            try {
              const raw =
                xhrThis
                  .getAllResponseHeaders();
              if (raw) {
                d.response_headers =
                  JSON.stringify(
                    parseRawHeaders(raw),
                  );
              }
            } catch {}
          }
          return d;
        });
      },
    );
    return origSend.apply(this, [body]);
  };

  return () => {
    (proto as any).open = origOpen;
    (proto as any).send = origSend;
    (proto as any).setRequestHeader = origSH;
  };
}

const TRACING_OPTS: FetchWrapOpts = {
  injectTracing: true,
};
const NO_TRACING_OPTS: FetchWrapOpts = {
  injectTracing: false,
};

function initFetchPatching() {
  if (typeof window === 'undefined') return;
  if (
    typeof window.fetch === 'undefined'
  ) {
    return;
  }

  const restore = wrapFetch(
    window,
    window.fetch,
    TRACING_OPTS,
  );
  teardownFns.push(restore);
}

function initXHRPatching() {
  if (typeof window === 'undefined') return;
  if (
    typeof XMLHttpRequest === 'undefined'
  ) {
    return;
  }

  const restore = wrapXHR(
    XMLHttpRequest.prototype as any,
    XMLHttpRequest.prototype.setRequestHeader,
    TRACING_OPTS,
  );
  teardownFns.push(restore);
}

const patchedIframes = new WeakSet<
  HTMLIFrameElement
>();

function patchIframeOnLoad(
  iframe: HTMLIFrameElement,
) {
  if (patchedIframes.has(iframe)) return;
  patchedIframes.add(iframe);

  const patch = () => {
    try {
      const w = iframe.contentWindow;
      if (!w) return;
      void w.document;

      if (
        w.fetch &&
        !(w.fetch as any).__oodleFetchPatched
      ) {
        wrapFetch(
          w,
          w.fetch,
          NO_TRACING_OPTS,
        );
        (w.fetch as any)
          .__oodleFetchPatched = true;
      }

      const IframeXHR = (w as any)
        .XMLHttpRequest;
      if (
        IframeXHR &&
        !IframeXHR.prototype
          .__oodleXHRPatched
      ) {
        wrapXHR(
          IframeXHR.prototype,
          IframeXHR.prototype
            .setRequestHeader,
          NO_TRACING_OPTS,
        );
        IframeXHR.prototype
          .__oodleXHRPatched = true;
      }
    } catch {
      // Cross-origin — silently skip
    }
  };
  patch();
  iframe.addEventListener('load', patch);
  teardownFns.push(() => {
    iframe.removeEventListener('load', patch);
  });
}

function initIframePatching() {
  if (typeof window === 'undefined') return;
  if (
    typeof MutationObserver === 'undefined'
  ) {
    return;
  }

  document
    .querySelectorAll('iframe')
    .forEach(patchIframeOnLoad);

  const observer = new MutationObserver(
    (mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (
            node instanceof HTMLIFrameElement
          ) {
            patchIframeOnLoad(node);
          }
          if (
            node instanceof HTMLElement &&
            node.childElementCount > 0
          ) {
            node
              .querySelectorAll('iframe')
              .forEach(patchIframeOnLoad);
          }
        }
      }
    },
  );

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  teardownFns.push(() => {
    observer.disconnect();
  });
}

function initPageLoadTracking() {
  if (typeof window === 'undefined') return;
  if (
    typeof PerformanceObserver === 'undefined'
  ) {
    return;
  }

  const collect = () => {
    const nav = performance.getEntriesByType(
      'navigation',
    )[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (!nav) return;
    viewMetrics.page_load_ms = Math.round(
      nav.loadEventEnd - nav.startTime,
    );
    viewMetrics.dns_ms = Math.round(
      nav.domainLookupEnd -
        nav.domainLookupStart,
    );
    viewMetrics.connect_ms = Math.round(
      nav.connectEnd - nav.connectStart,
    );
    viewMetrics.tls_ms = Math.round(
      nav.secureConnectionStart > 0
        ? nav.connectEnd -
            nav.secureConnectionStart
        : 0,
    );
    viewMetrics.ttfb = Math.round(
      nav.responseStart - nav.requestStart,
    );
    viewMetrics.download_ms = Math.round(
      nav.responseEnd - nav.responseStart,
    );
    viewMetrics.dom_interactive_ms = Math.round(
      nav.domInteractive - nav.startTime,
    );
    viewMetrics.dom_complete_ms = Math.round(
      nav.domComplete - nav.startTime,
    );
    scheduleViewMetricsFlush();
  };

  let tryCount = 0;
  const tryCollect = () => {
    tryCount++;
    const nav = performance.getEntriesByType(
      'navigation',
    )[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav && nav.loadEventEnd > 0) {
      collect();
    } else if (tryCount < 50) {
      setTimeout(tryCollect, 200);
    }
  };

  if (document.readyState === 'complete') {
    setTimeout(tryCollect, 100);
  } else {
    window.addEventListener('load', () => {
      setTimeout(tryCollect, 100);
    });
  }
}

function initLongTaskTracking() {
  if (
    typeof PerformanceObserver === 'undefined'
  ) {
    return;
  }

  if (initLoAFTracking()) return;

  try {
    const observer = new PerformanceObserver(
      (list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration < 50) continue;
          const dur = Math.round(
            entry.duration,
          );
          emitEventDeferred(() => ({
            event_type: 'long_task',
            long_task_duration_ms: dur,
          }));
        }
      },
    );
    observer.observe({
      type: 'longtask',
      buffered: true,
    });
    teardownFns.push(() =>
      observer.disconnect(),
    );
  } catch {
    // longtask not supported
  }
}

function initLoAFTracking(): boolean {
  try {
    const observer = new PerformanceObserver(
      (list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration < 50) continue;
          const loaf = entry as any;
          const scripts = loaf.scripts ?? [];
          const topScript =
            scripts.length > 0
              ? scripts[0]
              : null;
          const dur = Math.round(
            entry.duration,
          );
          const blocking = Math.round(
            loaf.blockingDuration ?? 0,
          );
          const scriptUrl =
            topScript?.sourceURL ?? '';
          const scriptFn =
            topScript?.sourceFunctionName ??
            '';
          const invoker =
            topScript?.invokerType ?? '';
          emitEventDeferred(() => ({
            event_type: 'long_task',
            long_task_duration_ms: dur,
            long_task_blocking_ms: blocking,
            long_task_script_url: scriptUrl,
            long_task_script_fn: scriptFn,
            long_task_invoker: invoker,
          }));
        }
      },
    );
    observer.observe({
      type: 'long-animation-frame',
      buffered: true,
    });
    teardownFns.push(() =>
      observer.disconnect(),
    );
    return true;
  } catch {
    return false;
  }
}

export function trackPageView() {
  emitEvent(() => ({
    event_type: 'view',
  }));
}

export function trackAction(
  type: string,
  target: string,
  selector: string,
  text: string,
  isFrustration: boolean,
  clickX?: number,
  clickY?: number,
) {
  emitEvent(() => {
    const data: Record<string, unknown> = {
      event_type: 'action',
      action_type: type,
      action_target: target,
      action_selector: selector,
      action_text: text,
      is_frustration: isFrustration ? 1 : 0,
    };
    if (clickX !== undefined) {
      data.click_x = clickX;
      data.click_y = clickY;
      data.viewport_width =
        window.innerWidth;
      data.viewport_height =
        window.innerHeight;
    }
    return data;
  });
}

export function trackCustomEvent(
  name: string,
  properties?: Record<string, unknown>,
) {
  emitEvent(() => ({
    event_type: 'custom',
    custom_event_name: name,
    custom_event_properties: properties
      ? JSON.stringify(properties)
      : '',
  }));
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
}

function getOSName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  return 'Other';
}

export function destroyEvents() {
  for (const fn of teardownFns) {
    fn();
  }
  teardownFns = [];
}
