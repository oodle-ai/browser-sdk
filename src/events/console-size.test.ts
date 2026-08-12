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

describe('console capture size', () => {
  let transport: typeof import('../core/transport');
  let faro: typeof import('./faro');

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    sent.length = 0;

    (globalThis as any).fetch = vi.fn(
      async (_url: string, opts: any) => {
        const body = opts?.body;
        sent.push(
          typeof body === 'string'
            ? body
            : body instanceof Blob
              ? await body.text()
              : String(body),
        );
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
    // initEvents wires up producers this test does not
    // exercise; the resource one reaches for APIs the test
    // environment does not implement.
    if (!(performance as any).addEventListener) {
      (performance as any).addEventListener = () => {};
      (performance as any).removeEventListener = () => {};
    }

    transport = await import('../core/transport');
    faro = await import('./faro');
    faro.initEvents();
  });

  afterEach(() => {
    faro.destroyEvents();
    transport.destroyTransportListeners();
    vi.useRealTimers();
  });

  it('truncates a huge logged object', async () => {
    // rrweb warns with the whole mutation it could not
    // apply. Captured verbatim, the string was built and
    // measured before the transport binned it for size, and
    // that work alone was enough to crash the tab.
    const huge = { blob: 'x'.repeat(2_000_000) };
    console.warn('node not found', huge);
    await vi.advanceTimersByTimeAsync(6000);

    const body = sent.join('');
    expect(body).toContain('truncated');
    expect(body.length).toBeLessThan(100_000);
  });
});
