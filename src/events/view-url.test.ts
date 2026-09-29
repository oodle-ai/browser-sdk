import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

/**
 * A query string can hold tokens or personal data, so view_url
 * drops it. An app can name the parameters that only address a
 * page state (for example the record a drawer shows), and only
 * those stay. view_url_path must not change, because views are
 * grouped by it.
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

vi.mock('../core/flags', () => ({
  getFeatureFlags: () => ({}),
}));

vi.mock('../core/tags', () => ({
  getTags: () => ({}),
}));

vi.mock('../core/telemetry', () => ({
  incrTelemetry: () => {},
}));

vi.mock('../core/otel-bridge', () => ({
  getActiveTraceContext: () => null,
}));

vi.mock('../replay/recorder', () => ({
  isReplayActive: () => false,
  hasReplayFlushed: () => false,
}));

const enqueued: Record<string, unknown>[] = [];

vi.mock('../core/transport', () => ({
  enqueue: (_key: string, item: Record<string, unknown>) => {
    enqueued.push(item);
  },
  upsert: () => {},
  flushAll: () => {},
  isServerRateLimited: () => false,
}));

const origin = window.location.origin;

describe('viewUrl', () => {
  let viewUrl: typeof import('./faro').viewUrl;

  beforeEach(async () => {
    ({ viewUrl } = await import('./faro'));
  });

  const loc = (search: string) => ({
    origin: 'https://app.example.com',
    pathname: '/traces',
    search,
  });

  it('drops the whole query string by default', () => {
    expect(viewUrl(loc('?traceId=abc&token=s3cret'), undefined)).toBe(
      'https://app.example.com/traces',
    );
    expect(viewUrl(loc('?traceId=abc'), [])).toBe(
      'https://app.example.com/traces',
    );
  });

  it('keeps only the listed parameters', () => {
    expect(
      viewUrl(loc('?token=s3cret&traceId=abc&q=user%40x.com'), ['traceId']),
    ).toBe('https://app.example.com/traces?traceId=abc');
  });

  it('keeps every value of a repeated parameter in order', () => {
    expect(
      viewUrl(loc('?id=1&x=2&id=3'), ['id']),
    ).toBe('https://app.example.com/traces?id=1&id=3');
  });

  it('keeps no parameter and does not throw for a non-array value', () => {
    // A string must not match by substring: 'traceId' holds 't'.
    for (const bad of ['traceId', 42, { traceId: 1 }]) {
      expect(
        viewUrl(loc('?t=1&traceId=abc'), bad as unknown as string[]),
      ).toBe('https://app.example.com/traces');
    }
  });

  it('adds no "?" when no listed parameter is present', () => {
    expect(viewUrl(loc('?token=s3cret'), ['traceId'])).toBe(
      'https://app.example.com/traces',
    );
    expect(viewUrl(loc(''), ['traceId'])).toBe(
      'https://app.example.com/traces',
    );
  });
});

describe('view events', () => {
  let faro: typeof import('./faro');

  beforeEach(async () => {
    vi.resetModules();
    enqueued.length = 0;
    faro = await import('./faro');
  });

  afterEach(() => {
    delete config.viewUrlQueryParams;
    window.history.replaceState(null, '', '/');
  });

  it('records the listed parameter on a route change', () => {
    config.viewUrlQueryParams = ['traceId'];
    window.history.replaceState(
      null,
      '',
      '/traces?traceId=abc&filters=%5B%5D',
    );

    faro.trackPageView();

    expect(enqueued).toHaveLength(1);
    expect(enqueued[0].view_url).toBe(origin + '/traces?traceId=abc');
    expect(enqueued[0].view_url_path).toBe('/traces');
  });

  it('keeps no query string when the option is not set', () => {
    window.history.replaceState(null, '', '/traces?traceId=abc');

    faro.trackPageView();

    expect(enqueued[0].view_url).toBe(origin + '/traces');
  });
});
