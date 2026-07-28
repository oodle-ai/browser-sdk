import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { eventWithTime } from '@rrweb/types';

const FULL_SNAPSHOT = 2;
const INCREMENTAL_SNAPSHOT = 3;
const META = 4;

interface Tagged {
  type: number;
  data: any;
  timestamp: number;
  /** Emission order, assigned by the driver. */
  seq: number;
}

let emit: (e: eventWithTime) => void = () => {};
let takeFullSnapshot: any;
let sessionSeq = 0;
let sessionId = 'session-1';
let seqCounter = 0;
const enqueued: any[] = [];
let rateLimited = false;

/**
 * True between record() and its stop handle. Real rrweb
 * emits nothing outside that window, and modelling it
 * matters: the recorder is allowed to drop events while
 * stopped precisely because none arrive.
 */
let recording = false;

vi.mock('rrweb', () => ({
  get record() {
    const fn: any = (opts: any) => {
      emit = opts.emit;
      recording = true;
      // A fresh recorder always opens with a snapshot.
      queueMicrotask(() => emitSnapshot());
      return () => {
        recording = false;
      };
    };
    fn.takeFullSnapshot = (...args: any[]) =>
      takeFullSnapshot(...args);
    return fn;
  },
}));

vi.mock('../core/transport', () => ({
  enqueue: (key: string, payload: any) =>
    enqueued.push({ key, payload }),
  isServerRateLimited: () => rateLimited,
  setReplayDropHandler: () => {},
}));

vi.mock('../core/session', () => ({
  getSessionId: () => sessionId,
  nextReplaySegmentIndex: () => sessionSeq++,
}));

vi.mock('../core/config', () => ({
  getConfig: () => ({
    instanceId: 'inst',
    apiKey: 'key',
    endpoint: 'https://localhost',
    service: 'test',
    replayFlushIntervalMs: 5000,
  }),
}));

function tagged(type: number, data: any): Tagged {
  return {
    type,
    data,
    timestamp: Date.now(),
    seq: seqCounter++,
  };
}

function emitSnapshot() {
  if (!recording) return;
  // rrweb emits Meta immediately before FullSnapshot.
  emit(
    tagged(META, {
      href: 'x',
      width: 1,
      height: 1,
    }) as unknown as eventWithTime,
  );
  emit(
    tagged(FULL_SNAPSHOT, {
      node: { id: 1 },
      initialOffset: {},
    }) as unknown as eventWithTime,
  );
}

function emitIncremental() {
  if (!recording) return;
  emit(
    tagged(INCREMENTAL_SNAPSHOT, {
      source: 0,
      adds: [],
    }) as unknown as eventWithTime,
  );
}

function outputEvents(): Tagged[] {
  return enqueued.flatMap(
    (e) => e.payload.events as Tagged[],
  );
}

/** Deterministic PRNG so failures are reproducible. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * rrweb's stream is a delta chain. An incremental event
 * is only replayable if the player received every event
 * between it and the last full snapshot. Dropping is
 * allowed, but only when a snapshot re-bases the stream
 * before any further incremental is emitted.
 */
function assertReplayable(out: Tagged[]) {
  let sawSnapshot = false;
  let expectedSeq = -1;

  for (let i = 0; i < out.length; i++) {
    const e = out[i];
    if (e.type === FULL_SNAPSHOT) {
      sawSnapshot = true;
      expectedSeq = e.seq + 1;
      continue;
    }
    if (e.type === META) {
      // Carries no DOM delta, so a gap before it is
      // harmless.
      if (e.seq + 1 > expectedSeq) {
        expectedSeq = e.seq + 1;
      }
      continue;
    }

    expect(
      sawSnapshot,
      `incremental seq=${e.seq} at index ${i} ` +
        'reached the player before any full snapshot',
    ).toBe(true);
    expect(
      e.seq,
      `gap before incremental seq=${e.seq} at index ` +
        `${i}: expected seq=${expectedSeq}, so the ` +
        'events in between were dropped without a ' +
        're-base',
    ).toBe(expectedSeq);
    expectedSeq = e.seq + 1;
  }
}

/**
 * The server keys stored objects on segment index and
 * sorts by it, so within a session indices must be
 * unique and ascending in send order.
 */
function assertSegmentIndices() {
  const seen = new Map<string, number>();
  for (const e of enqueued) {
    const sid = e.payload.session_id as string;
    const idx = e.payload.segment_index as number;
    const prev = seen.get(sid);
    if (prev !== undefined) {
      expect(
        idx,
        `session ${sid} sent index ${idx} after ` +
          `${prev}; the server would overwrite or ` +
          'misorder the segment',
      ).toBeGreaterThan(prev);
    }
    seen.set(sid, idx);
  }
}

/** Output must never reorder relative to emission. */
function assertOrdered(out: Tagged[]) {
  for (let i = 1; i < out.length; i++) {
    expect(
      out[i].seq,
      `event at index ${i} (seq=${out[i].seq}) came ` +
        `after seq=${out[i - 1].seq}`,
    ).toBeGreaterThan(out[i - 1].seq);
  }
}

let recorder: typeof import('./recorder');

describe('replay recorder invariants', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    enqueued.length = 0;
    rateLimited = false;
    sessionSeq = 0;
    seqCounter = 0;
    sessionId = 'session-1';
    (
      globalThis as any
    ).requestIdleCallback = undefined;
    recording = false;
    takeFullSnapshot = vi.fn(() => emitSnapshot());
    recorder = await import('./recorder');
    await recorder.initReplay();
    await vi.advanceTimersByTimeAsync(1);
  });

  afterEach(() => {
    recorder.stopReplay();
    vi.useRealTimers();
  });

  for (const seed of [
    1, 7, 42, 99, 256, 777, 1337, 4096, 8191, 31337,
    65535, 90210,
  ]) {
    it(`holds the delta chain under random load (seed ${seed})`, async () => {
      const rnd = makeRng(seed);
      let now = Date.now();

      for (let step = 0; step < 120; step++) {
        const roll = rnd();

        if (roll < 0.55) {
          // Normal activity.
          const n = 1 + Math.floor(rnd() * 20);
          for (let i = 0; i < n; i++) {
            emitIncremental();
          }
        } else if (roll < 0.7) {
          // Burst past the 750-per-5s budget.
          const n = 700 + Math.floor(rnd() * 400);
          for (let i = 0; i < n; i++) {
            emitIncremental();
          }
        } else if (roll < 0.78) {
          // rrweb's periodic checkout, landing while
          // mutations are still inside the 16ms batch
          // window. This is the ordering hazard: the
          // batch must drain before the snapshot.
          const n = 1 + Math.floor(rnd() * 10);
          for (let i = 0; i < n; i++) {
            emitIncremental();
          }
          emitSnapshot();
        } else if (roll < 0.86) {
          rateLimited = !rateLimited;
        } else if (roll < 0.9) {
          sessionId =
            sessionId === 'session-1'
              ? 'session-2'
              : 'session-1';
        } else if (roll < 0.97) {
          document.dispatchEvent(
            new Event('visibilitychange'),
          );
        } else {
          // Full teardown and restart, as a host app
          // calling OodleRum.stop()/init() would do.
          recorder.stopReplay();
          await recorder.initReplay();
        }

        const jump = 20 + Math.floor(rnd() * 8000);
        now += jump;
        vi.setSystemTime(now);
        await vi.advanceTimersByTimeAsync(jump);
      }

      rateLimited = false;
      now += 120_000;
      vi.setSystemTime(now);
      await vi.advanceTimersByTimeAsync(120_000);

      const out = outputEvents();
      expect(out.length).toBeGreaterThan(0);
      assertOrdered(out);
      assertReplayable(out);
      assertSegmentIndices();
    });
  }

  it('never reuses a segment index within a session', async () => {
    const rnd = makeRng(5);
    let now = Date.now();
    for (let step = 0; step < 60; step++) {
      const n = 1 + Math.floor(rnd() * 300);
      for (let i = 0; i < n; i++) emitIncremental();
      const jump = 100 + Math.floor(rnd() * 9000);
      now += jump;
      vi.setSystemTime(now);
      await vi.advanceTimersByTimeAsync(jump);
    }

    const perSession = new Map<string, number[]>();
    for (const e of enqueued) {
      const list =
        perSession.get(e.payload.session_id) ?? [];
      list.push(e.payload.segment_index);
      perSession.set(e.payload.session_id, list);
    }
    for (const [, indices] of perSession) {
      expect(new Set(indices).size).toBe(
        indices.length,
      );
    }
  });
});
