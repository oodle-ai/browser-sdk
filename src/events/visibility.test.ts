import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

/**
 * Tab-switch events are only useful if they survive the tab
 * being switched away from, which makes their delivery a
 * question of listener registration order rather than of
 * anything in the event itself. These tests wire the real
 * transport in, because with it mocked out an event queued
 * too late still looks delivered.
 */

vi.mock('../core/config', () => ({
  getConfig: () => ({
    instanceId: 'inst',
    apiKey: 'key',
    endpoint: 'https://localhost',
    service: 'test',
    flushIntervalMs: 5000,
    replayFlushIntervalMs: 5000,
  }),
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
  getTags: () => ({ tier: 'gold' }),
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

vi.mock('../core/worker', () => ({
  compressString: async () => null,
  compressSyncString: () => null,
}));

const sent: string[] = [];

function setVisibility(state: string) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
}

async function readBody(body: unknown): Promise<string> {
  if (typeof body === 'string') return body;
  if (body instanceof Blob) return await body.text();
  return String(body);
}

describe('tab visibility events', () => {
  let transport: typeof import('../core/transport');
  let faro: typeof import('./faro');

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    sent.length = 0;
    setVisibility('visible');

    (globalThis as any).fetch = vi.fn(
      async (_url: string, opts: any) => {
        sent.push(await readBody(opts?.body));
        return {
          ok: true,
          status: 200,
          headers: { get: () => null },
        };
      },
    );
    (navigator as any).sendBeacon = vi.fn(
      (_url: string, blob: Blob) => {
        void blob.text().then((t) => sent.push(t));
        return true;
      },
    );

    transport = await import('../core/transport');
    faro = await import('./faro');

    // Same order as OodleRum.init: visibility tracking
    // claims its listener before the transport claims the
    // one that flushes on exit.
    faro.initVisibilityTracking();
    transport.initTransportListeners();
  });

  afterEach(() => {
    faro.destroyEvents();
    transport.destroyTransportListeners();
    vi.useRealTimers();
  });

  it('gets the hidden event out on the exit flush', async () => {
    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);

    // No timer advance beyond a tick: the event has to
    // leave on the exit flush the transport runs, not on
    // the debounce, because the page may never come back.
    const bodies = sent.join('');
    expect(bodies).toContain('tab_hidden');
    expect(bodies).toContain('"event_type":"visibility"');
  });

  it('records the return as a separate event', async () => {
    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);
    sent.length = 0;

    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(6000);

    expect(sent.join('')).toContain('tab_visible');
  });

  it('sends the return without waiting for the debounce', async () => {
    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);
    sent.length = 0;

    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    // Only a tick, nowhere near the debounce. Left in the
    // batch, the return would be picked up by the next
    // hide's exit send, which drops it whenever the beacon
    // is skipped for size and has no retry behind it. That
    // is what produced runs of consecutive tab_hidden.
    await vi.advanceTimersByTimeAsync(0);

    expect(sent.join('')).toContain('tab_visible');
  });

  it('carries the current tags like any other event', async () => {
    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);

    expect(sent.join('')).toContain('gold');
  });

  it('stops emitting once torn down', async () => {
    // Drain the tab_visible that init emits for a page that
    // starts visible, so what is left is only what the
    // listeners produce after teardown.
    await vi.advanceTimersByTimeAsync(6000);
    faro.destroyEvents();
    sent.length = 0;

    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(6000);

    expect(sent.join('')).not.toContain('visibility');
  });
  it('reports the return a dead tab still owed', async () => {
    // A tab discarded while hidden leaves the flag behind.
    // The reload fires no visibilitychange, so without this
    // the earlier tab_hidden would never be closed.
    await vi.advanceTimersByTimeAsync(6000);
    faro.destroyEvents();
    sessionStorage.setItem('oodle_rum_tab_hidden', '1');
    sent.length = 0;
    setVisibility('visible');
    faro.initVisibilityTracking();
    await vi.advanceTimersByTimeAsync(6000);

    expect(sent.join('')).toContain('tab_visible');
    expect(
      sessionStorage.getItem('oodle_rum_tab_hidden'),
    ).toBeNull();
  });

  it('stays quiet on an ordinary page load', async () => {
    // Nothing owed, so no phantom return at the head of
    // every session.
    await vi.advanceTimersByTimeAsync(6000);
    faro.destroyEvents();
    sessionStorage.removeItem('oodle_rum_tab_hidden');
    sent.length = 0;
    setVisibility('visible');
    faro.initVisibilityTracking();
    await vi.advanceTimersByTimeAsync(6000);

    expect(sent.join('')).not.toContain('tab_visible');
  });

  it('ignores a change that does not change the state', async () => {
    await vi.advanceTimersByTimeAsync(6000);
    sent.length = 0;

    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    document.dispatchEvent(new Event('visibilitychange'));
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(6000);

    const hides =
      sent.join('').split('tab_hidden').length - 1;
    expect(hides).toBe(1);
  });

  it('keeps emitting tab switches under a burst', async () => {
    // Visibility is exempt from the rate limiter: dropping
    // one orphans the hide it was meant to close.
    await vi.advanceTimersByTimeAsync(6000);
    sent.length = 0;
    for (let i = 0; i < 60; i++) {
      setVisibility(i % 2 === 0 ? 'hidden' : 'visible');
      document.dispatchEvent(new Event('visibilitychange'));
    }
    await vi.advanceTimersByTimeAsync(6000);

    const body = sent.join('');
    const hides = body.split('tab_hidden').length - 1;
    const shows = body.split('tab_visible').length - 1;
    expect(hides).toBe(30);
    expect(shows).toBe(30);
  });
});
