import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { eventWithTime } from '@rrweb/types';

/**
 * The recorder and the transport each buffer, and each
 * listens for the page going away. These tests wire the
 * real modules together because the bug they guard
 * against lives between them: with the transport mocked
 * out, a segment handed over too late still looks
 * delivered.
 */

const FULL_SNAPSHOT = 2;
const INCREMENTAL_SNAPSHOT = 3;

let emit: (e: eventWithTime) => void = () => {};

vi.mock('rrweb', () => ({
  get record() {
    const fn: any = (opts: any) => {
      emit = opts.emit;
      return () => {};
    };
    fn.takeFullSnapshot = () => {
      emit(fullSnapshot(Date.now()));
    };
    fn.mirror = {
      getNode: () => null,
      getId: () => -1,
    };
    return fn;
  },
}));

vi.mock('../core/config', () => ({
  getConfig: () => ({
    instanceId: 'inst',
    apiKey: 'key',
    endpoint: 'https://localhost',
    service: 'test',
    replayFlushIntervalMs: 5000,
    flushIntervalMs: 5000,
  }),
}));

vi.mock('../core/session', () => ({
  getSessionId: () => 'session-1',
  nextReplaySegmentIndex: () => 0,
  isReplaySampled: () => true,
}));

vi.mock('../core/tags', () => ({
  getTags: () => ({}),
}));

vi.mock('../core/telemetry', () => ({
  incrTelemetry: () => {},
}));

// Keeps the request body readable so a test can assert
// on what actually left the page.
vi.mock('../core/worker', () => ({
  compressString: async () => null,
  compressSyncString: () => null,
}));

function fullSnapshot(ts: number): eventWithTime {
  return {
    type: FULL_SNAPSHOT,
    data: { node: { id: 1 }, initialOffset: {} },
    timestamp: ts,
  } as unknown as eventWithTime;
}

function incremental(ts: number): eventWithTime {
  return {
    type: INCREMENTAL_SNAPSHOT,
    data: { source: 0, adds: [] },
    timestamp: ts,
  } as unknown as eventWithTime;
}

/** Every body that reached the network, by any path. */
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

describe('handing replay to the transport on page exit', () => {
  let transport: typeof import('../core/transport');
  let recorder: typeof import('./recorder');

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
    recorder = await import('./recorder');

    // Same order as OodleRum.init: the transport claims
    // its listeners before replay starts.
    transport.initTransportListeners();
    await recorder.initReplay();
  });

  afterEach(() => {
    recorder.stopReplay();
    transport.destroyTransportListeners();
    vi.useRealTimers();
  });

  async function recordSomething() {
    emit(fullSnapshot(Date.now()));
    emit(incremental(Date.now()));
    // Long enough to drain the mutation batch, short
    // enough that no flush timer has fired.
    await vi.advanceTimersByTimeAsync(50);
    expect(sent).toHaveLength(0);
  }

  function replayBodies() {
    return sent.filter((b) => b.includes('"replay"'));
  }

  it('sends the buffered segment when the tab is hidden', async () => {
    await recordSomething();

    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);

    // The transport's own listener runs first, so a
    // segment handed over afterwards would sit in the
    // queue behind a five second debounce on a page the
    // user is leaving.
    expect(replayBodies()).not.toHaveLength(0);
  });

  it('sends the buffered segment on pagehide', async () => {
    await recordSomething();

    window.dispatchEvent(new Event('pagehide'));
    await vi.advanceTimersByTimeAsync(0);

    // pagehide is the only signal for a bfcache eviction
    // and the last one before an unload.
    expect(replayBodies()).not.toHaveLength(0);
  });
});
