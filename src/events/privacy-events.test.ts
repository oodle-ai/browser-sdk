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
  getUserName: () => 'Jane Doe',
  getUserEmail: () => 'jane@acme.io',
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

  it('sends only the user id with userInfo id', () => {
    faro.trackPageView();
    expect(enqueued[0]).toMatchObject({
      user_id: 'u1',
      user_name: 'Jane Doe',
      user_email: 'jane@acme.io',
    });
    privacy.configurePrivacy({ userInfo: 'id' });
    faro.trackPageView();
    expect(enqueued[1]).toMatchObject({
      user_id: 'u1',
      user_name: '',
      user_email: '',
      user_status: 'anonymous',
    });
  });

  it('lets beforeSend change an event', () => {
    config.beforeSend = (e: any) => {
      e.view_url_path = '/redacted';
      e.session_id = 'forged';
    };
    try {
      faro.trackPageView();
    } finally {
      delete config.beforeSend;
    }
    expect(enqueued[0].view_url_path).toBe('/redacted');
    // The event's identity cannot be changed.
    expect(enqueued[0].session_id).toBe('session-1');
    expect(enqueued[0].event_type).toBe('view');
  });

  it('lets beforeSend replace or drop an event', () => {
    config.beforeSend = (e: any) =>
      e.event_type === 'custom' ? null : { ...e, extra: 1 };
    try {
      faro.trackCustomEvent('x');
      faro.trackPageView();
    } finally {
      delete config.beforeSend;
    }
    expect(enqueued).toHaveLength(1);
    expect(enqueued[0]).toMatchObject({ event_type: 'view', extra: 1 });
  });

  it('drops the event when beforeSend throws, and warns once', () => {
    const warn = vi.fn();
    console.warn = warn;
    config.beforeSend = () => {
      throw new Error('boom');
    };
    try {
      faro.initEvents();
      faro.trackPageView();
      faro.trackPageView();
    } finally {
      delete config.beforeSend;
    }
    expect(enqueued).toHaveLength(0);
    expect(warn).toHaveBeenCalledOnce();
  });

  it('records an Error logged to the console by name and message', () => {
    console.error = () => {};
    faro.initEvents();
    console.error('save failed:', new TypeError('bad input'));
    console.error(new Error(''));
    // Not an Error, but shaped like one (another realm, a DOMException).
    console.error({ name: 'AbortError', message: 'aborted', stack: '' });
    expect(consoleEvents().map((e) => e.console_message)).toEqual([
      'save failed: TypeError: bad input',
      'Error',
      'AbortError: aborted',
    ]);
  });

  it('records rejections after the listener moves to a patched addEventListener', () => {
    // Stands in for zone.js: once it loads, only listeners added
    // through its addEventListener hear about rejections.
    faro.initEvents();
    const nativeAdd = window.addEventListener;
    const nativeRemove = window.removeEventListener;
    const zoneListeners: EventListener[] = [];
    const removed: unknown[] = [];
    window.addEventListener = ((type: string, l: any, o?: any) => {
      if (type === 'unhandledrejection') zoneListeners.push(l);
      return nativeAdd.call(window, type, l, o);
    }) as any;
    window.removeEventListener = ((type: string, l: any, o?: any) => {
      if (type === 'unhandledrejection') removed.push(l);
      return nativeRemove.call(window, type, l, o);
    }) as any;
    try {
      faro.reattachRejectionListener();
    } finally {
      window.addEventListener = nativeAdd;
      window.removeEventListener = nativeRemove;
    }
    expect(zoneListeners).toHaveLength(1);
    // The native registration was removed first, so one event
    // is recorded once.
    expect(removed).toEqual(zoneListeners);
    const ev = new Event('unhandledrejection') as any;
    ev.reason = new RangeError('boom');
    window.dispatchEvent(ev);
    const errors = enqueued.filter((e) => e.event_type === 'error');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      error_type: 'RangeError',
      error_message: 'boom',
      error_source: 'promise',
    });
  });

  it('does nothing on reattach after the SDK stopped', () => {
    faro.initEvents();
    faro.destroyEvents();
    const add = vi.spyOn(window, 'addEventListener');
    faro.reattachRejectionListener();
    expect(add).not.toHaveBeenCalledWith('unhandledrejection', expect.anything());
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
