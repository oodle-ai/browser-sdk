import { describe, expect, it } from 'vitest';
import type { eventWithTime } from '@rrweb/types';
import {
  createMutationThrottler,
  type MirrorLike,
} from './mutation-throttle';

const INCREMENTAL_SNAPSHOT = 3;

function mutation(
  data: Record<string, unknown>,
): eventWithTime {
  return {
    type: INCREMENTAL_SNAPSHOT,
    data: { source: 0, ...data },
    timestamp: 1,
  } as unknown as eventWithTime;
}

function attrs(ids: number[]) {
  return ids.map((id) => ({
    id,
    attributes: { style: 'x' },
  }));
}

/** Advances only when the test says so. */
function fakeClock() {
  let t = 0;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

describe('mutation throttler', () => {
  it('lets a node through until its budget runs out', () => {
    const clock = fakeClock();
    const { throttle } = createMutationThrottler(
      () => null,
      clock.now,
    );

    let delivered = 0;
    let dropped = 0;
    for (let i = 0; i < 200; i++) {
      const r = throttle(
        mutation({ attributes: attrs([7]) }),
      );
      delivered += r.event ? 1 : 0;
      dropped += r.dropped;
    }

    // 100 tokens, and the clock never moves, so no
    // refill: the first 100 land and the rest are shed.
    expect(dropped).toBe(100);
    expect(delivered).toBe(100);
  });

  it('budgets each node separately so one bad actor cannot starve the page', () => {
    const clock = fakeClock();
    const { throttle } = createMutationThrottler(
      () => null,
      clock.now,
    );

    for (let i = 0; i < 150; i++) {
      throttle(
        mutation({ attributes: attrs([1]) }),
      );
    }
    // Node 1 is exhausted. A different node must be
    // unaffected, which is the whole point of budgeting
    // per node rather than globally.
    const other = throttle(
      mutation({ attributes: attrs([2]) }),
    );
    expect(other.dropped).toBe(0);
    expect(other.event).not.toBeNull();
  });

  it('refills over time so a throttled node recovers', () => {
    const clock = fakeClock();
    const { throttle } = createMutationThrottler(
      () => null,
      clock.now,
    );

    for (let i = 0; i < 150; i++) {
      throttle(
        mutation({ attributes: attrs([3]) }),
      );
    }
    expect(
      throttle(
        mutation({ attributes: attrs([3]) }),
      ).event,
    ).toBeNull();

    // 10 tokens/sec.
    clock.advance(1000);
    const after = throttle(
      mutation({ attributes: attrs([3]) }),
    );
    expect(after.dropped).toBe(0);
    expect(after.event).not.toBeNull();
  });

  it('never drops adds, removes or texts', () => {
    const clock = fakeClock();
    const { throttle } = createMutationThrottler(
      () => null,
      clock.now,
    );

    // Exhaust the node first.
    for (let i = 0; i < 150; i++) {
      throttle(
        mutation({ attributes: attrs([9]) }),
      );
    }

    const structural = mutation({
      attributes: attrs([9]),
      adds: [{ parentId: 1, node: { id: 99 } }],
      removes: [{ parentId: 1, id: 98 }],
      texts: [{ id: 97, value: 'hi' }],
    });
    const r = throttle(structural);

    // Structural deltas are what the rest of the stream
    // is expressed against; dropping one would force a
    // full re-snapshot to repair.
    expect(r.event).not.toBeNull();
    const data = (r.event as any).data;
    expect(data.adds).toHaveLength(1);
    expect(data.removes).toHaveLength(1);
    expect(data.texts).toHaveLength(1);
    expect(data.attributes).toHaveLength(0);
  });

  it('charges svg descendants to the svg so one chart spends one budget', () => {
    const clock = fakeClock();
    const svg = { __tag: 'svg' } as unknown as Node;
    const paths = new Map<number, Node>();
    for (let i = 100; i < 200; i++) {
      paths.set(i, {
        closest: (sel: string) =>
          sel === 'svg' ? svg : null,
      } as unknown as Node);
    }
    const mirror: MirrorLike = {
      getNode: (id) => paths.get(id) ?? null,
      getId: (n) => (n === svg ? 42 : -1),
    };
    const { throttle } = createMutationThrottler(
      () => mirror,
      clock.now,
    );

    // 100 distinct descendant nodes, one animation.
    // Charged individually each would have a full
    // budget; rolled up they share one.
    let dropped = 0;
    for (let pass = 0; pass < 2; pass++) {
      for (let id = 100; id < 200; id++) {
        dropped += throttle(
          mutation({ attributes: attrs([id]) }),
        ).dropped;
      }
    }
    expect(dropped).toBe(100);
  });

  it('leaves non-mutation events untouched', () => {
    const clock = fakeClock();
    const { throttle } = createMutationThrottler(
      () => null,
      clock.now,
    );

    const meta = {
      type: 4,
      data: { href: 'x' },
      timestamp: 1,
    } as unknown as eventWithTime;
    const r = throttle(meta);
    expect(r.event).toBe(meta);
    expect(r.dropped).toBe(0);

    // A mouse move is source !== 0 and carries no
    // attributes.
    const move = mutation({ source: 1 });
    expect(throttle(move).event).not.toBeNull();
  });

  it('records rather than drops when a node lookup throws', () => {
    const clock = fakeClock();
    const mirror: MirrorLike = {
      getNode: () => {
        throw new Error('detached');
      },
      getId: () => -1,
    };
    const { throttle } = createMutationThrottler(
      () => mirror,
      clock.now,
    );
    const r = throttle(
      mutation({ attributes: attrs([5]) }),
    );
    expect(r.dropped).toBe(0);
    expect(r.event).not.toBeNull();
  });
});
