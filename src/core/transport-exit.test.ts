import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

vi.mock('./config', () => ({
  getConfig: () => ({
    instanceId: 'inst',
    apiKey: 'key',
    endpoint: 'https://localhost',
    flushIntervalMs: 5000,
  }),
}));

vi.mock('./tags', () => ({ getTags: () => ({}) }));

vi.mock('./telemetry', () => ({
  incrTelemetry: () => {},
}));

// Uncompressed bodies keep sizes predictable: a body's
// size is its envelope's length.
vi.mock('./worker', () => ({
  compressString: async () => null,
  compressSyncString: () => null,
}));

interface Sent {
  via: 'beacon' | 'keepalive' | 'plain';
  body: string;
}

let sent: Sent[] = [];
let beaconWorks = true;
let hold: Promise<void> | null = null;

function pad(n: number): string {
  return 'x'.repeat(n);
}

describe('transport on page exit', () => {
  let transport: typeof import('./transport');

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    sent = [];
    beaconWorks = true;
    hold = null;
    (globalThis as any).fetch = vi.fn(
      async (_url: string, opts: any) => {
        sent.push({
          via: opts.keepalive ? 'keepalive' : 'plain',
          body: String(opts.body),
        });
        if (hold) await hold;
        return {
          ok: true,
          status: 200,
          headers: { get: () => null },
        };
      },
    );
    (navigator as any).sendBeacon = vi.fn(
      (_url: string, blob: Blob) => {
        if (!beaconWorks) return false;
        void blob
          .text()
          .then((t) => sent.push({ via: 'beacon', body: t }));
        return true;
      },
    );
    transport = await import('./transport');
    transport.initTransportListeners();
  });

  afterEach(() => {
    transport.destroyTransportListeners();
    vi.useRealTimers();
  });

  it('sends small sections even when replay is over the quota', async () => {
    transport.enqueue('events', { kind: 'click' });
    transport.enqueue('sdk_telemetry', { kind: 'counters' });
    transport.enqueue(
      'replay',
      { segment_index: 0, events: pad(200_000) },
      200_000,
    );

    window.dispatchEvent(new Event('pagehide'));
    await vi.advanceTimersByTimeAsync(0);

    // One envelope per section: the events and the
    // telemetry used to share the replay's plain fetch,
    // which the browser cancels with the page.
    const kept = sent.filter((s) => s.via !== 'plain');
    expect(kept.map((s) => s.body).join()).toContain('click');
    expect(kept.map((s) => s.body).join()).toContain('counters');
    expect(kept.some((s) => s.body.includes(pad(1000)))).toBe(
      false,
    );

    const replay = sent.filter((s) =>
      s.body.includes(pad(1000)),
    );
    expect(replay).toHaveLength(1);
    expect(replay[0].via).toBe('plain');
    expect(replay[0].body).not.toContain('click');
  });

  it('splits a section that does not fit and fills the quota', async () => {
    beaconWorks = false;
    for (let i = 0; i < 40; i++) {
      transport.enqueue('events', { i, pad: pad(3000) });
    }

    window.dispatchEvent(new Event('pagehide'));
    await vi.advanceTimersByTimeAsync(0);

    const keepalive = sent.filter((s) => s.via === 'keepalive');
    const keptBytes = keepalive.reduce(
      (n, s) => n + s.body.length,
      0,
    );
    expect(keepalive.length).toBeGreaterThan(0);
    expect(keptBytes).toBeLessThan(63_000);
    expect(keptBytes).toBeGreaterThan(40_000);

    // Every event leaves exactly once, in order.
    const ids = sent.flatMap((s) =>
      [...s.body.matchAll(/"i":(\d+)/g)].map((m) => Number(m[1])),
    );
    expect(ids).toEqual([...Array(40).keys()]);
  });

  it('keeps keepalive sends within the shared quota', async () => {
    hold = new Promise(() => {});
    transport.enqueue('events', { pad: pad(40_000) });
    transport.flushAll();
    await vi.advanceTimersByTimeAsync(0);
    transport.enqueue('events', { pad: pad(40_000) });
    transport.flushAll();
    await vi.advanceTimersByTimeAsync(0);

    // Two keepalive requests of 40KB in flight at once
    // would have the second refused by the browser.
    expect(sent.map((s) => s.via)).toEqual([
      'keepalive',
      'plain',
    ]);
  });

  it('sends events apart from a replay batch too big for keepalive', async () => {
    transport.enqueue('events', { kind: 'click' });
    transport.enqueue(
      'replay',
      { segment_index: 0, events: pad(200_000) },
      200_000,
    );
    transport.flushAll();
    await vi.advanceTimersByTimeAsync(0);

    const events = sent.filter((s) => s.body.includes('click'));
    expect(events).toHaveLength(1);
    expect(events[0].via).toBe('keepalive');
    expect(events[0].body).not.toContain(pad(1000));
  });

  it('keeps one request when replay is small', async () => {
    transport.enqueue('events', { kind: 'click' });
    transport.enqueue('replay', { segment_index: 0 }, 100);
    transport.flushAll();
    await vi.advanceTimersByTimeAsync(0);

    expect(sent).toHaveLength(1);
  });
});
