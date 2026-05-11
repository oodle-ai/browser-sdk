const DEFAULT_RATE = 50;
const DEFAULT_BURST = 200;

interface Bucket {
  tokens: number;
  lastRefill: number;
  rate: number;
  burst: number;
}

const buckets = new Map<string, Bucket>();

function getBucket(category: string): Bucket {
  let b = buckets.get(category);
  if (!b) {
    b = {
      tokens: DEFAULT_BURST,
      lastRefill: Date.now(),
      rate: DEFAULT_RATE,
      burst: DEFAULT_BURST,
    };
    buckets.set(category, b);
  }
  return b;
}

function refill(b: Bucket) {
  const now = Date.now();
  const elapsed =
    (now - b.lastRefill) / 1000;
  b.tokens = Math.min(
    b.burst,
    b.tokens + elapsed * b.rate,
  );
  b.lastRefill = now;
}

export function tryConsume(
  category: string,
): boolean {
  const b = getBucket(category);
  refill(b);
  if (b.tokens >= 1) {
    b.tokens--;
    return true;
  }
  return false;
}

export function resetBuckets() {
  buckets.clear();
}
