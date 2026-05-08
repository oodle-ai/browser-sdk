import {
  onLCP,
  onFID,
  onINP,
  onCLS,
  onFCP,
  onTTFB,
} from 'web-vitals';
import { getConfig } from '../core/config';
import type { NetworkBodiesConfig } from '../core/config';
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
import { enqueue, upsert } from '../core/transport';

let teardownFns: Array<() => void> = [];

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3000;

interface RateLimiter {
  count: number;
  windowStart: number;
  warned: boolean;
}

const rateLimiters: Record<string, RateLimiter> = {};

function isRateLimited(eventType: string): boolean {
  const limited = ['error', 'action', 'console'];
  if (!limited.includes(eventType)) return false;

  let rl = rateLimiters[eventType];
  if (!rl) {
    rl = {
      count: 0,
      windowStart: Date.now(),
      warned: false,
    };
    rateLimiters[eventType] = rl;
  }

  const now = Date.now();
  if (now - rl.windowStart > RATE_LIMIT_WINDOW_MS) {
    rl.count = 0;
    rl.windowStart = now;
    rl.warned = false;
  }

  rl.count++;
  if (rl.count > RATE_LIMIT_MAX) {
    if (!rl.warned) {
      rl.warned = true;
      console.warn(
        `[@oodle-ai/rum] Rate limit reached for` +
          ` ${eventType}: ${RATE_LIMIT_MAX}/min`,
      );
    }
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

function baseContext(): Record<string, unknown> {
  const counts = getSessionCounts();
  const flags = getFeatureFlags();
  const ctx: Record<string, unknown> = {
    session_id: getSessionId(),
    user_id: getUserId(),
    user_name: getUserName(),
    user_email: getUserEmail(),
    user_status: getUserStatus(),
    service: getConfig().service,
    env: getConfig().env ?? '',
    version: getConfig().version ?? '',
    timestamp: new Date().toISOString(),
    view_url:
      window.location.origin +
      window.location.pathname,
    view_url_host: window.location.hostname,
    view_url_path: window.location.pathname,
    referrer_url: stripQuery(document.referrer),
    device_type: getDeviceType(),
    browser_name: getBrowserName(),
    os_name: getOSName(),
    user_agent: navigator.userAgent,
    language: navigator.language,
    session_view_count: counts.viewCount,
    session_error_count: counts.errorCount,
    session_action_count: counts.actionCount,
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

function emitEvent(
  path: string,
  data: Record<string, unknown>,
) {
  if (!isSessionSampled()) return;
  const eventType = data.event_type as string;
  if (isRateLimited(eventType)) return;
  incrementSessionCount(eventType);
  const ctx = baseContext();
  enqueue(path, { ...ctx, ...data });
}

function emitEventDeferred(
  path: string,
  data: Record<string, unknown>,
) {
  scheduleIdleWork(() => emitEvent(path, data));
}

function emitViewEvent(
  path: string,
  data: Record<string, unknown>,
) {
  if (!isSessionSampled()) return;
  const eventType = data.event_type as string;
  incrementSessionCount(eventType);
  const ctx = baseContext();
  const viewId =
    (ctx.session_id as string) +
    ':' +
    ctx.view_url_path;
  upsert(path, viewId, { ...ctx, ...data });
}

export function initEvents() {
  initErrorTracking();
  initConsoleTracking();
  initWebVitals();
  initResourceTracking();
  initPageLoadTracking();
  initFetchPatching();
  initXHRPatching();
  initLongTaskTracking();
  initViewMetricsVisibility();
}

function initErrorTracking() {
  const onError = (event: ErrorEvent) => {
    emitEvent('/v1/rum/events', {
      event_type: 'error',
      error_message: event.message ?? '',
      error_type: event.error?.name ?? 'Error',
      error_stack: event.error?.stack ?? '',
      error_source: 'source',
    });
  };

  const onUnhandledRejection = (
    event: PromiseRejectionEvent,
  ) => {
    const reason = event.reason;
    emitEvent('/v1/rum/events', {
      event_type: 'error',
      error_message:
        reason?.message ?? String(reason),
      error_type:
        reason?.name ?? 'UnhandledRejection',
      error_stack: reason?.stack ?? '',
      error_source: 'promise',
    });
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
    emitEvent('/v1/rum/events', {
      event_type: 'console',
      console_level: 'error',
      console_message: args
        .map(safeStringify)
        .join(' '),
    });
    original.error.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    emitEvent('/v1/rum/events', {
      event_type: 'console',
      console_level: 'warn',
      console_message: args
        .map(safeStringify)
        .join(' '),
    });
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
  emitViewEvent('/v1/rum/events', {
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
  });
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

        emitEventDeferred('/v1/rum/events', {
          event_type: 'resource',
          resource_url: stripQuery(res.name),
          resource_method: '',
          resource_duration_ms: res.duration,
          resource_size: res.transferSize ?? 0,
          resource_type: initiator,
        });
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

function matchesUrlPattern(
  url: string,
  patterns: (string | RegExp)[],
): boolean {
  return patterns.some((p) =>
    typeof p === 'string'
      ? url.startsWith(p)
      : p.test(url),
  );
}

function shouldTrace(url: string): boolean {
  const patterns =
    getConfig().allowedTracingUrls;
  if (!patterns || patterns.length === 0) {
    return false;
  }
  return matchesUrlPattern(url, patterns);
}

function shouldCaptureBody(
  url: string,
): NetworkBodiesConfig | null {
  const cfg = getConfig().forwardNetworkBodies;
  if (!cfg) return null;
  if (matchesUrlPattern(url, cfg.urls)) {
    return cfg;
  }
  return null;
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
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, {
      stream: true,
    });
  }
  reader.cancel();
  return result.slice(0, maxBytes);
}

function initFetchPatching() {
  if (typeof window === 'undefined') return;
  if (typeof window.fetch === 'undefined') return;

  const originalFetch = window.fetch;
  window.fetch = function (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (isOodleInternalUrl(url)) {
      return originalFetch.apply(this, [
        input,
        init,
      ] as any);
    }

    const method = (
      init?.method ?? 'GET'
    ).toUpperCase();
    const start = performance.now();

    let traceId = '';
    let spanId = '';
    if (shouldTrace(url)) {
      traceId = generateHexId(16);
      spanId = generateHexId(8);
      const traceparent =
        `00-${traceId}-${spanId}-01`;
      const headers = new Headers(
        init?.headers ?? {},
      );
      headers.set('traceparent', traceparent);
      init = { ...init, headers };
    }

    const bodyCfg = shouldCaptureBody(url);
    let requestBody = '';
    if (bodyCfg && init?.body) {
      if (typeof init.body === 'string') {
        requestBody = truncateBody(
          init.body,
          bodyCfg.maxBodySize ?? 65536,
        );
      }
    }

    return originalFetch
      .apply(this, [input, init] as any)
      .then(async (response) => {
        const duration =
          performance.now() - start;
        let responseBody = '';
        if (bodyCfg) {
          try {
            responseBody =
              await readBodyLimited(
                response.clone(),
                bodyCfg.maxBodySize ?? 65536,
              );
          } catch {}
        }
        const eventData: Record<
          string,
          unknown
        > = {
          event_type: 'resource',
          resource_url: stripQuery(url),
          resource_method: method,
          resource_status: response.status,
          resource_duration_ms:
            Math.round(duration),
          resource_size: 0,
          resource_type: 'fetch',
        };
        if (traceId) {
          eventData.trace_id = traceId;
          eventData.span_id = spanId;
        }
        if (requestBody) {
          eventData.request_body = requestBody;
        }
        if (responseBody) {
          eventData.response_body = responseBody;
        }
        emitEvent('/v1/rum/events', eventData);
        return response;
      })
      .catch((err) => {
        const duration =
          performance.now() - start;
        const eventData: Record<
          string,
          unknown
        > = {
          event_type: 'resource',
          resource_url: stripQuery(url),
          resource_method: method,
          resource_status: 0,
          resource_duration_ms:
            Math.round(duration),
          resource_size: 0,
          resource_type: 'fetch',
        };
        if (traceId) {
          eventData.trace_id = traceId;
          eventData.span_id = spanId;
        }
        if (requestBody) {
          eventData.request_body = requestBody;
        }
        emitEvent('/v1/rum/events', eventData);
        throw err;
      });
  };

  teardownFns.push(() => {
    window.fetch = originalFetch;
  });
}

function initXHRPatching() {
  if (typeof window === 'undefined') return;
  if (typeof XMLHttpRequest === 'undefined') {
    return;
  }

  const origOpen =
    XMLHttpRequest.prototype.open;
  const origSend =
    XMLHttpRequest.prototype.send;
  const origSetHeader =
    XMLHttpRequest.prototype.setRequestHeader;

  XMLHttpRequest.prototype.open = function (
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
    return origOpen.call(
      this,
      method,
      url,
      async_ ?? true,
      username,
      password,
    );
  };

  XMLHttpRequest.prototype.send = function (
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

    let traceId = '';
    let spanId = '';
    if (shouldTrace(xhrUrl)) {
      traceId = generateHexId(16);
      spanId = generateHexId(8);
      origSetHeader.call(
        this,
        'traceparent',
        `00-${traceId}-${spanId}-01`,
      );
    }

    const bodyCfg = shouldCaptureBody(xhrUrl);
    let requestBody = '';
    if (
      bodyCfg &&
      body &&
      typeof body === 'string'
    ) {
      requestBody = truncateBody(
        body,
        bodyCfg.maxBodySize ?? 65536,
      );
    }

    const start = performance.now();
    this.addEventListener('loadend', () => {
      const duration =
        performance.now() - start;
      const eventData: Record<
        string,
        unknown
      > = {
        event_type: 'resource',
        resource_url: stripQuery(xhrUrl),
        resource_method:
          (this as any).__oodleMethod ?? 'GET',
        resource_status: this.status,
        resource_duration_ms:
          Math.round(duration),
        resource_size: 0,
        resource_type: 'xhr',
      };
      if (traceId) {
        eventData.trace_id = traceId;
        eventData.span_id = spanId;
      }
      if (requestBody) {
        eventData.request_body = requestBody;
      }
      if (bodyCfg) {
        try {
          const text =
            this.responseText ?? '';
          eventData.response_body =
            truncateBody(
              text,
              bodyCfg.maxBodySize ?? 65536,
            );
        } catch {}
      }
      emitEvent('/v1/rum/events', eventData);
    });
    return origSend.apply(this, [body]);
  };

  teardownFns.push(() => {
    XMLHttpRequest.prototype.open = origOpen;
    XMLHttpRequest.prototype.send = origSend;
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
  try {
    const observer = new PerformanceObserver(
      (list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration < 50) continue;
          emitEventDeferred('/v1/rum/events', {
            event_type: 'long_task',
            long_task_duration_ms: Math.round(
              entry.duration,
            ),
          });
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

export function trackPageView() {
  emitEvent('/v1/rum/events', {
    event_type: 'view',
  });
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
    data.viewport_width = window.innerWidth;
    data.viewport_height = window.innerHeight;
  }
  emitEvent('/v1/rum/events', data);
}

export function trackCustomEvent(
  name: string,
  properties?: Record<string, unknown>,
) {
  emitEvent('/v1/rum/events', {
    event_type: 'custom',
    custom_event_name: name,
    custom_event_properties: properties
      ? JSON.stringify(properties)
      : '',
  });
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
