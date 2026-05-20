import type { eventWithTime } from '@rrweb/types';
import { getConfig } from '../core/config';
import { getSessionId } from '../core/session';
import {
  enqueue,
  isServerRateLimited,
} from '../core/transport';

const REPLAY_BATCH_KEY = 'replay';
const MAX_BUFFER_SIZE = 200;
const SEGMENT_BYTES_LIMIT = 60_000;
const INCREMENTAL_SNAPSHOT = 3;

const MUTATIONS_PER_WINDOW = 750;
const WINDOW_MS = 5000;
const CIRCUIT_BREAK_THRESHOLD = 3;
const MUTATION_BATCH_DELAY = 16;
const MUTATION_BATCH_TIMEOUT = 100;

const DEFAULT_IDLE_PAUSE_MS = 300_000;
const DEFAULT_IDLE_EXPIRE_MS = 900_000;

let stopFn: (() => void) | null = null;
let buffer: eventWithTime[] = [];
let bufferBytesEstimate = 0;
let mutationCount = 0;
let windowStart = Date.now();
let consecutiveOverflows = 0;
let recordingDisabled = false;

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

function estimateEventBytes(
  event: eventWithTime,
): number {
  let size = 50;
  const d = event.data;
  if (d && typeof d === 'object') {
    for (const key in d) {
      if (
        !Object.prototype.hasOwnProperty.call(
          d,
          key,
        )
      )
        continue;
      size += key.length + 4;
      const val = (d as any)[key];
      if (typeof val === 'string') {
        size += val.length;
      } else {
        size += 20;
      }
    }
  }
  return size;
}

function flushReplayBuffer() {
  if (buffer.length === 0) return;
  if (isServerRateLimited('replay')) return;
  const batch = buffer.splice(0);
  bufferBytesEstimate = 0;
  const payload = {
    session_id: getSessionId(),
    events: batch,
  };
  enqueue(
    REPLAY_BATCH_KEY,
    payload as any,
  );
}

let replayFlushTimer: ReturnType<
  typeof setTimeout
> | null = null;

function scheduleFlush() {
  if (replayFlushTimer) {
    clearTimeout(replayFlushTimer);
  }
  const interval =
    getConfig().replayFlushIntervalMs ??
    5000;
  replayFlushTimer = setTimeout(() => {
    replayFlushTimer = null;
    flushReplayBuffer();
  }, interval);
}

function addToBuffer(event: eventWithTime) {
  buffer.push(event);
  const eventSize = estimateEventBytes(event);
  bufferBytesEstimate +=
    Math.round(eventSize * 0.3);

  if (
    buffer.length >= MAX_BUFFER_SIZE ||
    bufferBytesEstimate >= SEGMENT_BYTES_LIMIT
  ) {
    flushReplayBuffer();
  } else {
    scheduleFlush();
  }
}

async function startRecording() {
  if (!replayConfig) return;
  const config = getConfig();

  const BLOCK_SELECTOR =
    '[data-oodle-privacy="hidden"],' +
    '.oodle-privacy-hidden';
  const MASK_TEXT_SELECTOR =
    '[data-oodle-privacy="mask"],' +
    '.oodle-privacy-mask';

  const { record } = await import('rrweb');

  stopFn =
    record({
      sampling: {
        mousemove: 50,
        mouseInteraction: true,
        scroll: 100,
        input: 'last',
      },
      slimDOMOptions: 'all',
      checkoutEveryNms: 900_000,
      emit(event: eventWithTime) {
        if (recordingDisabled) return;

        if (
          event.type === INCREMENTAL_SNAPSHOT
        ) {
          const now = Date.now();
          if (now - windowStart > WINDOW_MS) {
            if (
              mutationCount >
              MUTATIONS_PER_WINDOW
            ) {
              consecutiveOverflows++;
            } else {
              consecutiveOverflows = 0;
            }
            mutationCount = 0;
            windowStart = now;

            if (
              consecutiveOverflows >=
              CIRCUIT_BREAK_THRESHOLD
            ) {
              recordingDisabled = true;
              if (stopFn) {
                stopFn();
                stopFn = null;
              }
              return;
            }
          }

          mutationCount++;
          if (
            mutationCount > MUTATIONS_PER_WINDOW
          ) {
            return;
          }

          pendingMutations.push(event);
          scheduleMutationFlush();
          return;
        }

        addToBuffer(event);
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
    startRecording();
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
        startRecording();
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

  await startRecording();
  setupInteractionListeners();
  setupVisibilityPause();
  resetIdleTimers();
}

export function isReplayActive(): boolean {
  return stopFn !== null && !recordingDisabled;
}

export function stopReplay() {
  stopRecording();
  teardownInteractionListeners();
  if (visibilityTeardown) {
    visibilityTeardown();
    visibilityTeardown = null;
  }
  idlePaused = false;
  visibilityPaused = false;
  idleExpired = false;
  recordingDisabled = false;
  consecutiveOverflows = 0;
  mutationCount = 0;
  replayConfig = null;
}
