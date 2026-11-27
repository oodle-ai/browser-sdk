/**
 * Orders a mutation event's `adds` so rrweb's player can apply
 * them in one pass.
 *
 * The player inserts an added node only once its parent and
 * its next sibling (`nextId`) exist; anything else goes to a
 * retry queue. rrweb's recorder lists moved siblings so that
 * each one names the following entry as its next sibling, the
 * opposite of what the player needs. A keyed re-sort of a long
 * list therefore becomes one long retry chain, the player
 * gives up after 500 ms ("Timeout in the loop"), and the rest
 * of the rows are silently missing from the replay. With
 * rrweb 2.1.1's player, re-sorting 1,500 table rows lost about
 * two thirds of them, and a second re-sort lost all of them.
 *
 * Placing every add after the adds it depends on removes the
 * queue entirely. The output holds the same entries; only
 * their order changes, and entries with no dependency in the
 * batch keep their original relative order.
 */

interface AddLike {
  parentId: number;
  nextId?: number | null;
  node: { id: number };
}

const PENDING = 1;
const DONE = 2;

export function orderAdds<T extends AddLike>(
  adds: T[],
): T[] {
  if (adds.length < 2) return adds;

  const indexById = new Map<number, number>();
  for (let i = 0; i < adds.length; i++) {
    indexById.set(adds[i].node.id, i);
  }

  // Cheap exit for the common case: nothing depends on an
  // entry that comes later.
  let needsReorder = false;
  for (let i = 0; i < adds.length && !needsReorder; i++) {
    const a = adds[i];
    const p = indexById.get(a.parentId);
    const n =
      a.nextId != null ? indexById.get(a.nextId) : undefined;
    if (
      (p !== undefined && p > i) ||
      (n !== undefined && n > i)
    ) {
      needsReorder = true;
    }
  }
  if (!needsReorder) return adds;

  const state = new Uint8Array(adds.length);
  const out: T[] = [];
  // Explicit stack: sibling chains run thousands deep.
  const stack: number[] = [];

  const depsOf = (i: number): number[] => {
    const a = adds[i];
    const deps: number[] = [];
    const p = indexById.get(a.parentId);
    if (p !== undefined && p !== i) deps.push(p);
    if (a.nextId != null) {
      const n = indexById.get(a.nextId);
      if (n !== undefined && n !== i) deps.push(n);
    }
    return deps;
  };

  for (let start = 0; start < adds.length; start++) {
    if (state[start] === DONE) continue;
    stack.push(start);
    while (stack.length > 0) {
      const i = stack[stack.length - 1];
      if (state[i] === DONE) {
        stack.pop();
        continue;
      }
      if (state[i] === PENDING) {
        // Every dependency has been visited (or is part of a
        // cycle, which a real DOM cannot produce; the entry
        // is emitted anyway so nothing is lost).
        state[i] = DONE;
        out.push(adds[i]);
        stack.pop();
        continue;
      }
      state[i] = PENDING;
      const deps = depsOf(i);
      for (let d = deps.length - 1; d >= 0; d--) {
        if (state[deps[d]] === 0) stack.push(deps[d]);
      }
    }
  }
  return out;
}
