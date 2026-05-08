import type { eventWithTime } from '@rrweb/types';
import { getConfig } from '../core/config';
import { getSessionId } from '../core/session';

const FLUSH_INTERVAL_MS = 5000;
const MAX_BUFFER_SIZE = 200;
const SEGMENT_BYTES_LIMIT = 60_000;
const INCREMENTAL_SNAPSHOT = 3;

const MUTATIONS_PER_WINDOW = 750;
const WINDOW_MS = 5000;
const CIRCUIT_BREAK_THRESHOLD = 3;
const MUTATION_BATCH_DELAY = 16;
const MUTATION_BATCH_TIMEOUT = 100;

let stopFn: (() => void) | null = null;
let buffer: eventWithTime[] = [];
let timer: ReturnType<typeof setTimeout> | null =
  null;
let mutationCount = 0;
let windowStart = Date.now();
let consecutiveOverflows = 0;
let recordingDisabled = false;
let compressedBytesEstimate = 0;

let visHandler: (() => void) | null = null;
let unloadHandler: (() => void) | null = null;

let pendingMutations: eventWithTime[] = [];
let mutationBatchTimer: ReturnType<
  typeof setTimeout
> | null = null;
let mutationIdleCancel: (() => void) | null = null;

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

async function compress(
  data: string,
): Promise<{
  body: BodyInit;
  encoding: string;
  compressedSize: number;
}> {
  if (
    typeof CompressionStream === 'undefined'
  ) {
    return {
      body: data,
      encoding: '',
      compressedSize: data.length,
    };
  }
  try {
    const stream = new Blob([data])
      .stream()
      .pipeThrough(new CompressionStream('gzip'));
    const blob = await new Response(
      stream,
    ).blob();
    return {
      body: blob,
      encoding: 'gzip',
      compressedSize: blob.size,
    };
  } catch {
    return {
      body: data,
      encoding: '',
      compressedSize: data.length,
    };
  }
}

async function flush(isExit = false) {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0);
  compressedBytesEstimate = 0;
  const config = getConfig();
  const url =
    `${config.endpoint}/v1/rum/replay`;
  const raw = JSON.stringify({
    session_id: getSessionId(),
    events: batch,
  });

  const headers: Record<string, string> = {
    'X-OODLE-INSTANCE': config.instanceId,
    'X-API-KEY': config.apiKey,
  };

  if (isExit) {
    headers['Content-Type'] =
      'application/json';
    if (
      typeof navigator !== 'undefined' &&
      navigator.sendBeacon &&
      raw.length < 64000
    ) {
      const blob = new Blob([raw], {
        type: 'application/json',
      });
      if (navigator.sendBeacon(url, blob)) {
        return;
      }
    }
    fetch(url, {
      method: 'POST',
      headers,
      body: raw,
      keepalive: raw.length < 63000,
    }).catch(() => {});
    return;
  }

  const { body, encoding } =
    await compress(raw);
  headers['Content-Type'] =
    'application/json';
  if (encoding) {
    headers['Content-Encoding'] = encoding;
  }

  fetch(url, {
    method: 'POST',
    headers,
    body,
    keepalive: raw.length < 63000,
  }).catch(() => {});
}

function scheduleFlush() {
  if (!timer) {
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, FLUSH_INTERVAL_MS);
  }
}

function addToBuffer(event: eventWithTime) {
  buffer.push(event);
  const eventSize = JSON.stringify(event).length;
  compressedBytesEstimate +=
    Math.round(eventSize * 0.3);

  if (
    buffer.length >= MAX_BUFFER_SIZE ||
    compressedBytesEstimate >= SEGMENT_BYTES_LIMIT
  ) {
    flush();
  } else {
    scheduleFlush();
  }
}

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

  const BLOCK_SELECTOR =
    '[data-oodle-privacy="hidden"],' +
    '.oodle-privacy-hidden';
  const MASK_TEXT_SELECTOR =
    '[data-oodle-privacy="mask"],' +
    '.oodle-privacy-mask';

  const { record } = await import('rrweb');

  stopFn =
    record({
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
      maskAllInputs,
      maskInputOptions,
      maskTextFn: maskTextContent
        ? () => '•••'
        : undefined,
      blockSelector: BLOCK_SELECTOR,
      maskTextSelector: MASK_TEXT_SELECTOR,
      recordCrossOriginIframes: false,
    }) ?? null;

  setTimeout(() => flush(), 200);

  if (typeof document !== 'undefined') {
    visHandler = () => {
      if (
        document.visibilityState === 'hidden'
      ) {
        flushMutationBatch();
        flush(true);
      }
    };
    unloadHandler = () => {
      flushMutationBatch();
      flush(true);
    };
    document.addEventListener(
      'visibilitychange',
      visHandler,
    );
    window.addEventListener(
      'beforeunload',
      unloadHandler,
    );
  }
}

export function stopReplay() {
  if (stopFn) {
    stopFn();
    stopFn = null;
  }
  flushMutationBatch();
  flush();
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (visHandler) {
    document.removeEventListener(
      'visibilitychange',
      visHandler,
    );
    visHandler = null;
  }
  if (unloadHandler) {
    window.removeEventListener(
      'beforeunload',
      unloadHandler,
    );
    unloadHandler = null;
  }
}
