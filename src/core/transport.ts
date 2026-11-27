import { getConfig } from './config';
import { estimateJsonBytes } from './size';
import { getTags } from './tags';
import { incrTelemetry } from './telemetry';
import {
  compressString,
  compressSyncString,
} from './worker';

declare const __OODLE_RUM_VERSION__: string;
export const SDK_VERSION: string =
  typeof __OODLE_RUM_VERSION__ !== 'undefined'
    ? __OODLE_RUM_VERSION__
    : 'unknown';

const DEFAULT_FLUSH_INTERVAL_MS = 5_000;
const MAX_BATCH_SIZE = 50;
const MAX_BATCH_BYTES = 500_000;
const MAX_MESSAGE_BYTES = 256_000;

const REPLAY_BATCH_KEY = 'replay';
const MAX_ONGOING_BYTES = 80_000;
const MAX_ONGOING_REQUESTS = 32;
const MAX_RETRY_QUEUE_BYTES = 20_000_000;
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 60_000;
const DEBOUNCE_EXTRA_MS = 500;

/**
 * Browsers reject a `keepalive` fetch whose body is
 * over 64KB, and the rejection surfaces as a thrown
 * TypeError, so setting keepalive unconditionally on
 * the exit path turns a large payload into a silent
 * total loss. Held a little under the spec limit
 * because the comparison is against string length,
 * which undercounts multi-byte characters.
 */
const KEEPALIVE_MAX_BYTES = 63_000;

/**
 * The 64KB is one quota per document, shared by every
 * keepalive request and beacon still in flight, not a
 * per-request cap. Tracking what this module has in
 * flight lets a request that would not fit go out as a
 * plain fetch instead of being refused.
 */
let keepaliveBytesInFlight = 0;

function keepaliveRoom(): number {
  return KEEPALIVE_MAX_BYTES - keepaliveBytesInFlight;
}

function bodyBytes(body: BodyInit, raw: string): number {
  return body instanceof Blob ? body.size : raw.length;
}

/**
 * POSTs with keepalive when the body fits the room left
 * in the quota, so a send in progress survives a
 * navigation.
 */
async function post(
  url: string,
  headers: Record<string, string>,
  body: BodyInit,
  bytes: number,
): Promise<Response> {
  const keepalive = bytes < keepaliveRoom();
  if (keepalive) keepaliveBytesInFlight += bytes;
  try {
    return await fetch(url, {
      method: 'POST',
      headers,
      body,
      keepalive,
      credentials: 'omit',
    });
  } finally {
    if (keepalive) keepaliveBytesInFlight -= bytes;
  }
}

type Payload = Record<string, unknown>;

interface QueueEntry {
  batchKey: string;
  items: Payload[];
  upsertMap: Map<string, number>;
  bytesEstimate: number;
}

let ongoingBytes = 0;
let ongoingRequests = 0;

interface RetryItem {
  url: string;
  headers: Record<string, string>;
  body: string;
  bytes: number;
  attempts: number;
  batchKey?: string;
}

let retryQueue: RetryItem[] = [];
let retryQueueBytes = 0;
let retryTimer: ReturnType<
  typeof setTimeout
> | null = null;

const queues = new Map<string, QueueEntry>();

let globalDebounceTimer: ReturnType<
  typeof setTimeout
> | null = null;
let globalMaxWaitTimer: ReturnType<
  typeof setTimeout
> | null = null;

let exitFlushHook: (() => void) | null = null;
const pageExitProducers = new Set<() => void>();

/**
 * Registers work that must run when the page goes away for good
 * (pagehide), before the exit flush. Unlike the exit flush hook, it does
 * not run when the tab is only hidden: work still in progress then may
 * finish later. Returns a function that removes it.
 */
export function onPageExit(fn: () => void): () => void {
  pageExitProducers.add(fn);
  return () => pageExitProducers.delete(fn);
}
let inExitFlush = false;

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
    };
    queues.set(batchKey, q);
  }
  return q;
}

function toBody(
  compressed: Uint8Array | null,
  raw: string,
): { body: BodyInit; encoding: string } {
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

/**
 * Used by every path that has a later tick available.
 * Yields to the event loop while the browser gzips
 * instead of holding the main thread for the payload.
 */
async function compressBatch(
  raw: string,
): Promise<{ body: BodyInit; encoding: string }> {
  return toBody(await compressString(raw), raw);
}

/**
 * Page-exit only: the document is going away, so there
 * is no later tick to resume on and blocking is the
 * only option.
 */
function compressBatchSync(
  raw: string,
): { body: BodyInit; encoding: string } {
  return toBody(compressSyncString(raw), raw);
}

/**
 * Measuring costs time proportional to how far the
 * estimator gets before its limit stops it, so ask for
 * the smallest answer the caller can act on.
 *
 * Replay only needs the batching threshold: a segment
 * is never rejected for being large, because a full
 * snapshot cannot be split and the recorder already
 * bounds segment size. The replay ceiling is kept low
 * so the walk stays cheap on multi-megabyte snapshots.
 */
const REPLAY_MEASURE_LIMIT = 64_000;

function measure(
  batchKey: string,
  item: Payload,
  bytesHint?: number,
): { bytes: number; oversized: boolean } {
  if (batchKey === REPLAY_BATCH_KEY) {
    // The recorder already measured every event on its
    // way into the segment. Walking the same graph a
    // second time here doubled the per-event cost for
    // no new information.
    return {
      bytes:
        bytesHint ??
        estimateJsonBytes(
          item,
          REPLAY_MEASURE_LIMIT,
        ),
      oversized: false,
    };
  }
  const bytes = estimateJsonBytes(
    item,
    MAX_MESSAGE_BYTES + 1,
  );
  return {
    bytes,
    oversized: bytes > MAX_MESSAGE_BYTES,
  };
}

let replayDropHandler: (() => void) | null = null;

/**
 * Lets the replay recorder re-base its stream when the
 * transport has to throw a segment away. rrweb events
 * are deltas, so a dropped segment invalidates every
 * later event until a new full snapshot is taken.
 */
export function setReplayDropHandler(
  cb: () => void,
) {
  replayDropHandler = cb;
}

function onDropped(batchKey: string) {
  incrTelemetry('transport_drops');
  if (
    batchKey === REPLAY_BATCH_KEY &&
    replayDropHandler
  ) {
    replayDropHandler();
  }
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
      sdk_version: SDK_VERSION,
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
  const headers: Record<string, string> = {
    'X-OODLE-INSTANCE': config.instanceId,
    'X-API-KEY': config.apiKey,
    'Content-Type': 'application/json',
  };

  if (isExit) {
    sendSectionsOnExit(url, headers, [
      { type: batchKey, items: enriched },
    ]);
    return;
  }

  const raw = buildEnvelope([
    { type: batchKey, items: enriched },
  ]);

  if (
    ongoingBytes >= MAX_ONGOING_BYTES ||
    ongoingRequests >= MAX_ONGOING_REQUESTS
  ) {
    enqueueRetry(url, headers, raw, batchKey);
    return;
  }

  const byteLen = raw.length;
  ongoingBytes += byteLen;
  ongoingRequests++;

  try {
    const { body, encoding } =
      await compressBatch(raw);
    const hdrs = { ...headers };
    if (encoding) {
      hdrs['Content-Encoding'] = encoding;
    }
    const resp = await post(
      url,
      hdrs,
      body,
      bodyBytes(body, raw),
    );
    parseRateLimitHeaders(resp);
    if (
      resp.status === 429 ||
      resp.status >= 500
    ) {
      enqueueRetry(url, headers, raw, batchKey);
    }
  } catch {
    incrTelemetry('send_failures');
    enqueueRetry(url, headers, raw, batchKey);
  } finally {
    ongoingBytes -= byteLen;
    ongoingRequests--;
    drainRetryQueue();
  }
}

interface Section {
  type: string;
  items: Payload[];
}

/**
 * A page that is going away gets one keepalive quota
 * (see KEEPALIVE_MAX_BYTES), and anything that does not
 * fit goes out as a plain fetch the browser cancels with
 * the page. Sending everything as one envelope meant a
 * large replay segment took the small sections with it:
 * the RUM events and SDK telemetry were lost although
 * they would have fit.
 *
 * So each section is sent on its own, replay last, and a
 * section too big for the room left is split in half by
 * item until the pieces fit. A single item that does not
 * fit still goes as a plain fetch, which completes when
 * the tab was only hidden.
 */
function sendSectionsOnExit(
  url: string,
  headers: Record<string, string>,
  sections: Section[],
) {
  const ordered = [
    ...sections.filter(
      (s) => s.type !== REPLAY_BATCH_KEY,
    ),
    ...sections.filter(
      (s) => s.type === REPLAY_BATCH_KEY,
    ),
  ];
  const budget = { room: keepaliveRoom() };
  for (const section of ordered) {
    sendPieceOnExit(url, headers, section, budget);
  }
}

function sendPieceOnExit(
  url: string,
  headers: Record<string, string>,
  section: Section,
  budget: { room: number },
) {
  const raw = buildEnvelope([section]);

  if (
    raw.length < budget.room &&
    trySendBeacon(url, raw)
  ) {
    budget.room -= raw.length;
    return;
  }

  const { body, encoding } =
    compressBatchSync(raw);
  const hdrs = { ...headers };
  if (encoding) {
    hdrs['Content-Encoding'] = encoding;
  } else {
    delete hdrs['Content-Encoding'];
  }
  const bytes = bodyBytes(body, raw);

  if (bytes < budget.room) {
    budget.room -= bytes;
    keepaliveBytesInFlight += bytes;
    fetch(url, {
      method: 'POST',
      headers: hdrs,
      body,
      keepalive: true,
      credentials: 'omit',
    })
      .catch(() =>
        // Refused because something outside this
        // module's count (an earlier beacon) still
        // holds quota. Still worth a plain try.
        fetch(url, {
          method: 'POST',
          headers: hdrs,
          body,
          credentials: 'omit',
        }),
      )
      .catch(() => {
        incrTelemetry('exit_send_failures');
      })
      .finally(() => {
        keepaliveBytesInFlight -= bytes;
      });
    return;
  }

  if (section.items.length > 1) {
    const mid = Math.ceil(
      section.items.length / 2,
    );
    sendPieceOnExit(
      url,
      headers,
      {
        type: section.type,
        items: section.items.slice(0, mid),
      },
      budget,
    );
    sendPieceOnExit(
      url,
      headers,
      {
        type: section.type,
        items: section.items.slice(mid),
      },
      budget,
    );
    return;
  }

  fetch(url, {
    method: 'POST',
    headers: hdrs,
    body,
    credentials: 'omit',
  }).catch(() => {
    incrTelemetry('exit_send_failures');
  });
}

/**
 * The receiver reads the instance from the API key and
 * only honours Content-Encoding from a real header, so
 * the beacon body stays uncompressed.
 */
function trySendBeacon(
  url: string,
  raw: string,
): boolean {
  if (
    typeof navigator === 'undefined' ||
    !navigator.sendBeacon
  ) {
    return false;
  }
  const beaconUrl =
    url +
    `?api_key=${encodeURIComponent(
      getConfig().apiKey,
    )}`;
  try {
    return navigator.sendBeacon(
      beaconUrl,
      new Blob([raw], {
        type: 'application/json',
      }),
    );
  } catch {
    return false;
  }
}

function enqueueRetry(
  url: string,
  headers: Record<string, string>,
  body: string,
  batchKey?: string,
) {
  const bytes = body.length;
  if (
    retryQueueBytes + bytes >
    MAX_RETRY_QUEUE_BYTES
  ) {
    incrTelemetry('retry_drops');
    if (batchKey) onDropped(batchKey);
    return;
  }
  // `body` is always the uncompressed envelope; the
  // caller may have stamped Content-Encoding on its
  // headers before compressing. Carrying that stale
  // header forward makes the server try to gunzip
  // plain text if the retry fails to compress.
  const clean = { ...headers };
  delete clean['Content-Encoding'];
  retryQueue.push({
    url,
    headers: clean,
    body,
    bytes,
    attempts: 0,
    batchKey,
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
      if (item.batchKey) {
        onDropped(item.batchKey);
      }
      continue;
    }

    const byteLen = item.bytes;
    ongoingBytes += byteLen;
    ongoingRequests++;

    try {
      const { body, encoding } =
        await compressBatch(item.body);
      const hdrs = { ...item.headers };
      hdrs['Content-Type'] =
        'application/json';
      if (encoding) {
        hdrs['Content-Encoding'] = encoding;
      } else {
        delete hdrs['Content-Encoding'];
      }
      const resp = await post(
        item.url,
        hdrs,
        body,
        bodyBytes(body, item.body),
      );
      parseRateLimitHeaders(resp);
      if (
        resp.status === 429 ||
        resp.status >= 500
      ) {
        // Front of the queue: replay segments must
        // reach the server in the order they were
        // recorded.
        retryQueue.unshift(item);
        retryQueueBytes += item.bytes;
        break;
      }
    } catch {
      retryQueue.unshift(item);
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

function clearGlobalTimers() {
  if (globalDebounceTimer) {
    clearTimeout(globalDebounceTimer);
    globalDebounceTimer = null;
  }
  if (globalMaxWaitTimer) {
    clearTimeout(globalMaxWaitTimer);
    globalMaxWaitTimer = null;
  }
}

function scheduleGlobalDebounce() {
  const interval = getFlushInterval();
  if (globalDebounceTimer) {
    clearTimeout(globalDebounceTimer);
  }
  globalDebounceTimer = setTimeout(
    () => flushAll(),
    interval,
  );
  if (!globalMaxWaitTimer) {
    globalMaxWaitTimer = setTimeout(
      () => {
        globalMaxWaitTimer = null;
        flushAll();
      },
      interval + DEBOUNCE_EXTRA_MS,
    );
  }
}

export function enqueue(
  batchKey: string,
  item: Payload,
  bytesHint?: number,
) {
  const { bytes, oversized } = measure(
    batchKey,
    item,
    bytesHint,
  );
  if (oversized) {
    console.warn(
      '[@oodle-ai/rum] Dropping oversized' +
        ` ${batchKey} payload (${bytes} bytes)`,
    );
    onDropped(batchKey);
    return;
  }

  const q = getQueue(batchKey);
  q.items.push(item);
  q.bytesEstimate += bytes;

  // Draining a producer on the exit path can cross the
  // threshold, and a nested flush there would send the
  // batch the ordinary way: no beacon, no keepalive, on
  // a document that is going away. The exit flush this
  // is nested inside sends it properly a moment later.
  if (
    !inExitFlush &&
    (q.items.length >= MAX_BATCH_SIZE ||
      q.bytesEstimate >= MAX_BATCH_BYTES)
  ) {
    flushAll();
    return;
  }

  scheduleGlobalDebounce();
}

/**
 * Queues `item`, replacing a queued item with the same key.
 * `merge` sees the item being replaced and the new one, so a
 * flag only the first of them carries (a view's first update)
 * is not lost when a later one replaces it.
 */
export function upsert(
  batchKey: string,
  key: string,
  item: Payload,
  merge?: (prev: Payload, next: Payload) => Payload,
) {
  const { bytes, oversized } = measure(
    batchKey,
    item,
  );
  if (oversized) {
    onDropped(batchKey);
    return;
  }

  const q = getQueue(batchKey);
  const existingIdx = q.upsertMap.get(key);

  if (existingIdx !== undefined) {
    const oldBytes = measure(
      batchKey,
      q.items[existingIdx],
    ).bytes;
    q.items[existingIdx] = merge
      ? merge(q.items[existingIdx], item)
      : item;
    q.bytesEstimate += bytes - oldBytes;
  } else {
    const idx = q.items.length;
    q.items.push(item);
    q.upsertMap.set(key, idx);
    q.bytesEstimate += bytes;
  }

  if (
    !inExitFlush &&
    (q.items.length >= MAX_BATCH_SIZE ||
      q.bytesEstimate >= MAX_BATCH_BYTES)
  ) {
    flushAll();
    return;
  }

  scheduleGlobalDebounce();
}

/**
 * Registers a producer that keeps its own buffer, so an
 * exit flush can collect from it before building the
 * envelope.
 *
 * A producer cannot do this from its own
 * `visibilitychange` listener. Listeners run in
 * registration order and the transport registers first,
 * so anything handed over from a later listener lands in
 * the queue after the exit flush has already run, and
 * then waits on the debounce while the page goes away.
 * `pagehide` has no second listener at all.
 */
export function setExitFlushHook(
  fn: (() => void) | null,
) {
  exitFlushHook = fn;
}

const FLUSH_PRIORITY = ['events', 'replay'];

export function flushAll(isExit = false) {
  const config = getConfig();

  if (isExit && exitFlushHook && !inExitFlush) {
    inExitFlush = true;
    try {
      exitFlushHook();
    } catch {
      // A producer that throws must not cost us the
      // batches that are already queued.
    } finally {
      inExitFlush = false;
    }
  }

  if (
    !isExit &&
    config.shouldSendData &&
    !config.shouldSendData()
  ) {
    scheduleGlobalDebounce();
    return;
  }

  clearGlobalTimers();
  const tags = getTags();
  const sections: Section[] = [];

  const sorted = Array.from(
    queues.keys(),
  ).sort((a, b) => {
    const ai = FLUSH_PRIORITY.indexOf(a);
    const bi = FLUSH_PRIORITY.indexOf(b);
    const ap = ai >= 0 ? ai : 999;
    const bp = bi >= 0 ? bi : 999;
    return ap - bp;
  });

  let replayBytes = 0;
  for (const key of sorted) {
    const q = queues.get(key);
    if (!q || q.items.length === 0) continue;
    if (key === REPLAY_BATCH_KEY) {
      replayBytes = q.bytesEstimate;
    }
    const batch = q.items.splice(0);
    q.upsertMap.clear();
    q.bytesEstimate = 0;
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

  const url =
    `${config.endpoint}${INGEST_PATH}`;
  const headers: Record<string, string> = {
    'X-OODLE-INSTANCE': config.instanceId,
    'X-API-KEY': config.apiKey,
    'Content-Type': 'application/json',
  };

  if (isExit) {
    sendSectionsOnExit(url, headers, sections);
    return;
  }

  const replay = sections.filter(
    (s) => s.type === REPLAY_BATCH_KEY,
  );
  const others = sections.filter(
    (s) => s.type !== REPLAY_BATCH_KEY,
  );

  // A replay batch too big for keepalive goes as a plain
  // fetch, which a navigation cancels. RUM events riding
  // in the same envelope would be cancelled with it, so
  // they get a request of their own.
  if (
    replay.length > 0 &&
    others.length > 0 &&
    replayBytes >= KEEPALIVE_MAX_BYTES
  ) {
    sendRaw(url, headers, buildEnvelope(others));
    sendRaw(
      url,
      headers,
      buildEnvelope(replay),
      REPLAY_BATCH_KEY,
    );
    return;
  }

  sendRaw(
    url,
    headers,
    buildEnvelope(sections),
    replay.length > 0
      ? REPLAY_BATCH_KEY
      : undefined,
  );
}

async function sendRaw(
  url: string,
  headers: Record<string, string>,
  raw: string,
  batchKey?: string,
) {
  const byteLen = raw.length;

  if (
    ongoingBytes >= MAX_ONGOING_BYTES ||
    ongoingRequests >= MAX_ONGOING_REQUESTS
  ) {
    enqueueRetry(url, headers, raw, batchKey);
    return;
  }

  ongoingBytes += byteLen;
  ongoingRequests++;

  try {
    const { body, encoding } =
      await compressBatch(raw);
    const hdrs = { ...headers };
    if (encoding) {
      hdrs['Content-Encoding'] = encoding;
    }
    const resp = await post(
      url,
      hdrs,
      body,
      bodyBytes(body, raw),
    );
    parseRateLimitHeaders(resp);
    if (
      resp.status === 429 ||
      resp.status >= 500
    ) {
      enqueueRetry(url, headers, raw, batchKey);
    }
  } catch {
    incrTelemetry('send_failures');
    enqueueRetry(url, headers, raw, batchKey);
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
  exitHandler = () => {
    for (const fn of pageExitProducers) {
      try {
        fn();
      } catch {
        // One producer must not cost the others, or the flush.
      }
    }
    flushAll(true);
  };
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
