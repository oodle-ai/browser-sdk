import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

/**
 * The privacy options, checked on the events that carry each
 * field. The privacy module is real; only the rest of the SDK
 * around the event producers is stubbed.
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

const enqueued: Record<string, any>[] = [];

vi.mock('../core/transport', () => ({
  enqueue: (_key: string, item: Record<string, unknown>) => {
    enqueued.push(item);
  },
  upsert: () => {},
  flushAll: () => {},
  isServerRateLimited: () => false,
}));

const origin = window.location.origin;

describe('privacy options on events', () => {
  let faro: typeof import('./faro');
  let privacy: typeof import('../core/privacy');
  const realError = console.error;
  const realWarn = console.warn;

  beforeEach(async () => {
    vi.resetModules();
    enqueued.length = 0;
    if (!(performance as any).addEventListener) {
      (performance as any).addEventListener = () => {};
      (performance as any).removeEventListener = () => {};
    }
    privacy = await import('../core/privacy');
    faro = await import('./faro');
  });

  afterEach(() => {
    faro.destroyEvents();
    console.error = realError;
    console.warn = realWarn;
    window.history.replaceState(null, '', '/');
  });

  const consoleEvents = () =>
    enqueued.filter((e) => e.event_type === 'console');

  it('masks view_url and view_url_path', () => {
    privacy.configurePrivacy({
      urlPathPatterns: ['/projects/:project/tables/:table'],
    });
    window.history.replaceState(
      null,
      '',
      '/projects/acme/tables/salaries?token=1',
    );
    faro.trackPageView();
    expect(enqueued[0].view_url).toBe(
      origin + '/projects/:project/tables/:table',
    );
    expect(enqueued[0].view_url_path).toBe(
      '/projects/:project/tables/:table',
    );
  });

  it('keeps view_url_path unchanged when nothing is set', () => {
    window.history.replaceState(null, '', '/projects/acme');
    faro.trackPageView();
    expect(enqueued[0].view_url_path).toBe('/projects/acme');
  });

  it('sends user_agent empty with userAgent none', () => {
    faro.trackPageView();
    expect(enqueued[0].user_agent).toBe(navigator.userAgent);
    privacy.configurePrivacy({ userAgent: 'none' });
    faro.trackPageView();
    expect(enqueued[1].user_agent).toBe('');
    expect(enqueued[1].browser_name).toBeTruthy();
  });

  it('records both console levels by default', () => {
    console.error = () => {};
    console.warn = () => {};
    faro.initEvents();
    console.error('e1');
    console.warn('w1');
    expect(consoleEvents().map((e) => e.console_level)).toEqual([
      'error',
      'warn',
    ]);
  });

  it('does not wrap a level that is not recorded', () => {
    const warn = vi.fn();
    console.warn = warn;
    console.error = () => {};
    privacy.configurePrivacy({ consoleLevels: ['error'] });
    faro.initEvents();
    expect(console.warn).toBe(warn);
    console.warn('w1');
    console.error('e1');
    expect(warn).toHaveBeenCalledWith('w1');
    expect(consoleEvents().map((e) => e.console_level)).toEqual([
      'error',
    ]);
  });

  it('records no console output with an empty list', () => {
    console.error = () => {};
    privacy.configurePrivacy({ consoleLevels: [] });
    faro.initEvents();
    console.error('e1');
    expect(consoleEvents()).toHaveLength(0);
  });

  it('scrubs console messages', () => {
    console.error = () => {};
    privacy.configurePrivacy({ errorMessages: 'scrub' });
    faro.initEvents();
    console.error('failed for', 'jane@acme.io');
    expect(consoleEvents()[0].console_message).toBe('failed for <email>');
  });

  it('scrubs error events and their stack header', () => {
    privacy.configurePrivacy({ errorMessages: 'scrub' });
    faro.initEvents();
    const err = new TypeError("no table 'salaries'");
    window.dispatchEvent(
      new ErrorEvent('error', {
        message: "Uncaught TypeError: no table 'salaries'",
        error: err,
      }),
    );
    const ev = enqueued.find((e) => e.event_type === 'error')!;
    expect(ev.error_message).toBe("Uncaught TypeError: no table '?'");
    expect(ev.error_type).toBe('TypeError');
    expect(ev.error_stack).not.toContain('salaries');
  });

  it('drops error messages with errorMessages none', () => {
    privacy.configurePrivacy({ errorMessages: 'none' });
    faro.initEvents();
    const err = new Error('user 4111 not allowed on acme');
    window.dispatchEvent(
      new ErrorEvent('error', { message: 'Uncaught ' + err.message, error: err }),
    );
    const ev = enqueued.find((e) => e.event_type === 'error')!;
    expect(ev.error_message).toBe('');
    expect(ev.error_stack).not.toContain('acme');
    expect(ev.error_type).toBe('Error');
  });

  it('strips the query from relative fetch URLs', async () => {
    const orig = window.fetch;
    window.fetch = vi.fn(async () => new Response('ok')) as any;
    try {
      privacy.configurePrivacy({ urlPathPatterns: ['/api/projects/:id'] });
      faro.initEvents();
      await window.fetch('/api/projects/acme?token=s3cret');
      await new Promise((r) => setTimeout(r, 0));
      const ev = enqueued.find((e) => e.event_type === 'resource')!;
      expect(ev.resource_url).toBe('/api/projects/:id');
    } finally {
      faro.destroyEvents();
      window.fetch = orig;
    }
  });
});
