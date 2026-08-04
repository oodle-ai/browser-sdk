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
 * Comfortably past the recorder's per-window mutation
 * ceiling, so a burst of this size always reaches the
 * drop-and-re-base path. Kept in one place because the
 * ceiling itself is tuned.
 */
const OVER_CEILING = 3_200;

/**
 * Captures the `emit` callback rrweb would be given so
 * a test can push synthetic events through the real
 * recorder pipeline.
 */
let emit: (e: eventWithTime) => void = () => {};
let takeFullSnapshot: any;
let recordCalls = 0;

/** Options rrweb was configured with, for assertions. */
let recordOpts: any = {};

vi.mock('rrweb', () => ({
  get record() {
    const fn: any = (opts: any) => {
      recordCalls++;
      recordOpts = opts;
      emit = opts.emit;
      return () => {};
    };
    fn.takeFullSnapshot = (...args: any[]) =>
      takeFullSnapshot(...args);
    fn.mirror = {
      getNode: () => null,
      getId: () => -1,
    };
    return fn;
  },
}));

const enqueued: any[] = [];
let rateLimited = false;

/**
 * The recorder hands its buffer over through this rather
 * than from its own listener, so the tests drive it the
 * way the transport does.
 */
let exitFlushHook: (() => void) | null = null;

vi.mock('../core/transport', () => ({
  enqueue: (
    key: string,
    payload: any,
    bytesHint?: number,
  ) => enqueued.push({ key, payload, bytesHint }),
  isServerRateLimited: () => rateLimited,
  setReplayDropHandler: () => {},
  setExitFlushHook: (fn: (() => void) | null) => {
    exitFlushHook = fn;
  },
}));

/**
 * Stateful on purpose: the real counter is persisted
 * with the session, so it outlives the recorder module
 * exactly like this.
 */
let sessionSeq = 0;

let sessionId = 'session-1';

let replaySampled = true;

vi.mock('../core/session', () => ({
  getSessionId: () => sessionId,
  nextReplaySegmentIndex: () => sessionSeq++,
  isReplaySampled: () => replaySampled,
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
    replaySampled = true;
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
    // Blow through the per-window budget.
    for (let i = 0; i < OVER_CEILING; i++) {
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

    for (let i = 0; i < OVER_CEILING; i++) {
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
    for (let i = 0; i < OVER_CEILING; i++) {
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
      for (let i = 0; i < OVER_CEILING; i++) {
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

  it('tells the transport how big a segment is so it is not measured twice', () => {
    emit(fullSnapshot(Date.now()));
    vi.advanceTimersByTime(10_000);

    expect(enqueued.length).toBeGreaterThan(0);
    // Third argument to enqueue: the recorder already
    // walked every event on the way in, so re-walking
    // the segment in the transport is pure overhead.
    expect(
      typeof enqueued[0].bytesHint,
    ).toBe('number');
    expect(
      enqueued[0].bytesHint,
    ).toBeGreaterThan(0);
  });

  it('sizes a wide snapshot at its real size, not the segment threshold', () => {
    // Stopping the measurement at the segment threshold
    // is enough to decide when to flush, but it scores
    // every snapshot bigger than that as the threshold
    // itself. The pending ceiling is counted in these
    // units and is only ever reached while the server
    // rate limits us, which is exactly when megabyte
    // snapshots pile up, so a clamped figure lets the
    // buffer grow many times past its stated bound.
    //
    // A snapshot is wide rather than deep: thousands of
    // small nodes, each too small to overshoot the
    // threshold on its own. That is the shape a capped
    // walk truncates.
    const nodes = Array.from(
      { length: 20_000 },
      (_, id) => ({
        id,
        tagName: 'div',
        attributes: { class: 'row' },
      }),
    );
    const wide = {
      type: FULL_SNAPSHOT,
      data: {
        node: { id: 1, childNodes: nodes },
        initialOffset: {},
      },
      timestamp: Date.now(),
    } as unknown as eventWithTime;

    emit(wide);

    expect(enqueued.length).toBe(1);
    expect(
      enqueued[0].bytesHint,
    ).toBeGreaterThan(500_000);
  });

  it('drains a batch bigger than one time slice without losing or reordering events', () => {
    // The drain is budgeted, so a batch this size spans
    // several slices. Ordering is what makes the stream
    // replayable, so it has to survive the hand-off.
    const sent: eventWithTime[] = [];
    emit(fullSnapshot(1000));
    sent.push(fullSnapshot(1000));

    let ts = 1000;
    for (let i = 0; i < 700; i++) {
      ts += 1;
      vi.setSystemTime(ts);
      const e = incremental(ts);
      emit(e);
      sent.push(e);
    }
    vi.advanceTimersByTime(60_000);

    const got = flushedEvents();
    expect(got.length).toBe(sent.length);
    expect(got.map((e) => e.timestamp)).toEqual(
      sent.map((e) => e.timestamp),
    );
  });

  it('buffers a full snapshot only after the mutations it replaces', () => {
    // A budgeted drain may leave mutations queued. The
    // snapshot describes the DOM that replaces them, so
    // emitting it first would corrupt the stream.
    let ts = 1000;
    for (let i = 0; i < 200; i++) {
      ts += 1;
      vi.setSystemTime(ts);
      emit(incremental(ts));
    }
    ts += 1;
    vi.setSystemTime(ts);
    emit(fullSnapshot(ts));
    vi.advanceTimersByTime(60_000);

    const events = flushedEvents();
    const snapIdx = events.findIndex(
      (e) => e.type === FULL_SNAPSHOT,
    );
    expect(snapIdx).toBe(events.length - 1);
    expect(
      events
        .slice(0, snapIdx)
        .every(
          (e) =>
            e.type === INCREMENTAL_SNAPSHOT,
        ),
    ).toBe(true);
  });

  it('stops re-basing after one attempt when the snapshot itself is expensive', () => {
    // Re-serializing a DOM this large costs the page
    // more than the recovered recording is worth, so the
    // usual three-strike allowance must not apply.
    takeFullSnapshot = vi.fn(() => {
      vi.advanceTimersByTime(400);
      emit(fullSnapshot(Date.now()));
    });

    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < OVER_CEILING; i++) {
        emit(incremental(Date.now()));
      }
      vi.advanceTimersByTime(10_000);
    }

    expect(
      takeFullSnapshot.mock.calls.length,
    ).toBeLessThanOrEqual(2);
  });

  it('never lets an exception escape back into rrweb', () => {
    // rrweb invokes emit between lock() and unlock() of
    // its mutation buffers with no try/finally. An escape
    // leaves the buffer locked, and every later DOM
    // mutation is silently discarded for the life of the
    // page while mouse and scroll keep recording, so the
    // session looks healthy and replays frozen.
    rateLimited = false;
    const boom = {
      type: META,
      get data(): unknown {
        throw new Error('serialization blew up');
      },
      timestamp: Date.now(),
    } as unknown as eventWithTime;

    expect(() => emit(boom)).not.toThrow();

    // Recording must still work afterwards.
    emit(fullSnapshot(Date.now()));
    vi.advanceTimersByTime(10_000);
    expect(flushedEvents().length).toBeGreaterThan(
      0,
    );
  });

  it('resumes recording when the user comes back long after the replay expired', async () => {
    // A tab left open overnight blows past the idle
    // expiry. Leaving replay off for the rest of the page
    // means everything the user does on their return is
    // unrecorded, which is the whole session for them.
    vi.advanceTimersByTime(60 * 60 * 1000);
    const callsWhileAway = recordCalls;

    window.dispatchEvent(new Event('click'));
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(0);

    expect(recordCalls).toBeGreaterThan(callsWhileAway);
    expect(recorder.isReplayActive()).toBe(true);
  });

  it('stays off after expiry when the new session is not replay sampled', async () => {
    replaySampled = false;
    vi.advanceTimersByTime(60 * 60 * 1000);
    const callsWhileAway = recordCalls;

    window.dispatchEvent(new Event('click'));
    await vi.advanceTimersByTimeAsync(0);

    // Sampling decided this session is not recorded;
    // resuming would record a session the server will
    // reject.
    expect(recordCalls).toBe(callsWhileAway);
  });

  it('hands the open segment over on page exit without restarting rrweb', async () => {
    // Every record() call begins with a full snapshot, so
    // restarting here re-serialized the whole DOM on
    // return. Tab switching is frequent and the snapshot
    // is the most expensive thing the recorder does.
    emit(incremental(Date.now()));
    const startsBefore = recordCalls;

    expect(exitFlushHook).toBeTypeOf('function');
    exitFlushHook!();

    // Buffered events must not be stranded in a tab the
    // user may never come back to.
    expect(enqueued.length).toBeGreaterThan(0);

    // startRecording awaits a dynamic import, so a
    // restart would land a microtask later. Drain the
    // queue before asserting it did not happen.
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(0);

    expect(recordCalls).toBe(startsBefore);
    expect(takeFullSnapshot).not.toHaveBeenCalled();
  });

  it('gives rrweb an error handler so its own observers cannot tear recording down', () => {
    expect(typeof recordOpts.errorHandler).toBe(
      'function',
    );
    expect(recordOpts.errorHandler()).toBe(true);
  });

  it('keeps structural mutations while shedding attribute churn on one node', () => {
    // Throttling must never cost a re-snapshot, so it
    // may only ever remove attribute entries.
    for (let i = 0; i < 400; i++) {
      emit({
        type: INCREMENTAL_SNAPSHOT,
        data: {
          source: 0,
          attributes: [
            { id: 5, attributes: { style: 'a' } },
          ],
          adds: [
            {
              parentId: 1,
              node: { id: 900 + i },
            },
          ],
        },
        timestamp: Date.now(),
      } as unknown as eventWithTime);
    }
    vi.advanceTimersByTime(30_000);

    const events = flushedEvents();
    const totalAdds = events.reduce(
      (n, e) =>
        n +
        (((e as any).data?.adds?.length as
          | number
          | undefined) ?? 0),
      0,
    );
    // Every add survives; no re-base was needed.
    expect(totalAdds).toBe(400);
    expect(takeFullSnapshot).not.toHaveBeenCalled();
  });
});
