import { describe, expect, it } from 'vitest';
import { orderAdds } from './order-adds';

type Add = { parentId: number; nextId: number | null; node: { id: number } };
const add = (id: number, parentId: number, nextId: number | null): Add => ({
  parentId,
  nextId,
  node: { id },
});

/**
 * Applies adds the way rrweb's player does: an entry needs its
 * parent and its next sibling to exist, otherwise it is
 * retried. Returns how many passes it took.
 */
function passesToApply(existing: Set<number>, adds: Add[]): number {
  const have = new Set(existing);
  let queue = adds;
  let passes = 0;
  while (queue.length && passes < 10_000) {
    passes++;
    const next: Add[] = [];
    for (const a of queue) {
      const ok = have.has(a.parentId) && (a.nextId == null || have.has(a.nextId));
      if (ok) have.add(a.node.id);
      else next.push(a);
    }
    queue = next;
  }
  return passes;
}

describe('orderAdds', () => {
  it('turns a reversed sibling chain into one pass', () => {
    // rrweb's shape for a re-sorted list: each row names the
    // following entry as its next sibling.
    const n = 1500;
    const adds: Add[] = [];
    for (let i = 0; i < n; i++) {
      adds.push(add(1000 + i, 1, i === n - 1 ? null : 1000 + i + 1));
    }
    expect(passesToApply(new Set([1]), adds)).toBe(n);
    const ordered = orderAdds(adds);
    expect(passesToApply(new Set([1]), ordered)).toBe(1);
    expect(new Set(ordered)).toEqual(new Set(adds));
  });

  it('puts parents before children', () => {
    const adds = [add(11, 10, null), add(12, 10, 11), add(10, 1, null)];
    const ordered = orderAdds(adds);
    expect(ordered.map((a) => a.node.id)).toEqual([10, 11, 12]);
  });

  it('keeps an order that already works', () => {
    const adds = [add(10, 1, null), add(11, 10, null), add(12, 1, 10)];
    expect(orderAdds(adds)).toBe(adds);
  });

  it('keeps references to nodes outside the batch as they are', () => {
    const adds = [add(10, 1, 99), add(11, 1, 10)];
    expect(orderAdds(adds)).toBe(adds);
  });

  it('emits every entry even for a cycle', () => {
    const adds = [add(10, 1, 11), add(11, 1, 10)];
    const ordered = orderAdds(adds);
    expect(ordered).toHaveLength(2);
    expect(new Set(ordered)).toEqual(new Set(adds));
  });

  it('handles nested moved subtrees', () => {
    // Rows re-added with their cells as separate entries,
    // all in the order the recorder produces.
    const adds: Add[] = [];
    const rows = 300;
    for (let r = 0; r < rows; r++) {
      const id = 1000 + r * 10;
      adds.push(add(id, 1, r === rows - 1 ? null : id + 10));
      for (let c = 0; c < 4; c++) {
        adds.push(add(id + 1 + c, id, c === 3 ? null : id + 2 + c));
      }
    }
    expect(passesToApply(new Set([1]), orderAdds(adds))).toBe(1);
  });
});
