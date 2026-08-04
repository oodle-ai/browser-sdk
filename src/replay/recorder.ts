import type { eventWithTime } from '@rrweb/types';
import { getConfig } from '../core/config';
import {
  getSessionId,
  isReplaySampled,
  nextReplaySegmentIndex,
} from '../core/session';
import { estimateJsonBytes } from '../core/size';
import { incrTelemetry } from '../core/telemetry';
import { createMutationThrottler } from './mutation-throttle';
import {
  enqueue,
  isServerRateLimited,
  setReplayDropHandler,
} from '../core/transport';

const REPLAY_BATCH_KEY = 'replay';
const MAX_BUFFER_SIZE = 200;
const SEGMENT_BYTES_LIMIT = 60_000;
const DEFAULT_REPLAY_FLUSH_MS = 5_000;

/**
 * Ceiling on unsent replay bytes, reached only while
 * the server is rate limiting replay; past it the
 * oldest events are dropped and the stream re-based.
 * Failed sends do not count here, they are bounded by
 * the transport's own retry-queue cap.
 *
 * Approximate on the high side: per-event measurement
 * stops at SEGMENT_BYTES_LIMIT, so a full snapshot
 * counts as 60KB rather than its true size. Measuring
 * exactly would mean a full walk of every snapshot,
 * which is not worth it for a degraded-state guard:
 * stringifying a multi-megabyte snapshot just to size it
 * costs tens of milliseconds on the main thread, and the
 * transport stringifies it again to build the envelope.
 */
const MAX_PENDING_BYTES = 8_000_000;

const FULL_SNAPSHOT = 2;
const INCREMENTAL_SNAPSHOT = 3;

/**
 * Absolute ceiling on mutation events accepted per
 * window, and the only path that still drops one.
 *
 * Deliberately generous, because what used to justify a
 * tight limit is now handled instead of dropped:
 * attribute churn is shed per node and the drain is
 * time-sliced. What is left is structural churn, where
 * dropping an event invalidates the delta chain and
 * forces a full re-serialization, so tripping this early
 * costs far more than carrying the events.
 */
const MUTATIONS_PER_WINDOW = 3_000;
const WINDOW_MS = 5000;
const CIRCUIT_BREAK_THRESHOLD = 3;
const OVERLOAD_COOLDOWN_MS = 30_000;
const MIN_REBASE_INTERVAL_MS = 5000;
const MUTATION_BATCH_DELAY = 16;
const MUTATION_BATCH_TIMEOUT = 100;

/**
 * Slice budget when the drain runs off a plain timer.
 * Reaching that path means the browser never offered us
 * idle time, so the page is busy and the slice stays
 * short.
 *
 * Slicing at all matters because draining in one pass is
 * unbounded work: a page that builds a large subtree in
 * one commit queues thousands of events, and measuring
 * them all before returning holds the main thread for
 * the whole batch.
 */
const DRAIN_BUSY_MS = 4;

/**
 * Ceiling on a slice the browser gave us an idle
 * deadline for. Idle periods run far longer than a few
 * milliseconds, and every extra slice costs scheduling
 * overhead, so draining more per idle period is strictly
 * better than more slices doing the same total work.
 */
const DRAIN_IDLE_MAX_MS = 30;

/**
 * Checked only between chunks, so a slice always makes
 * progress and small batches still drain in one pass
 * regardless of how coarse the clock is.
 */
const DRAIN_CHUNK = 32;

/**
 * A full snapshot slower than this means the DOM is
 * large enough that re-serializing it is worse for the
 * page than losing the recording, so the usual
 * three-strike allowance does not apply.
 */
const EXPENSIVE_SNAPSHOT_MS = 250;

/**
 * Every checkout is a full re-serialization of the DOM.
 * Spacing them out costs seek granularity during
 * playback and saves the recorded page real work.
 */
const CHECKOUT_INTERVAL_MS = 360_000;

/**
 * iOS and iPadOS. iPadOS reports itself as Macintosh, so
 * touch points are what actually distinguish it.
 */
function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent ?? '';
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return (
    /Macintosh/i.test(ua) &&
    (navigator.maxTouchPoints ?? 0) > 1
  );
}

const DEFAULT_IDLE_PAUSE_MS = 300_000;
const DEFAULT_IDLE_EXPIRE_MS = 900_000;

/**
 * Minimum gap between re-arming the idle timers from user
 * activity. The thresholds they guard are minutes long,
 * so being a second stale costs nothing, and the
 * listeners include mousemove.
 */
const IDLE_ARM_THROTTLE_MS = 1_000;

type RecordApi = typeof import('rrweb')['record'];

/**
 * Structural rather than the DOM lib type: a page that
 * polyfills requestIdleCallback may invoke the callback
 * with no deadline, or with a partial one.
 */
interface IdleDeadlineLike {
  didTimeout: boolean;
  timeRemaining(): number;
}

let recordApi: RecordApi | null = null;
let stopFn: (() => void) | null = null;
let startInFlight: Promise<void> | null = null;

let buffer: eventWithTime[] = [];
let bufferBytes = 0;
let bufferSessionId = '';
let replayHasFlushed = false;

/**
 * Allocated together with bufferSessionId so the id and
 * the index always come from the same session, even if
 * the session rotates while a buffer is open.
 */
let bufferSegmentIndex = 0;

/** Session the previous segment was attributed to. */
let lastSegmentSessionId = '';

let mutationCount = 0;
let windowStart = Date.now();
let recordingDisabled = false;

/**
 * Consecutive re-bases without the page settling. Each
 * one re-serializes the entire DOM, so an page that
 * never settles has to be given up on rather than
 * snapshotted every few seconds forever.
 */
let rebaseStreak = 0;
let overloadTimer: ReturnType<
  typeof setTimeout
> | null = null;

/**
 * rrweb emits a delta stream: every incremental event
 * is expressed against the DOM the previous events
 * built. Dropping one event invalidates every event
 * after it, so any drop must be followed by a fresh
 * full snapshot before incremental events are accepted
 * again.
 */
let needsRebase = false;
let rebaseTimer: ReturnType<
  typeof setTimeout
> | null = null;
let lastRebaseAt = 0;

let pendingMutations: eventWithTime[] = [];

/**
 * Read cursor into pendingMutations. A slice that runs
 * out of budget leaves the rest in place and advances
 * this instead of splicing, so resuming stays O(1)
 * rather than re-copying the tail each time.
 */
let pendingCursor = 0;
let mutationBatchTimer: ReturnType<
  typeof setTimeout
> | null = null;
let mutationIdleCancel:
  | (() => void)
  | null = null;

/**
 * Duration of the most recent full snapshot, used to
 * decide whether another one is affordable.
 */
let lastSnapshotMs = 0;

function nowMs(): number {
  return typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

const mutationThrottler = createMutationThrottler(
  () => recordApi?.mirror ?? null,
);

let idleTimer: ReturnType<
  typeof setTimeout
> | null = null;
let expireTimer: ReturnType<
  typeof setTimeout
> | null = null;
let idlePaused = false;
let idleExpired = false;
let lastIdleArmMs = 0;
let interactionTeardown:
  | (() => void)
  | null = null;
let visibilityTeardown:
  | (() => void)
  | null = null;

let replayConfig: {
  privacyLevel: string;
  maskAllInputs: boolean;
  maskInputOptions: Record<string, boolean>;
  maskTextContent: boolean;
} | null = null;

function clearMutationTimers() {
  if (mutationBatchTimer) {
    clearTimeout(mutationBatchTimer);
    mutationBatchTimer = null;
  }
  if (mutationIdleCancel) {
    mutationIdleCancel();
    mutationIdleCancel = null;
  }
}

/**
 * Drains the batch into the segment buffer.
 *
 * `sliced` of false drains everything before returning,
 * which the ordering-critical callers need: a full
 * snapshot replaces the DOM the queued mutations
 * describe, so it may not be buffered while any of them
 * are still queued behind it.
 *
 * A polyfilled requestIdleCallback may invoke its
 * callback with no deadline, so the idle budget is only
 * used when one actually arrives.
 */
function drainMutations(
  sliced: boolean,
  idleDeadline?: IdleDeadlineLike,
) {
  clearMutationTimers();
  const idleMs =
    idleDeadline && !idleDeadline.didTimeout
      ? Math.min(
          idleDeadline.timeRemaining(),
          DRAIN_IDLE_MAX_MS,
        )
      : null;
  const deadline = !sliced
    ? Number.POSITIVE_INFINITY
    : nowMs() + (idleMs ?? DRAIN_BUSY_MS);

  while (
    pendingCursor < pendingMutations.length
  ) {
    const end = Math.min(
      pendingCursor + DRAIN_CHUNK,
      pendingMutations.length,
    );
    while (pendingCursor < end) {
      addToBuffer(
        pendingMutations[pendingCursor++],
      );
    }
    if (nowMs() >= deadline) break;
  }

  if (
    pendingCursor >= pendingMutations.length
  ) {
    pendingMutations = [];
    pendingCursor = 0;
    return;
  }
  // Reclaim the drained prefix so a run of
  // budget-limited slices cannot grow the array without
  // bound.
  if (pendingCursor >= DRAIN_CHUNK * 8) {
    pendingMutations =
      pendingMutations.slice(pendingCursor);
    pendingCursor = 0;
  }
  scheduleMutationFlush();
}

function flushMutationBatch() {
  drainMutations(false);
}

function scheduleMutationFlush() {
  if (mutationBatchTimer) return;
  if (
    typeof requestIdleCallback !== 'undefined'
  ) {
    const id = requestIdleCallback(
      (deadline?: IdleDeadlineLike) => {
        mutationIdleCancel = null;
        drainMutations(true, deadline);
      },
      { timeout: MUTATION_BATCH_TIMEOUT },
    );
    mutationIdleCancel = () =>
      cancelIdleCallback(id);
  }
  mutationBatchTimer = setTimeout(() => {
    mutationBatchTimer = null;
    if (mutationIdleCancel) {
      mutationIdleCancel();
      mutationIdleCancel = null;
    }
    drainMutations(true);
  }, MUTATION_BATCH_DELAY);
}

// --- Re-base after a drop ---

function requestRebase(immediate = false) {
  needsRebase = true;
  if (rebaseTimer) return;

  // Wait for the current rate-limit window to close
  // before re-serializing the DOM: the page is busy,
  // and a full snapshot is the most expensive thing we
  // can do to it. A session rotation is not the page's
  // fault, so that case does not wait; every event
  // until the snapshot lands is unusable.
  let delay = 0;
  if (!immediate) {
    const sinceWindow = Date.now() - windowStart;
    const untilWindowEnd = Math.max(
      0,
      WINDOW_MS - sinceWindow,
    );
    const sinceRebase = Date.now() - lastRebaseAt;
    const untilRebaseAllowed = Math.max(
      0,
      MIN_REBASE_INTERVAL_MS - sinceRebase,
    );
    delay = Math.max(
      untilWindowEnd,
      untilRebaseAllowed,
    );
  }

  rebaseTimer = setTimeout(() => {
    rebaseTimer = null;
    rebase();
  }, delay);
}

function rebase() {
  if (!needsRebase) return;
  if (!recordApi || !stopFn) return;
  if (recordingDisabled) return;

  rebaseStreak++;
  // A snapshot that already proved expensive gets one
  // attempt, not three. The whole point of a re-base is
  // to make the stream usable again, and on a DOM this
  // large the snapshot costs the page more than the
  // recovered recording is worth.
  const streakLimit =
    lastSnapshotMs > EXPENSIVE_SNAPSHOT_MS
      ? 1
      : CIRCUIT_BREAK_THRESHOLD;
  if (rebaseStreak > streakLimit) {
    // The page is dropping events faster than it
    // settles. Serializing the whole DOM every few
    // seconds costs more than the recording is worth,
    // so back off instead.
    pauseForOverload();
    return;
  }

  lastRebaseAt = Date.now();
  mutationCount = 0;
  windowStart = Date.now();
  try {
    // Clears needsRebase via the emit handler once the
    // snapshot event actually arrives.
    const startedAt = nowMs();
    recordApi.takeFullSnapshot(true);
    lastSnapshotMs = nowMs() - startedAt;
    incrTelemetry('replay_rebases');
    if (lastSnapshotMs > EXPENSIVE_SNAPSHOT_MS) {
      incrTelemetry(
        'replay_expensive_snapshots',
      );
    }
  } catch {
    // Restart instead: a fresh record() call always
    // begins with its own full snapshot. rrweb is
    // stopped in between, so no deltas can slip out
    // against the stale DOM.
    stopRecording();
    void startRecording();
  }
}

function dropEvent() {
  incrTelemetry('replay_events_dropped');
}

// --- Buffering ---

/**
 * Starts a segment if none is open. Returns true when
 * that segment belongs to a different session than the
 * previous one.
 */
function openBuffer(): boolean {
  if (bufferSessionId) return false;

  bufferSessionId = getSessionId();
  bufferSegmentIndex = nextReplaySegmentIndex();
  const rotated =
    lastSegmentSessionId !== '' &&
    lastSegmentSessionId !== bufferSessionId;
  lastSegmentSessionId = bufferSessionId;
  return rotated;
}

function flushReplayBuffer() {
  clearFlushTimer();
  if (buffer.length === 0) return;

  if (isServerRateLimited(REPLAY_BATCH_KEY)) {
    // Retry on the next tick instead of stalling until
    // some future event happens to schedule a flush.
    trimBufferToLimit();
    scheduleFlush();
    return;
  }

  // A non-empty buffer always has these already; the
  // call is defensive, not an allocation point.
  openBuffer();
  const sessionId = bufferSessionId;
  const index = bufferSegmentIndex;
  const batch = buffer.splice(0);
  const batchBytes = bufferBytes;
  bufferBytes = 0;
  bufferSessionId = '';
  replayHasFlushed = true;

  enqueue(
    REPLAY_BATCH_KEY,
    {
      session_id: sessionId,
      segment_index: index,
      events: batch,
    } as any,
    batchBytes,
  );
}

/**
 * Bounds memory when nothing can be sent. Dropping the
 * oldest events breaks the delta chain, so the stream
 * is re-based afterwards.
 */
function trimBufferToLimit() {
  if (bufferBytes <= MAX_PENDING_BYTES) return;

  // Discard everything, not just the oldest events.
  // Trimming a prefix leaves a tail that describes
  // mutations to DOM the player never received, and
  // the re-base that follows only protects events
  // recorded after it.
  incrTelemetry(
    'replay_events_dropped',
    buffer.length,
  );
  buffer.length = 0;
  bufferBytes = 0;
  requestRebase();
}

let replayFlushTimer: ReturnType<
  typeof setTimeout
> | null = null;

function clearFlushTimer() {
  if (replayFlushTimer) {
    clearTimeout(replayFlushTimer);
    replayFlushTimer = null;
  }
}

/**
 * Anchored to the first buffered event, not reset on
 * every event. A debounce here never fires on a page
 * with steady DOM activity, which holds the buffer
 * hostage until the tab is hidden.
 */
function scheduleFlush() {
  if (replayFlushTimer) return;
  const interval =
    getConfig().replayFlushIntervalMs ??
    DEFAULT_REPLAY_FLUSH_MS;
  replayFlushTimer = setTimeout(() => {
    replayFlushTimer = null;
    flushReplayBuffer();
  }, interval);
}

function addToBuffer(event: eventWithTime) {
  if (openBuffer() && event.type !== FULL_SNAPSHOT) {
    // The session rotated (30 min idle or the 4 hour
    // cap) while the recorder kept running. rrweb knows
    // nothing about that, so the new session would
    // otherwise open on incremental events describing a
    // DOM it never received a snapshot of. Nothing to
    // do when the opening event is already a snapshot.
    requestRebase(true);
  }
  buffer.push(event);
  bufferBytes += estimateJsonBytes(
    event,
    SEGMENT_BYTES_LIMIT,
  );

  if (
    buffer.length >= MAX_BUFFER_SIZE ||
    bufferBytes >= SEGMENT_BYTES_LIMIT
  ) {
    flushReplayBuffer();
  } else {
    scheduleFlush();
  }
}

// --- Overload circuit breaker ---

function pauseForOverload() {
  recordingDisabled = true;
  incrTelemetry('replay_overload_pauses');
  stopRecording();

  if (overloadTimer) clearTimeout(overloadTimer);
  overloadTimer = setTimeout(() => {
    overloadTimer = null;
    recordingDisabled = false;
    rebaseStreak = 0;
    mutationCount = 0;
    windowStart = Date.now();
    if (
      !idlePaused &&
      !idleExpired &&
      replayConfig
    ) {
      void startRecording();
    }
  }, OVERLOAD_COOLDOWN_MS);
}

function handleEvent(event: eventWithTime) {
  if (recordingDisabled) return;

  if (event.type === FULL_SNAPSHOT) {
    // Incremental events sit in a 16ms batch before
    // they reach the buffer. Draining it first keeps
    // emission order: mutations recorded before this
    // snapshot describe the DOM it replaces, so
    // replaying them after it corrupts the stream.
    flushMutationBatch();
    // Stream is re-based: incremental events are
    // meaningful again.
    needsRebase = false;
    mutationCount = 0;
    windowStart = Date.now();
    addToBuffer(event);
    return;
  }

  if (event.type !== INCREMENTAL_SNAPSHOT) {
    flushMutationBatch();
    addToBuffer(event);
    return;
  }

  if (needsRebase) {
    dropEvent();
    requestRebase();
    return;
  }

  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    // A whole window inside budget means the page
    // settled, so forgive the earlier overload.
    if (mutationCount <= MUTATIONS_PER_WINDOW) {
      rebaseStreak = 0;
    }
    mutationCount = 0;
    windowStart = now;
  }

  // Shed attribute churn per node before the absolute
  // ceiling is reached. This keeps the delta chain
  // intact, so unlike a dropped event it never costs a
  // re-snapshot.
  const throttled = mutationThrottler.throttle(event);
  if (throttled.dropped > 0) {
    incrTelemetry(
      'replay_attributes_throttled',
      throttled.dropped,
    );
  }
  // Absorbed entirely, so it never reaches the stream and
  // must not spend the ceiling's budget: styling churn
  // the throttler already handled would otherwise push a
  // later structural mutation over the edge and cost the
  // re-snapshot this design exists to avoid.
  if (!throttled.event) return;

  mutationCount++;
  if (mutationCount > MUTATIONS_PER_WINDOW) {
    // Past the ceiling the page is mutating structure,
    // not just styling, faster than throttling can
    // absorb. Only here is an event dropped, and only
    // then does the stream need re-basing.
    dropEvent();
    requestRebase();
    return;
  }

  pendingMutations.push(throttled.event);
  scheduleMutationFlush();
}

async function startRecording(): Promise<void> {
  if (!replayConfig) return;
  if (recordingDisabled) return;
  if (stopFn) return;
  if (startInFlight) return startInFlight;

  startInFlight = doStartRecording().finally(
    () => {
      startInFlight = null;
    },
  );
  return startInFlight;
}

async function doStartRecording(): Promise<void> {
  if (!replayConfig) return;

  // rrweb also honours its own `rr-block` class, so a
  // host app can exclude a subtree too large to record
  // without needing an SDK option for it.
  const BLOCK_SELECTOR =
    '[data-oodle-privacy="hidden"],' +
    '.oodle-privacy-hidden';
  const MASK_TEXT_SELECTOR =
    '[data-oodle-privacy="mask"],' +
    '.oodle-privacy-mask';

  const { record } = await import('rrweb');

  // A concurrent stop() (tab hidden, idle expiry) may
  // have landed while the dynamic import resolved.
  if (!replayConfig || recordingDisabled) return;
  if (stopFn) return;

  recordApi = record;
  needsRebase = false;
  mutationCount = 0;
  windowStart = Date.now();
  // A fresh recorder builds a fresh mirror, so the node
  // ids the per-node budgets are keyed on no longer refer
  // to the same elements.
  mutationThrottler.reset();

  stopFn =
    record({
      sampling: {
        // Recording mousemove on iOS blocks the main
        // thread badly enough that Safari stalls, so it
        // is off rather than merely sampled there.
        mousemove: isAppleTouchDevice() ? false : 50,
        mouseInteraction: true,
        scroll: 100,
        input: 'last',
      },
      slimDOMOptions: 'all',
      checkoutEveryNms: CHECKOUT_INTERVAL_MS,
      /**
       * rrweb runs this between `lock()` and `unlock()`
       * of its mutation buffers with no `try/finally`, so
       * an exception escaping here leaves the buffer
       * locked and every later DOM mutation is silently
       * discarded. Recording looks alive (mouse and
       * scroll still arrive) while the replay stays
       * frozen on the last snapshot.
       */
      emit(event: eventWithTime) {
        try {
          handleEvent(event);
        } catch {
          incrTelemetry('replay_emit_errors');
        }
      },
      /**
       * Applies the same containment to rrweb's own
       * observers, which are otherwise wrapped only when
       * a handler is supplied.
       */
      errorHandler: () => true,
      maskAllInputs:
        replayConfig.maskAllInputs,
      maskInputOptions:
        replayConfig.maskInputOptions,
      maskTextFn: replayConfig.maskTextContent
        ? () => '•••'
        : undefined,
      blockSelector: BLOCK_SELECTOR,
      maskTextSelector: MASK_TEXT_SELECTOR,
      recordCrossOriginIframes: false,
    }) ?? null;

  setTimeout(() => flushReplayBuffer(), 200);
}

function stopRecording() {
  if (stopFn) {
    stopFn();
    stopFn = null;
  }
  if (rebaseTimer) {
    clearTimeout(rebaseTimer);
    rebaseTimer = null;
  }
  // The next recording starts with its own full
  // snapshot, so a pending re-base is moot.
  needsRebase = false;
  flushMutationBatch();
  flushReplayBuffer();
}

// --- Idle pause ---

function resetIdleTimers() {
  const config = getConfig();
  const pauseMs =
    config.replayIdlePauseMs ??
    DEFAULT_IDLE_PAUSE_MS;
  const expireMs =
    config.replayIdleExpireMs ??
    DEFAULT_IDLE_EXPIRE_MS;

  if (idleTimer) clearTimeout(idleTimer);
  if (expireTimer) {
    clearTimeout(expireTimer);
    expireTimer = null;
  }

  idleTimer = setTimeout(() => {
    idlePaused = true;
    stopRecording();
  }, pauseMs);

  expireTimer = setTimeout(() => {
    idleExpired = true;
    stopRecording();
  }, expireMs);
}

function armIdleTimers() {
  lastIdleArmMs = nowMs();
  resetIdleTimers();
}

function onUserInteraction() {
  if (idleExpired) {
    // Expiry ends a replay; it must not end recording for
    // the life of the page. A tab left open overnight
    // expires while nobody is looking, and everything the
    // user does when they come back is the session that
    // actually matters. By now the session id has usually
    // rotated, so this opens a new replay rather than
    // resuming the abandoned one.
    //
    // Sampling is re-checked because the rotated session
    // rolls its own dice: resuming regardless would
    // record a session the server expects to never see.
    if (!isReplaySampled()) return;
    idleExpired = false;
    idlePaused = false;
    void startRecording();
    armIdleTimers();
    return;
  }

  if (idlePaused) {
    idlePaused = false;
    void startRecording();
    armIdleTimers();
    return;
  }

  // Steady state. mousemove fires continuously, and
  // re-arming means four timer operations, so the common
  // case is throttled: the timers only need to be roughly
  // right against a multi-minute threshold.
  if (
    nowMs() - lastIdleArmMs >=
    IDLE_ARM_THROTTLE_MS
  ) {
    armIdleTimers();
  }
}

function setupInteractionListeners() {
  const events = [
    'click',
    'mousemove',
    'keydown',
    'scroll',
  ];
  const handler = () => onUserInteraction();
  const opts = { passive: true, capture: true };
  for (const ev of events) {
    window.addEventListener(ev, handler, opts);
  }
  interactionTeardown = () => {
    for (const ev of events) {
      window.removeEventListener(
        ev,
        handler,
        opts,
      );
    }
  };
}

function teardownInteractionListeners() {
  if (interactionTeardown) {
    interactionTeardown();
    interactionTeardown = null;
  }
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  if (expireTimer) {
    clearTimeout(expireTimer);
    expireTimer = null;
  }
}

// --- Visibility ---

/**
 * Flushes what is buffered when the tab goes away, but
 * leaves rrweb running.
 *
 * Stopping here used to look free and was not: every
 * `record()` begins with a full snapshot, so returning to
 * the tab re-serialized the entire DOM. On a large page
 * that is the single most expensive thing the recorder
 * does, and tab switching is the most frequent thing a
 * user does, so it was being paid over and over. rrweb
 * also never removes a stopped recorder's mutation buffer
 * from its module-level list, so each stop/start cycle
 * leaked one and every later snapshot iterated it.
 *
 * A hidden tab whose DOM does change should be recorded
 * anyway, and a hidden tab whose DOM does not change
 * costs an idle MutationObserver, which browsers already
 * throttle.
 */
function setupVisibilityPause() {
  if (typeof document === 'undefined') return;
  const handler = () => {
    if (document.visibilityState === 'hidden') {
      flushMutationBatch();
      flushReplayBuffer();
    }
  };
  document.addEventListener(
    'visibilitychange',
    handler,
  );
  visibilityTeardown = () => {
    document.removeEventListener(
      'visibilitychange',
      handler,
    );
  };
}

// --- Public API ---

export async function initReplay() {
  const config = getConfig();
  const privacyLevel =
    config.privacyLevel ?? 'mask-user-input';

  let maskInputOptions: Record<
    string,
    boolean
  > = {};
  let maskTextContent = false;
  let maskAllInputs = true;

  if (privacyLevel === 'mask') {
    maskTextContent = true;
    maskInputOptions = {
      password: true,
      email: true,
      text: true,
      tel: true,
      url: true,
      search: true,
      number: true,
    };
  } else if (
    privacyLevel === 'mask-user-input'
  ) {
    maskInputOptions = {
      password: true,
      email: true,
    };
  } else {
    maskAllInputs = false;
  }

  replayConfig = {
    privacyLevel,
    maskAllInputs,
    maskInputOptions,
    maskTextContent,
  };

  // A segment the transport gives up on leaves the
  // remaining stream referencing DOM nodes the player
  // never received, so re-base when that happens.
  setReplayDropHandler(() => {
    if (stopFn) requestRebase();
  });

  await startRecording();
  setupInteractionListeners();
  setupVisibilityPause();
  armIdleTimers();
}

export function isReplayActive(): boolean {
  return stopFn !== null && !recordingDisabled;
}

export function hasReplayFlushed(): boolean {
  return replayHasFlushed;
}

export function stopReplay() {
  stopRecording();
  teardownInteractionListeners();
  if (visibilityTeardown) {
    visibilityTeardown();
    visibilityTeardown = null;
  }
  if (overloadTimer) {
    clearTimeout(overloadTimer);
    overloadTimer = null;
  }
  idlePaused = false;
  idleExpired = false;
  lastIdleArmMs = 0;
  recordingDisabled = false;
  replayHasFlushed = false;
  rebaseStreak = 0;
  mutationCount = 0;
  lastSnapshotMs = 0;
  pendingMutations = [];
  pendingCursor = 0;
  mutationThrottler.reset();
  replayConfig = null;
  recordApi = null;
  // bufferSessionId and its segment index deliberately
  // survive. A successful flush already cleared them;
  // if one did not happen because the server is rate
  // limiting, the buffered events keep the index they
  // were allocated, so the server sees no gap.
}
