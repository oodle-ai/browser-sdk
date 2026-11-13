import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

/**
 * Captured request and response headers and bodies: the
 * headers that are always redacted, and beforeSendNetwork.
 */

const config: Record<string, unknown> = {
  instanceId: 'inst',
  apiKey: 'key',
  endpoint: 'https://localhost',
  service: 'test',
};

vi.mock('../core/config', () => ({
  getConfig: () => config,
}));

vi.mock('../core/session', () => ({
  getSessionId: () => 'session-1',
  isSessionSampled: () => true,
  incrementSessionCount: () => {},
  getSessionCounts: () => ({
    viewCount: 0,
    errorCount: 0,
    actionCount: 0,
  }),
}));

vi.mock('../core/user', () => ({
  getUserId: () => 'u1',
  getUserName: () => '',
  getUserEmail: () => '',
  getUserStatus: () => 'anonymous',
}));

vi.mock('../core/flags', () => ({ getFeatureFlags: () => ({}) }));
vi.mock('../core/telemetry', () => ({ incrTelemetry: () => {} }));
vi.mock('../core/otel-bridge', () => ({
  getActiveTraceContext: () => null,
}));
vi.mock('../replay/recorder', () => ({
  isReplayActive: () => false,
  hasReplayFlushed: () => false,
}));

const enqueued: Record<string, any>[] = [];

vi.mock('../core/transport', () => ({
  enqueue: (_key: string, item: Record<string, unknown>) => {
    enqueued.push(item);
  },
  upsert: () => {},
  flushAll: () => {},
  isServerRateLimited: () => false,
}));

const API = 'https://api.example.com/v1/me';

function apiResponse() {
  return new Response('{"ip":"203.0.113.7","origin":"203.0.113.7","name":"Jane"}', {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.7',
      'cf-connecting-ip': '203.0.113.7',
      'x-debug-client-ip': '203.0.113.7',
      'x-edge-addr': '203.0.113.7',
      'x-auth-token': 't',
      'x-request-id': 'req-1',
    },
  });
}

describe('network capture', () => {
  let faro: typeof import('./faro');
  const origFetch = window.fetch;

  beforeEach(async () => {
    vi.resetModules();
    enqueued.length = 0;
    if (!(performance as any).addEventListener) {
      (performance as any).addEventListener = () => {};
      (performance as any).removeEventListener = () => {};
    }
    config.forwardNetworkHeaders = { urls: [API] };
    config.forwardNetworkBodies = { urls: [API] };
    window.fetch = vi.fn(async () => apiResponse()) as any;
    faro = await import('./faro');
    faro.initEvents();
  });

  afterEach(() => {
    faro.destroyEvents();
    window.fetch = origFetch;
    delete config.forwardNetworkHeaders;
    delete config.forwardNetworkBodies;
    delete config.beforeSendNetwork;
    delete config.redactHeaders;
    vi.restoreAllMocks();
  });

  async function fetchApi() {
    await window.fetch(API, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer t',
        'X-Real-IP': '198.51.100.1',
        'X-Trace': 'a',
      },
      body: '{"q":1}',
    });
    // Response bodies are read asynchronously.
    await new Promise((r) => setTimeout(r, 20));
    return enqueued.find((e) => e.event_type === 'resource')!;
  }

  it('always drops client IP headers', async () => {
    const ev = await fetchApi();
    expect(JSON.parse(ev.request_headers)).toEqual({ 'x-trace': 'a' });
    const res = JSON.parse(ev.response_headers);
    expect(res['x-forwarded-for']).toBeUndefined();
    expect(res['cf-connecting-ip']).toBeUndefined();
    // Caught by name pattern, not by the exact list.
    expect(res['x-debug-client-ip']).toBeUndefined();
    expect(res['x-auth-token']).toBeUndefined();
    // No pattern matches, so only redactHeaders or the hook
    // can remove it.
    expect(res['x-edge-addr']).toBe('203.0.113.7');
    expect(res['x-request-id']).toBe('req-1');
  });

  it('drops the headers listed in redactHeaders', async () => {
    config.redactHeaders = ['X-Request-Id', /addr$/];
    const ev = await fetchApi();
    const res = JSON.parse(ev.response_headers);
    expect(res['x-request-id']).toBeUndefined();
    expect(res['x-edge-addr']).toBeUndefined();
    expect(res['content-type']).toBe('application/json');
    expect(JSON.parse(ev.request_headers)).toEqual({ 'x-trace': 'a' });
  });

  it('ignores redactHeaders entries that are not strings or RegExps', async () => {
    config.redactHeaders = [42, null, 'x-request-id'] as any;
    const ev = await fetchApi();
    expect(JSON.parse(ev.response_headers)['x-request-id']).toBeUndefined();
  });

  it('redacts built-in sensitive body keys and nothing else', async () => {
    const ev = await fetchApi();
    expect(ev.request_body).toBe('{"q":1}');
    expect(ev.response_body).toBe(
      '{"ip":"[REDACTED]","origin":"203.0.113.7","name":"Jane"}',
    );
  });

  it('redacts the keys in redactBodyKeys', async () => {
    config.redactBodyKeys = ['origin', /^na/];
    const ev = await fetchApi();
    expect(JSON.parse(ev.response_body)).toEqual({
      ip: '[REDACTED]',
      origin: '[REDACTED]',
      name: '[REDACTED]',
    });
    delete config.redactBodyKeys;
  });

  it('runs built-in redaction before the hook', async () => {
    let seen = '';
    config.beforeSendNetwork = (c: any) => {
      seen = c.responseBody;
    };
    await fetchApi();
    expect(seen).not.toContain('"ip":"203');
  });

  it('lets the hook change captured data in place', async () => {
    const hook = vi.fn((c: any) => {
      delete c.responseHeaders['x-edge-addr'];
      c.responseBody = c.responseBody.replace(
        /\d+\.\d+\.\d+\.\d+/g,
        '<ip>',
      );
    });
    config.beforeSendNetwork = hook;
    const ev = await fetchApi();
    expect(hook).toHaveBeenCalledOnce();
    expect(hook.mock.calls[0][0]).toMatchObject({
      url: API,
      method: 'POST',
      status: 200,
    });
    expect(JSON.parse(ev.response_headers)['x-edge-addr'])
      .toBeUndefined();
    expect(ev.response_body).toBe(
      '{"ip":"[REDACTED]","origin":"<ip>","name":"Jane"}',
    );
    expect(ev.request_body).toBe('{"q":1}');
  });

  it('uses an object the hook returns', async () => {
    config.beforeSendNetwork = (c: any) => ({
      ...c,
      requestBody: undefined,
      responseHeaders: { 'content-type': 'application/json' },
    });
    const ev = await fetchApi();
    expect(ev.request_body).toBeUndefined();
    expect(JSON.parse(ev.response_headers)).toEqual({
      'content-type': 'application/json',
    });
  });

  it('drops every capture when the hook returns null', async () => {
    config.beforeSendNetwork = () => null;
    const ev = await fetchApi();
    for (const f of [
      'request_headers',
      'response_headers',
      'request_body',
      'response_body',
    ]) {
      expect(ev[f]).toBeUndefined();
    }
    // The timing event itself is still sent.
    expect(ev.resource_status).toBe(200);
  });

  it('fails closed when the hook throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    config.beforeSendNetwork = () => {
      throw new Error('boom');
    };
    const ev = await fetchApi();
    expect(ev.response_body).toBeUndefined();
    expect(ev.response_headers).toBeUndefined();
    expect(ev.resource_url).toBe(API);
    expect(warn).toHaveBeenCalled();
  });

  it('is not called for a request that captured nothing', async () => {
    const hook = vi.fn();
    config.beforeSendNetwork = hook;
    await window.fetch('https://other.example.com/x');
    await new Promise((r) => setTimeout(r, 20));
    expect(hook).not.toHaveBeenCalled();
  });
});

describe('XHR request headers', () => {
  let faro: typeof import('./faro');

  afterEach(() => {
    faro.destroyEvents();
    delete config.forwardNetworkHeaders;
  });

  it('get the same redaction as fetch headers', async () => {
    vi.resetModules();
    enqueued.length = 0;
    config.forwardNetworkHeaders = { urls: [/./] };
    faro = await import('./faro');
    faro.initEvents();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/me');
    xhr.setRequestHeader('Authorization', 'Bearer secret');
    xhr.setRequestHeader('X-Forwarded-For', '203.0.113.7');
    xhr.setRequestHeader('X-Trace', 'a');
    await new Promise<void>((r) => {
      xhr.addEventListener('loadend', () => setTimeout(r, 0));
      xhr.send();
    });
    const ev = enqueued.find((e) => e.resource_type === 'xhr')!;
    // Before, setRequestHeader stored every header raw and the
    // Authorization header was sent.
    expect(JSON.parse(ev.request_headers)).toEqual({ 'x-trace': 'a' });
  });
});
