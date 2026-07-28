import type { eventWithTime } from '@rrweb/types';
import { getConfig } from '../core/config';
import {
  getSessionId,
  nextReplaySegmentIndex,
} from '../core/session';
import { estimateJsonBytes } from '../core/size';
import { incrTelemetry } from '../core/telemetry';
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
 * which is not worth it for a degraded-state guard.
 */
const MAX_PENDING_BYTES = 8_000_000;

const FULL_SNAPSHOT = 2;
const INCREMENTAL_SNAPSHOT = 3;

const MUTATIONS_PER_WINDOW = 750;
const WINDOW_MS = 5000;
const CIRCUIT_BREAK_THRESHOLD = 3;
const OVERLOAD_COOLDOWN_MS = 30_000;
const MIN_REBASE_INTERVAL_MS = 5000;
const MUTATION_BATCH_DELAY = 16;
const MUTATION_BATCH_TIMEOUT = 100;

const DEFAULT_IDLE_PAUSE_MS = 300_000;
const DEFAULT_IDLE_EXPIRE_MS = 900_000;

type RecordApi = typeof import('rrweb')['record'];

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
let mutationBatchTimer: ReturnType<
  typeof setTimeout
> | null = null;
let mutationIdleCancel:
  | (() => void)
  | null = null;

let idleTimer: ReturnType<
  typeof setTimeout
> | null = null;
let expireTimer: ReturnType<
  typeof setTimeout
> | null = null;
let idlePaused = false;
let visibilityPaused = false;
let idleExpired = false;
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

function flushMutationBatch() {
  if (mutationBatchTimer) {
    clearTimeout(mutationBatchTimer);
    mutationBatchTimer = null;
  }
  if (mutationIdleCancel) {
    mutationIdleCancel();
    mutationIdleCancel = null;
  }
  const batch = pendingMutations.splice(0);
  for (const event of batch) {
    addToBuffer(event);
  }
}

function scheduleMutationFlush() {
  if (mutationBatchTimer) return;
  if (
    typeof requestIdleCallback !== 'undefined'
  ) {
    const id = requestIdleCallback(
      () => {
        mutationIdleCancel = null;
        flushMutationBatch();
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
    flushMutationBatch();
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
  if (rebaseStreak > CIRCUIT_BREAK_THRESHOLD) {
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
    recordApi.takeFullSnapshot(true);
    incrTelemetry('replay_rebases');
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
  bufferBytes = 0;
  bufferSessionId = '';
  replayHasFlushed = true;

  enqueue(REPLAY_BATCH_KEY, {
    session_id: sessionId,
    segment_index: index,
    events: batch,
  } as any);
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
      !visibilityPaused &&
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

  mutationCount++;
  if (mutationCount > MUTATIONS_PER_WINDOW) {
    dropEvent();
    requestRebase();
    return;
  }

  pendingMutations.push(event);
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

  stopFn =
    record({
      sampling: {
        mousemove: 50,
        mouseInteraction: true,
        scroll: 100,
        input: 'last',
      },
      slimDOMOptions: 'all',
      checkoutEveryNms: 300_000,
      emit(event: eventWithTime) {
        handleEvent(event);
      },
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
    teardownInteractionListeners();
  }, expireMs);
}

function onUserInteraction() {
  if (idleExpired) return;
  if (idlePaused) {
    idlePaused = false;
    if (!visibilityPaused) {
      void startRecording();
    }
  }
  resetIdleTimers();
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

// --- Visibility pause ---

function setupVisibilityPause() {
  if (typeof document === 'undefined') return;
  const handler = () => {
    if (document.visibilityState === 'hidden') {
      if (!visibilityPaused && stopFn) {
        visibilityPaused = true;
        stopRecording();
      }
    } else if (visibilityPaused) {
      visibilityPaused = false;
      if (!idlePaused && !idleExpired) {
        void startRecording();
      }
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
  resetIdleTimers();
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
  visibilityPaused = false;
  idleExpired = false;
  recordingDisabled = false;
  replayHasFlushed = false;
  rebaseStreak = 0;
  mutationCount = 0;
  replayConfig = null;
  recordApi = null;
  // bufferSessionId and its segment index deliberately
  // survive. A successful flush already cleared them;
  // if one did not happen because the server is rate
  // limiting, the buffered events keep the index they
  // were allocated, so the server sees no gap.
}
