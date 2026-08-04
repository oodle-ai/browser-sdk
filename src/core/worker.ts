import {
  gzipSync,
  strToU8,
} from 'fflate';

/**
 * Synchronous gzip. Blocks the caller for the whole
 * payload, so it is only for the page-exit path where
 * there is no later tick to finish the work in.
 */
export function compressSyncString(
  raw: string,
): Uint8Array | null {
  try {
    return gzipSync(strToU8(raw));
  } catch {
    return null;
  }
}

/**
 * `CompressionStream` gzips in the browser's own
 * threads and hands the result back on a later tick,
 * so a multi-megabyte replay segment costs the main
 * thread almost nothing. fflate does the same work in
 * JS and holds the thread for the entire payload: a
 * ~3.5MB segment measured ~400ms in one uninterrupted
 * task, long enough to drop every frame in it.
 *
 * Cached rather than probed per call because the answer
 * cannot change within a document.
 */
const nativeGzipAvailable: boolean = (() => {
  try {
    return (
      typeof CompressionStream !== 'undefined' &&
      typeof Response !== 'undefined'
    );
  } catch {
    return false;
  }
})();

/**
 * Falls back to the synchronous path when the native
 * API is missing or rejects the payload, so callers get
 * a compressed body on every browser and only pay the
 * main-thread cost where there is no alternative.
 */
export async function compressString(
  raw: string,
): Promise<Uint8Array | null> {
  if (!nativeGzipAvailable) {
    return compressSyncString(raw);
  }
  try {
    const body = new Response(raw).body;
    if (!body) return compressSyncString(raw);
    const gzipped = body.pipeThrough(
      new CompressionStream('gzip'),
    );
    const buf = await new Response(
      gzipped,
    ).arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return compressSyncString(raw);
  }
}
