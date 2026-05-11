import { getConfig } from './config';
import { getTags } from './tags';
import { incrTelemetry } from './telemetry';
import { compressSyncString } from './worker';

const DEFAULT_FLUSH_INTERVAL_MS = 5_000;
const MAX_BATCH_SIZE = 50;
const MAX_BATCH_BYTES = 64_000;
const MAX_MESSAGE_BYTES = 256_000;
const MAX_ONGOING_BYTES = 80_000;
const MAX_ONGOING_REQUESTS = 32;
const MAX_RETRY_QUEUE_BYTES = 20_000_000;
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 60_000;
const DEBOUNCE_EXTRA_MS = 500;

type Payload = Record<string, unknown>;

interface QueueEntry {
  batchKey: string;
  items: Payload[];
  upsertMap: Map<string, number>;
  bytesEstimate: number;
  debounceTimer: ReturnType<
    typeof setTimeout
  > | null;
  maxWaitTimer: ReturnType<
    typeof setTimeout
  > | null;
}

let ongoingBytes = 0;
let ongoingRequests = 0;

interface RetryItem {
  url: string;
  headers: Record<string, string>;
  body: string;
  bytes: number;
  attempts: number;
}

let retryQueue: RetryItem[] = [];
let retryQueueBytes = 0;
let retryTimer: ReturnType<
  typeof setTimeout
> | null = null;

const queues = new Map<string, QueueEntry>();

function getFlushInterval(): number {
  try {
    return (
      getConfig().flushIntervalMs ??
      DEFAULT_FLUSH_INTERVAL_MS
    );
  } catch {
    return DEFAULT_FLUSH_INTERVAL_MS;
  }
}

function getQueue(
  batchKey: string,
): QueueEntry {
  let q = queues.get(batchKey);
  if (!q) {
    q = {
      batchKey,
      items: [],
      upsertMap: new Map(),
      bytesEstimate: 0,
      debounceTimer: null,
      maxWaitTimer: null,
    };
    queues.set(batchKey, q);
  }
  return q;
}

function compressBatchSync(
  raw: string,
): { body: BodyInit; encoding: string } {
  const compressed =
    compressSyncString(raw);
  if (compressed) {
    return {
      body: new Blob([
        compressed as unknown as BlobPart,
      ]),
      encoding: 'gzip',
    };
  }
  incrTelemetry('compression_failures');
  return { body: raw, encoding: '' };
}

function estimateBytes(item: Payload): number {
  let estimate = 2;
  for (const key in item) {
    if (
      !Object.prototype.hasOwnProperty.call(
        item,
        key,
      )
    )
      continue;
    estimate += key.length + 4;
    const val = item[key];
    if (typeof val === 'string') {
      estimate += val.length + 2;
    } else if (typeof val === 'number') {
      estimate += 8;
    } else if (typeof val === 'boolean') {
      estimate += 5;
    } else {
      estimate += 50;
    }
  }
  return estimate;
}

const SHOULD_SEND_QUEUE_MAX = 1000;
const SHOULD_SEND_TTL_MS = 300_000;

interface DeferredBatch {
  path: string;
  batch: Payload[];
  createdAt: number;
}

let shouldSendQueue: DeferredBatch[] = [];

function drainShouldSendQueue() {
  if (shouldSendQueue.length === 0) return;
  const now = Date.now();
  shouldSendQueue = shouldSendQueue.filter(
    (item) =>
      now - item.createdAt <
      SHOULD_SEND_TTL_MS,
  );
  const ready = shouldSendQueue.splice(0);
  for (const item of ready) {
    send(item.path, item.batch);
  }
}

const INGEST_PATH = '/v1/rum/ingest';

function buildEnvelope(
  sections: {
    type: string;
    items: Payload[];
  }[],
): string {
  const sessionId =
    sections[0]?.items[0]?.session_id ?? '';
  const lines: string[] = [];
  lines.push(
    JSON.stringify({
      session_id: sessionId,
    }),
  );
  for (const section of sections) {
    lines.push(
      JSON.stringify({
        type: section.type,
        count: section.items.length,
      }),
    );
    lines.push(JSON.stringify(section.items));
  }
  return lines.join('\n');
}

async function send(
  batchKey: string,
  batch: Payload[],
  isExit = false,
) {
  if (batch.length === 0) return;
  const config = getConfig();

  if (
    !isExit &&
    config.shouldSendData &&
    !config.shouldSendData()
  ) {
    if (
      shouldSendQueue.length <
      SHOULD_SEND_QUEUE_MAX
    ) {
      shouldSendQueue.push({
        path: batchKey,
        batch,
        createdAt: Date.now(),
      });
    } else {
      incrTelemetry(
        'events_should_send_dropped',
        batch.length,
      );
    }
    setTimeout(drainShouldSendQueue, 5000);
    return;
  }

  const url =
    `${config.endpoint}${INGEST_PATH}`;
  const tags = getTags();
  const enriched = batch.map((item) => ({
    ...item,
    tags,
  }));
  const raw = buildEnvelope([
    { type: batchKey, items: enriched },
  ]);
  const headers: Record<string, string> = {
    'X-OODLE-INSTANCE': config.instanceId,
    'X-API-KEY': config.apiKey,
    'Content-Type': 'application/json',
  };

  if (isExit) {
    sendOnExit(url, headers, raw);
    return;
  }

  if (
    ongoingBytes >= MAX_ONGOING_BYTES ||
    ongoingRequests >= MAX_ONGOING_REQUESTS
  ) {
    enqueueRetry(url, headers, raw);
    return;
  }

  const byteLen = raw.length;
  ongoingBytes += byteLen;
  ongoingRequests++;

  try {
    const { body, encoding } =
      compressBatchSync(raw);
    if (encoding) {
      headers['Content-Encoding'] = encoding;
    }
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body,
      keepalive: byteLen < 63000,
    });
    parseRateLimitHeaders(resp);
    if (
      resp.status === 429 ||
      resp.status >= 500
    ) {
      enqueueRetry(url, headers, raw);
    }
  } catch {
    incrTelemetry('send_failures');
    enqueueRetry(url, headers, raw);
  } finally {
    ongoingBytes -= byteLen;
    ongoingRequests--;
    drainRetryQueue();
  }
}

function sendOnExit(
  url: string,
  headers: Record<string, string>,
  raw: string,
) {
  const config = getConfig();
  if (
    typeof navigator !== 'undefined' &&
    navigator.sendBeacon
  ) {
    const beaconUrl =
      url +
      `?api_key=${encodeURIComponent(
        config.apiKey,
      )}`;
    const blob = new Blob([raw], {
      type: 'application/json',
    });
    if (
      blob.size < MAX_BATCH_BYTES &&
      navigator.sendBeacon(beaconUrl, blob)
    ) {
      return;
    }
  }
  const { body, encoding } =
    compressBatchSync(raw);
  const hdrs = { ...headers };
  if (encoding) {
    hdrs['Content-Encoding'] = encoding;
  }
  fetch(url, {
    method: 'POST',
    headers: hdrs,
    body,
    keepalive: true,
  }).catch(() => {});
}

function enqueueRetry(
  url: string,
  headers: Record<string, string>,
  body: string,
) {
  const bytes = body.length;
  if (
    retryQueueBytes + bytes >
    MAX_RETRY_QUEUE_BYTES
  ) {
    incrTelemetry('retry_drops');
    return;
  }
  retryQueue.push({
    url,
    headers,
    body,
    bytes,
    attempts: 0,
  });
  retryQueueBytes += bytes;
  scheduleRetry();
}

function scheduleRetry() {
  if (retryTimer || retryQueue.length === 0) {
    return;
  }
  const item = retryQueue[0];
  const backoff = Math.min(
    INITIAL_BACKOFF_MS *
      Math.pow(2, item.attempts),
    MAX_BACKOFF_MS,
  );
  retryTimer = setTimeout(() => {
    retryTimer = null;
    drainRetryQueue();
  }, backoff);
}

async function drainRetryQueue() {
  while (
    retryQueue.length > 0 &&
    ongoingBytes < MAX_ONGOING_BYTES &&
    ongoingRequests < MAX_ONGOING_REQUESTS
  ) {
    const item = retryQueue.shift()!;
    retryQueueBytes -= item.bytes;
    item.attempts++;

    if (item.attempts > MAX_RETRY_ATTEMPTS) {
      incrTelemetry('retry_drops');
      continue;
    }

    const byteLen = item.bytes;
    ongoingBytes += byteLen;
    ongoingRequests++;

    try {
      const { body, encoding } =
        compressBatchSync(item.body);
      const hdrs = { ...item.headers };
      hdrs['Content-Type'] =
        'application/json';
      if (encoding) {
        hdrs['Content-Encoding'] = encoding;
      }
      const resp = await fetch(item.url, {
        method: 'POST',
        headers: hdrs,
        body,
        keepalive: byteLen < 63000,
      });
      parseRateLimitHeaders(resp);
      if (
        resp.status === 429 ||
        resp.status >= 500
      ) {
        retryQueue.push(item);
        retryQueueBytes += item.bytes;
        break;
      }
    } catch {
      retryQueue.push(item);
      retryQueueBytes += item.bytes;
      break;
    } finally {
      ongoingBytes -= byteLen;
      ongoingRequests--;
    }
  }
  if (retryQueue.length > 0) {
    scheduleRetry();
  }
}

function clearQueueTimers(q: QueueEntry) {
  if (q.debounceTimer) {
    clearTimeout(q.debounceTimer);
    q.debounceTimer = null;
  }
  if (q.maxWaitTimer) {
    clearTimeout(q.maxWaitTimer);
    q.maxWaitTimer = null;
  }
}

function flush(
  batchKey: string,
  isExit = false,
) {
  const q = queues.get(batchKey);
  if (!q || q.items.length === 0) return;
  const batch = q.items.splice(0);
  q.upsertMap.clear();
  q.bytesEstimate = 0;
  clearQueueTimers(q);
  send(q.batchKey, batch, isExit);
}

function scheduleDebounce(q: QueueEntry) {
  const interval = getFlushInterval();
  if (q.debounceTimer) {
    clearTimeout(q.debounceTimer);
  }
  q.debounceTimer = setTimeout(
    () => flush(q.batchKey),
    interval,
  );
  if (!q.maxWaitTimer) {
    q.maxWaitTimer = setTimeout(
      () => {
        q.maxWaitTimer = null;
        flush(q.batchKey);
      },
      interval + DEBOUNCE_EXTRA_MS,
    );
  }
}

export function enqueue(
  batchKey: string,
  item: Payload,
) {
  const bytes = estimateBytes(item);
  if (bytes > MAX_MESSAGE_BYTES) {
    console.warn(
      '[@oodle-ai/rum] Dropping oversized' +
        ` event (${bytes} bytes)`,
    );
    return;
  }

  const q = getQueue(batchKey);
  q.items.push(item);
  q.bytesEstimate += bytes;

  if (
    q.items.length >= MAX_BATCH_SIZE ||
    q.bytesEstimate >= MAX_BATCH_BYTES
  ) {
    flush(q.batchKey);
    return;
  }

  scheduleDebounce(q);
}

export function upsert(
  batchKey: string,
  key: string,
  item: Payload,
) {
  const bytes = estimateBytes(item);
  if (bytes > MAX_MESSAGE_BYTES) return;

  const q = getQueue(batchKey);
  const existingIdx = q.upsertMap.get(key);

  if (existingIdx !== undefined) {
    const oldBytes = estimateBytes(
      q.items[existingIdx],
    );
    q.items[existingIdx] = item;
    q.bytesEstimate += bytes - oldBytes;
  } else {
    const idx = q.items.length;
    q.items.push(item);
    q.upsertMap.set(key, idx);
    q.bytesEstimate += bytes;
  }

  if (
    q.items.length >= MAX_BATCH_SIZE ||
    q.bytesEstimate >= MAX_BATCH_BYTES
  ) {
    flush(q.batchKey);
    return;
  }

  scheduleDebounce(q);
}

const FLUSH_PRIORITY = ['events', 'replay'];

export function flushAll(isExit = false) {
  const config = getConfig();

  if (
    !isExit &&
    config.shouldSendData &&
    !config.shouldSendData()
  ) {
    return;
  }

  const tags = getTags();
  const sections: {
    type: string;
    items: Payload[];
  }[] = [];

  const sorted = Array.from(
    queues.keys(),
  ).sort((a, b) => {
    const ai = FLUSH_PRIORITY.indexOf(a);
    const bi = FLUSH_PRIORITY.indexOf(b);
    const ap = ai >= 0 ? ai : 999;
    const bp = bi >= 0 ? bi : 999;
    return ap - bp;
  });

  for (const key of sorted) {
    const q = queues.get(key);
    if (!q || q.items.length === 0) continue;
    const batch = q.items.splice(0);
    q.upsertMap.clear();
    q.bytesEstimate = 0;
    clearQueueTimers(q);
    const enriched = batch.map((item) => ({
      ...item,
      tags,
    }));
    sections.push({
      type: q.batchKey,
      items: enriched,
    });
  }

  if (sections.length === 0) return;

  const raw = buildEnvelope(sections);
  const url =
    `${config.endpoint}${INGEST_PATH}`;
  const headers: Record<string, string> = {
    'X-OODLE-INSTANCE': config.instanceId,
    'X-API-KEY': config.apiKey,
    'Content-Type': 'application/json',
  };

  if (isExit) {
    sendOnExit(url, headers, raw);
    return;
  }

  sendRaw(url, headers, raw);
}

async function sendRaw(
  url: string,
  headers: Record<string, string>,
  raw: string,
) {
  const byteLen = raw.length;

  if (
    ongoingBytes >= MAX_ONGOING_BYTES ||
    ongoingRequests >= MAX_ONGOING_REQUESTS
  ) {
    enqueueRetry(url, headers, raw);
    return;
  }

  ongoingBytes += byteLen;
  ongoingRequests++;

  try {
    const { body, encoding } =
      compressBatchSync(raw);
    if (encoding) {
      headers['Content-Encoding'] = encoding;
    }
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body,
      keepalive: byteLen < 63000,
    });
    parseRateLimitHeaders(resp);
    if (
      resp.status === 429 ||
      resp.status >= 500
    ) {
      enqueueRetry(url, headers, raw);
    }
  } catch {
    incrTelemetry('send_failures');
    enqueueRetry(url, headers, raw);
  } finally {
    ongoingBytes -= byteLen;
    ongoingRequests--;
    drainRetryQueue();
  }
}

// --- Server-driven rate limits ---

const rateLimitBackoffs = new Map<
  string,
  number
>();

function parseRateLimitHeaders(
  resp: Response,
) {
  const header = resp.headers.get(
    'X-Oodle-Rate-Limits',
  );
  if (!header) return;
  const now = Date.now();
  for (const part of header.split(',')) {
    const [cat, secs] = part
      .trim()
      .split(':');
    if (cat && secs) {
      rateLimitBackoffs.set(
        cat,
        now + parseInt(secs, 10) * 1000,
      );
    }
  }
}

export function isServerRateLimited(
  category: string,
): boolean {
  const until = rateLimitBackoffs.get(category);
  if (!until) return false;
  if (Date.now() >= until) {
    rateLimitBackoffs.delete(category);
    return false;
  }
  return true;
}

// --- Transport lifecycle ---

let visChangeHandler:
  | (() => void)
  | null = null;
let exitHandler: (() => void) | null = null;
let pageShowHandler:
  | ((e: PageTransitionEvent) => void)
  | null = null;
let _reinitCallback:
  | (() => void)
  | null = null;

export function setReinitCallback(
  cb: () => void,
) {
  _reinitCallback = cb;
}

const exitEvent: string =
  typeof self !== 'undefined' &&
  'onpagehide' in self
    ? 'pagehide'
    : 'beforeunload';

export function initTransportListeners() {
  if (typeof document === 'undefined') return;
  visChangeHandler = () => {
    if (
      document.visibilityState === 'hidden'
    ) {
      flushAll(true);
    }
  };
  exitHandler = () => flushAll(true);
  pageShowHandler = (
    e: PageTransitionEvent,
  ) => {
    if (e.persisted && _reinitCallback) {
      _reinitCallback();
    }
  };
  document.addEventListener(
    'visibilitychange',
    visChangeHandler,
  );
  window.addEventListener(
    exitEvent,
    exitHandler,
  );
  window.addEventListener(
    'pageshow',
    pageShowHandler,
  );
}

export function destroyTransportListeners() {
  if (visChangeHandler) {
    document.removeEventListener(
      'visibilitychange',
      visChangeHandler,
    );
    visChangeHandler = null;
  }
  if (exitHandler) {
    window.removeEventListener(
      exitEvent,
      exitHandler,
    );
    exitHandler = null;
  }
  if (pageShowHandler) {
    window.removeEventListener(
      'pageshow',
      pageShowHandler as EventListener,
    );
    pageShowHandler = null;
  }
}
