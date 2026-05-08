import { getConfig } from './config';
import { getTags } from './tags';

const FLUSH_INTERVAL_MS = 30_000;
const MAX_BATCH_SIZE = 50;
const MAX_BATCH_BYTES = 64_000;
const MAX_MESSAGE_BYTES = 256_000;
const MAX_ONGOING_BYTES = 80_000;
const MAX_ONGOING_REQUESTS = 32;
const MAX_RETRY_QUEUE_BYTES = 20_000_000;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 60_000;

type Payload = Record<string, unknown>;

interface QueueEntry {
  path: string;
  items: Payload[];
  upsertMap: Map<string, number>;
  bytesEstimate: number;
  timer: ReturnType<typeof setTimeout> | null;
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
let retryTimer: ReturnType<typeof setTimeout> | null =
  null;

const queues = new Map<string, QueueEntry>();

function getQueue(path: string): QueueEntry {
  let q = queues.get(path);
  if (!q) {
    q = {
      path,
      items: [],
      upsertMap: new Map(),
      bytesEstimate: 0,
      timer: null,
    };
    queues.set(path, q);
  }
  return q;
}

async function compress(
  data: string,
): Promise<{ body: BodyInit; encoding: string }> {
  if (
    typeof CompressionStream === 'undefined'
  ) {
    return { body: data, encoding: '' };
  }
  try {
    const stream = new Blob([data])
      .stream()
      .pipeThrough(new CompressionStream('gzip'));
    const compressed = await new Response(
      stream,
    ).blob();
    return {
      body: compressed,
      encoding: 'gzip',
    };
  } catch {
    return { body: data, encoding: '' };
  }
}

function estimateBytes(item: Payload): number {
  try {
    return JSON.stringify(item).length;
  } catch {
    return 1000;
  }
}

async function send(
  path: string,
  batch: Payload[],
  isExit = false,
) {
  if (batch.length === 0) return;
  const config = getConfig();
  const url = `${config.endpoint}${path}`;
  const tags = getTags();
  const enriched = batch.map((item) => ({
    ...item,
    tags,
  }));
  const raw = JSON.stringify(enriched);
  const headers: Record<string, string> = {
    'X-OODLE-INSTANCE': config.instanceId,
    'X-API-KEY': config.apiKey,
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

  const { body, encoding } = await compress(raw);
  headers['Content-Type'] = encoding
    ? 'application/json'
    : 'application/json';
  if (encoding) {
    headers['Content-Encoding'] = encoding;
  }

  const byteLen = raw.length;
  ongoingBytes += byteLen;
  ongoingRequests++;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body,
      keepalive: byteLen < 63000,
    });
    if (resp.status === 429 || resp.status >= 500) {
      enqueueRetry(url, headers, raw);
    }
  } catch {
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
  body: string,
) {
  if (
    typeof navigator !== 'undefined' &&
    navigator.sendBeacon &&
    body.length < MAX_BATCH_BYTES
  ) {
    const blob = new Blob([body], {
      type: 'application/json',
    });
    const beaconUrl = url.includes('?')
      ? `${url}&_dd.api=beacon`
      : `${url}?_dd.api=beacon`;
    if (navigator.sendBeacon(beaconUrl, blob)) {
      return;
    }
  }
  fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body,
    keepalive: body.length < 63000,
  }).catch(() => {});
}

function enqueueRetry(
  url: string,
  headers: Record<string, string>,
  body: string,
) {
  const bytes = body.length;
  if (retryQueueBytes + bytes > MAX_RETRY_QUEUE_BYTES) {
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
  if (retryTimer || retryQueue.length === 0) return;
  const item = retryQueue[0];
  const backoff = Math.min(
    INITIAL_BACKOFF_MS * Math.pow(2, item.attempts),
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

    if (item.attempts > 5) continue;

    const byteLen = item.bytes;
    ongoingBytes += byteLen;
    ongoingRequests++;

    try {
      const { body, encoding } = await compress(
        item.body,
      );
      const hdrs = { ...item.headers };
      hdrs['Content-Type'] = 'application/json';
      if (encoding) {
        hdrs['Content-Encoding'] = encoding;
      }
      const resp = await fetch(item.url, {
        method: 'POST',
        headers: hdrs,
        body,
        keepalive: byteLen < 63000,
      });
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

function flush(path: string, isExit = false) {
  const q = getQueue(path);
  if (q.items.length === 0) return;
  const batch = q.items.splice(0);
  q.upsertMap.clear();
  q.bytesEstimate = 0;
  if (q.timer) {
    clearTimeout(q.timer);
    q.timer = null;
  }
  send(path, batch, isExit);
}

export function enqueue(
  path: string,
  item: Payload,
) {
  const bytes = estimateBytes(item);
  if (bytes > MAX_MESSAGE_BYTES) {
    console.warn(
      '[@oodle-ai/rum] Dropping oversized event' +
        ` (${bytes} bytes)`,
    );
    return;
  }

  const q = getQueue(path);
  q.items.push(item);
  q.bytesEstimate += bytes;

  if (
    q.items.length >= MAX_BATCH_SIZE ||
    q.bytesEstimate >= MAX_BATCH_BYTES
  ) {
    flush(path);
    return;
  }

  if (!q.timer) {
    q.timer = setTimeout(
      () => flush(path),
      FLUSH_INTERVAL_MS,
    );
  }
}

export function upsert(
  path: string,
  key: string,
  item: Payload,
) {
  const bytes = estimateBytes(item);
  if (bytes > MAX_MESSAGE_BYTES) return;

  const q = getQueue(path);
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
    flush(path);
    return;
  }

  if (!q.timer) {
    q.timer = setTimeout(
      () => flush(path),
      FLUSH_INTERVAL_MS,
    );
  }
}

export function flushAll(isExit = false) {
  for (const [path] of queues) {
    flush(path, isExit);
  }
}

let visChangeHandler: (() => void) | null = null;
let unloadHandler: (() => void) | null = null;

export function initTransportListeners() {
  if (typeof document === 'undefined') return;
  visChangeHandler = () => {
    if (document.visibilityState === 'hidden') {
      flushAll(true);
    }
  };
  unloadHandler = () => flushAll(true);
  document.addEventListener(
    'visibilitychange',
    visChangeHandler,
  );
  window.addEventListener(
    'beforeunload',
    unloadHandler,
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
  if (unloadHandler) {
    window.removeEventListener(
      'beforeunload',
      unloadHandler,
    );
    unloadHandler = null;
  }
}

initTransportListeners();
