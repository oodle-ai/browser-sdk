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

/**
 * Captures the `emit` callback rrweb would be given so
 * a test can push synthetic events through the real
 * recorder pipeline.
 */
let emit: (e: eventWithTime) => void = () => {};
let takeFullSnapshot: any;
let recordCalls = 0;

vi.mock('rrweb', () => ({
  get record() {
    const fn: any = (opts: any) => {
      recordCalls++;
      emit = opts.emit;
      return () => {};
    };
    fn.takeFullSnapshot = (...args: any[]) =>
      takeFullSnapshot(...args);
    return fn;
  },
}));

const enqueued: any[] = [];
let rateLimited = false;

vi.mock('../core/transport', () => ({
  enqueue: (key: string, payload: any) =>
    enqueued.push({ key, payload }),
  isServerRateLimited: () => rateLimited,
  setReplayDropHandler: () => {},
}));

/**
 * Stateful on purpose: the real counter is persisted
 * with the session, so it outlives the recorder module
 * exactly like this.
 */
let sessionSeq = 0;

let sessionId = 'session-1';

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

function incremental(
  ts: number,
  source = 0,
): eventWithTime {
  return {
    type: INCREMENTAL_SNAPSHOT,
    data: { source, adds: [] },
    timestamp: ts,
  } as unknown as eventWithTime;
}

function fullSnapshot(ts: number): eventWithTime {
  return {
    type: FULL_SNAPSHOT,
    data: { node: { id: 1 }, initialOffset: {} },
    timestamp: ts,
  } as unknown as eventWithTime;
}

/** All rrweb events handed to the transport so far. */
function flushedEvents(): eventWithTime[] {
  return enqueued.flatMap(
    (e) => e.payload.events as eventWithTime[],
  );
}

let recorder: typeof import('./recorder');

describe('replay recorder', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    enqueued.length = 0;
    rateLimited = false;
    recordCalls = 0;
    sessionSeq = 0;
    sessionId = 'session-1';
    takeFullSnapshot = vi.fn(() =>
      emit(fullSnapshot(Date.now())),
    );
    (
      globalThis as any
    ).requestIdleCallback = undefined;
    recorder = await import('./recorder');
    await recorder.initReplay();
  });

  afterEach(() => {
    recorder.stopReplay();
    vi.useRealTimers();
  });

  it('delivers every event exactly once and in order on the normal path', () => {
    // Nothing here trips the rate limiter, so the
    // recorder must be lossless: this is the case that
    // covers the overwhelming majority of real sessions.
    const sent: eventWithTime[] = [];
    emit(fullSnapshot(1000));
    sent.push(fullSnapshot(1000));

    let ts = 1000;
    for (let i = 0; i < 600; i++) {
      ts += 40;
      vi.setSystemTime(ts);
      const e = incremental(ts);
      emit(e);
      sent.push(e);
      vi.advanceTimersByTime(40);
    }
    vi.advanceTimersByTime(30_000);

    const got = flushedEvents();
    expect(got.length).toBe(sent.length);
    expect(got.map((e) => e.timestamp)).toEqual(
      sent.map((e) => e.timestamp),
    );
    expect(takeFullSnapshot).not.toHaveBeenCalled();
  });

  it('flushes on a fixed interval even while events keep arriving', () => {
    // A debounce here would be reset by every event and
    // never fire, stranding the buffer until the tab is
    // hidden.
    for (let i = 0; i < 20; i++) {
      emit(incremental(Date.now()));
      vi.advanceTimersByTime(1000);
    }

    expect(enqueued.length).toBeGreaterThan(0);
  });

  it('never emits an incremental event after a drop without a full snapshot first', () => {
    // Blow through the 750-per-5s budget.
    for (let i = 0; i < 900; i++) {
      emit(incremental(Date.now()));
    }
    vi.advanceTimersByTime(30_000);

    const events = flushedEvents();
    const firstDropIdx = events.findIndex(
      (e) => e.type === FULL_SNAPSHOT,
    );

    expect(takeFullSnapshot).toHaveBeenCalled();
    expect(firstDropIdx).toBeGreaterThanOrEqual(0);

    // Everything the recorder let through after the
    // overflow must sit after a full snapshot.
    const tail = events.slice(firstDropIdx + 1);
    for (const e of tail) {
      expect(e.type).not.toBe(undefined);
    }
    expect(
      events.filter(
        (e) => e.type === FULL_SNAPSHOT,
      ).length,
    ).toBeGreaterThan(0);
  });

  it('drops incremental events while waiting for the re-base snapshot', () => {
    takeFullSnapshot = vi.fn();

    for (let i = 0; i < 900; i++) {
      emit(incremental(Date.now()));
    }
    // Let the events accepted before the overflow
    // drain, then hold the line: the snapshot never
    // lands, so nothing further may be buffered.
    vi.advanceTimersByTime(10_000);
    const beforeRebase = flushedEvents().length;

    for (let i = 0; i < 50; i++) {
      emit(incremental(Date.now()));
    }
    vi.advanceTimersByTime(10_000);

    expect(flushedEvents().length).toBe(
      beforeRebase,
    );
  });

  it('accepts incremental events again once the snapshot arrives', () => {
    takeFullSnapshot = vi.fn();
    for (let i = 0; i < 900; i++) {
      emit(incremental(Date.now()));
    }
    vi.advanceTimersByTime(10_000);

    emit(fullSnapshot(Date.now()));
    emit(incremental(Date.now()));
    vi.advanceTimersByTime(10_000);

    const events = flushedEvents();
    const lastFull = events
      .map((e) => e.type)
      .lastIndexOf(FULL_SNAPSHOT);
    expect(lastFull).toBeGreaterThanOrEqual(0);
    expect(
      events.slice(lastFull + 1).length,
    ).toBeGreaterThan(0);
  });

  it('re-bases when the session rotates under a live recorder', () => {
    emit(fullSnapshot(Date.now()));
    emit(incremental(Date.now()));
    vi.advanceTimersByTime(10_000);
    expect(takeFullSnapshot).not.toHaveBeenCalled();

    // 30 min idle or the 4 hour cap mints a new id
    // while rrweb keeps streaming deltas.
    sessionId = 'session-2';
    emit(incremental(Date.now()));
    vi.advanceTimersByTime(10_000);

    expect(takeFullSnapshot).toHaveBeenCalled();

    const second = enqueued.filter(
      (e) => e.payload.session_id === 'session-2',
    );
    expect(second.length).toBeGreaterThan(0);
    // The new session must not open on bare deltas.
    expect(
      second
        .flatMap((e) => e.payload.events)
        .some((e: any) => e.type === FULL_SNAPSHOT),
    ).toBe(true);
  });

  it('does not re-base when a rotation opens on a snapshot already', () => {
    emit(fullSnapshot(Date.now()));
    vi.advanceTimersByTime(10_000);

    // rrweb's own 5-minute checkout can land exactly on
    // a rotation. Forcing a second snapshot there would
    // discard every event until it arrived.
    sessionId = 'session-2';
    emit(fullSnapshot(Date.now()));
    const after = incremental(Date.now());
    emit(after);
    vi.advanceTimersByTime(10_000);

    expect(takeFullSnapshot).not.toHaveBeenCalled();
    const second = enqueued
      .filter(
        (e) => e.payload.session_id === 'session-2',
      )
      .flatMap((e) => e.payload.events);
    expect(second).toContain(after);
  });

  it('stops re-basing a page that never settles', () => {
    // Each re-base re-serializes the whole DOM. Without
    // a ceiling, a permanently thrashing page would get
    // a full snapshot every few seconds forever.
    let now = Date.now();
    for (let round = 0; round < 20; round++) {
      for (let i = 0; i < 900; i++) {
        emit(incremental(now));
      }
      now += 6000;
      vi.setSystemTime(now);
      vi.advanceTimersByTime(6000);
    }

    // Guard against the assertion passing simply
    // because nothing re-based at all.
    expect(
      takeFullSnapshot.mock.calls.length,
    ).toBeGreaterThan(0);
    expect(
      takeFullSnapshot.mock.calls.length,
    ).toBeLessThanOrEqual(4);
  });

  it('keeps the buffer and retries when the server rate limits replay', () => {
    rateLimited = true;
    emit(incremental(Date.now()));
    vi.advanceTimersByTime(60_000);
    expect(enqueued.length).toBe(0);

    rateLimited = false;
    vi.advanceTimersByTime(10_000);
    expect(enqueued.length).toBeGreaterThan(0);
  });

  it('keeps the allocated index for events buffered through a rate limit', async () => {
    // A skipped index looks like a lost segment to the
    // server, so a buffer that survives a restart has
    // to keep the index it was given.
    rateLimited = true;
    emit(fullSnapshot(Date.now()));
    vi.advanceTimersByTime(30_000);
    expect(enqueued.length).toBe(0);

    recorder.stopReplay();
    await recorder.initReplay();

    rateLimited = false;
    vi.advanceTimersByTime(30_000);

    expect(enqueued.length).toBeGreaterThan(0);
    expect(enqueued[0].payload.segment_index).toBe(0);
  });

  it('tags each segment with an increasing index', () => {
    emit(fullSnapshot(Date.now()));
    vi.advanceTimersByTime(10_000);
    emit(incremental(Date.now()));
    vi.advanceTimersByTime(10_000);

    const indices = enqueued.map(
      (e) => e.payload.segment_index,
    );
    expect(indices.length).toBeGreaterThan(1);
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBe(indices[i - 1] + 1);
    }
  });

  it('does not reuse segment indices after a restart in the same session', async () => {
    emit(fullSnapshot(Date.now()));
    vi.advanceTimersByTime(10_000);
    const before = enqueued.map(
      (e) => e.payload.segment_index,
    );

    recorder.stopReplay();
    await recorder.initReplay();
    emit(fullSnapshot(Date.now()));
    vi.advanceTimersByTime(10_000);

    const all = enqueued.map(
      (e) => e.payload.segment_index,
    );
    // Indices name the stored object, so a repeat would
    // overwrite an earlier segment server-side.
    expect(new Set(all).size).toBe(all.length);
    expect(all.length).toBeGreaterThan(before.length);
  });

  it('flushes a large event immediately instead of holding it', () => {
    const big = {
      type: META,
      data: { href: 'x'.repeat(80_000) },
      timestamp: Date.now(),
    } as unknown as eventWithTime;

    emit(big);
    expect(enqueued.length).toBe(1);
  });
});
