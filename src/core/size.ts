const MAX_VISITED_NODES = 500_000;

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
export function estimateJsonBytes(
  value: unknown,
  limit = Number.POSITIVE_INFINITY,
): number {
  let total = 0;
  let visited = 0;
  const stack: unknown[] = [value];

  while (stack.length > 0) {
    if (total >= limit) return total;
    if (++visited > MAX_VISITED_NODES) return total;

    const v = stack.pop();
    if (v === null || v === undefined) {
      total += 4;
      continue;
    }

    switch (typeof v) {
      case 'string':
        total += v.length + 2;
        break;
      case 'number':
        total += 8;
        break;
      case 'boolean':
        total += 5;
        break;
      case 'object': {
        if (Array.isArray(v)) {
          total += 2 + v.length;
          for (let i = 0; i < v.length; i++) {
            stack.push(v[i]);
          }
        } else {
          total += 2;
          for (const key in v as Record<
            string,
            unknown
          >) {
            if (
              !Object.prototype.hasOwnProperty.call(
                v,
                key,
              )
            ) {
              continue;
            }
            total += key.length + 4;
            stack.push(
              (v as Record<string, unknown>)[key],
            );
          }
        }
        break;
      }
      default:
        break;
    }
  }

  return total;
}
