/**
 * Synchronous gzip. Blocks the caller for the whole
 * payload, so it is only for the page-exit path where
 * there is no later tick to finish the work in.
 */
export declare function compressSyncString(raw: string): Uint8Array | null;
/**
 * Falls back to the synchronous path when the native
 * API is missing or rejects the payload, so callers get
 * a compressed body on every browser and only pay the
 * main-thread cost where there is no alternative.
 */
export declare function compressString(raw: string): Promise<Uint8Array | null>;
