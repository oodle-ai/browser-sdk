/**
 * Byte estimate for a JSON-serializable value.
 *
 * Walks the whole object graph rather than scoring a
 * nested object as a fixed constant. rrweb full
 * snapshots and mutation batches keep all of their
 * weight below the top level, so a shallow estimate
 * reports a multi-megabyte snapshot as ~100 bytes and
 * every size guard built on it silently stops working.
 *
 * Callers only ever compare the result against a
 * threshold, so pass `limit` to stop walking as soon
 * as the value is known to be over it.
 */
export declare function estimateJsonBytes(value: unknown, limit?: number): number;
