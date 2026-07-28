import { describe, expect, it } from 'vitest';
import { estimateJsonBytes } from './size';

describe('estimateJsonBytes', () => {
  it('counts nested content instead of scoring an object as a constant', () => {
    const payload = {
      session_id: 'abc',
      events: [
        {
          type: 2,
          data: { node: { text: 'y'.repeat(50_000) } },
        },
      ],
    };

    // The previous shallow estimator returned ~110
    // bytes here, which silently disabled every size
    // guard built on it.
    expect(
      estimateJsonBytes(payload),
    ).toBeGreaterThan(50_000);
  });

  it('tracks real JSON length within an order of magnitude', () => {
    const payload = {
      a: 'hello',
      b: [1, 2, 3],
      c: { d: true, e: null },
    };
    const actual = JSON.stringify(payload).length;
    const estimate = estimateJsonBytes(payload);

    expect(estimate).toBeGreaterThan(actual / 4);
    expect(estimate).toBeLessThan(actual * 4);
  });

  it('stops walking once the limit is passed', () => {
    const deep = {
      items: Array.from(
        { length: 100_000 },
        (_, i) => ({ v: `item-${i}` }),
      ),
    };
    const start = performance.now();
    const bytes = estimateJsonBytes(deep, 1000);
    const elapsed = performance.now() - start;

    expect(bytes).toBeGreaterThanOrEqual(1000);
    expect(elapsed).toBeLessThan(50);
  });
});
