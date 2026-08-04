import type { eventWithTime } from '@rrweb/types';

/**
 * Per-node budget for attribute mutations.
 *
 * A storm is almost always one element being restyled in
 * a loop: a progress bar, a spinner, a chart animating
 * its transform. Budgeting per node lets that element
 * fall behind while the rest of the page records at full
 * fidelity, instead of a global counter punishing every
 * node for one bad actor.
 */
const BUCKET_CAPACITY = 100;
const BUCKET_REFILL_PER_SEC = 10;

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

/**
 * Cap on tracked nodes. Buckets are only created for
 * nodes that actually mutate, but a page churning
 * through thousands of short-lived nodes would otherwise
 * grow this without bound.
 */
const MAX_TRACKED_NODES = 5_000;

export interface MirrorLike {
  getNode(id: number): Node | null;
  getId(node: Node): number;
}

export interface ThrottleResult {
  /**
   * The event to buffer, or null when throttling emptied
   * it and there is nothing left worth sending.
   */
  event: eventWithTime | null;
  /** Attribute entries removed by the budget. */
  dropped: number;
}

const INCREMENTAL_SNAPSHOT = 3;
const MUTATION_SOURCE = 0;

interface MutationData {
  source?: number;
  attributes?: { id: number }[];
  adds?: unknown[];
  removes?: unknown[];
  texts?: unknown[];
}

export function createMutationThrottler(
  getMirror: () => MirrorLike | null,
  nowMs: () => number = () => Date.now(),
) {
  const buckets = new Map<number, Bucket>();
  /**
   * Resolved id for a node's throttling identity, which
   * is not always the node itself. Cached because the
   * lookup walks ancestors.
   */
  const identity = new Map<number, number>();

  function reset() {
    buckets.clear();
    identity.clear();
  }

  /**
   * An animating chart mutates hundreds of descendant
   * paths, all driven by one logical change. Charging
   * them to the closest <svg> ancestor spends one budget
   * instead of hundreds, so the rest of the page is
   * unaffected and the chart degrades on its own.
   */
  function identityFor(id: number): number {
    const cached = identity.get(id);
    if (cached !== undefined) return cached;

    let resolved = id;
    const mirror = getMirror();
    if (mirror) {
      try {
        const node = mirror.getNode(id);
        const el =
          node && (node as Element).closest
            ? (node as Element).closest('svg')
            : null;
        if (el) {
          const svgId = mirror.getId(el);
          if (svgId !== -1) resolved = svgId;
        }
      } catch {
        // Node is gone, or not an Element. Charge it to
        // itself rather than losing the mutation.
      }
    }

    if (identity.size < MAX_TRACKED_NODES) {
      identity.set(id, resolved);
    }
    return resolved;
  }

  function allow(id: number): boolean {
    const key = identityFor(id);
    const now = nowMs();
    let bucket = buckets.get(key);

    if (!bucket) {
      if (buckets.size >= MAX_TRACKED_NODES) {
        // Out of tracking capacity: record rather than
        // drop. Losing an attribute is cheap, but a
        // silent gap in a page we have no budget to
        // measure is not worth it.
        return true;
      }
      bucket = {
        tokens: BUCKET_CAPACITY,
        lastRefillMs: now,
      };
      buckets.set(key, bucket);
    }

    const elapsedSec =
      (now - bucket.lastRefillMs) / 1000;
    if (elapsedSec > 0) {
      bucket.tokens = Math.min(
        BUCKET_CAPACITY,
        bucket.tokens +
          elapsedSec * BUCKET_REFILL_PER_SEC,
      );
      bucket.lastRefillMs = now;
    }

    if (bucket.tokens < 1) return false;
    bucket.tokens -= 1;
    return true;
  }

  /**
   * Filters attribute mutations against each node's
   * budget.
   *
   * Only `attributes` is ever filtered. rrweb emits a
   * delta stream, so dropping an `add` or a `remove`
   * leaves every later event describing a tree the
   * player never built, which can only be repaired by
   * re-serializing the whole DOM. Dropping an attribute
   * leaves one node's styling stale until its next
   * mutation and keeps the stream valid, so throttling
   * never costs us the rest of the session.
   */
  function throttle(
    event: eventWithTime,
  ): ThrottleResult {
    if (event.type !== INCREMENTAL_SNAPSHOT) {
      return { event, dropped: 0 };
    }
    const data = (event as { data?: MutationData })
      .data;
    if (
      !data ||
      data.source !== MUTATION_SOURCE ||
      !data.attributes ||
      data.attributes.length === 0
    ) {
      return { event, dropped: 0 };
    }

    const before = data.attributes.length;
    const kept = data.attributes.filter((attr) =>
      allow(attr.id),
    );
    const dropped = before - kept.length;
    if (dropped === 0) {
      return { event, dropped: 0 };
    }

    data.attributes = kept;

    const stillCarriesData =
      kept.length > 0 ||
      (data.adds?.length ?? 0) > 0 ||
      (data.removes?.length ?? 0) > 0 ||
      (data.texts?.length ?? 0) > 0;

    return {
      event: stillCarriesData ? event : null,
      dropped,
    };
  }

  return { throttle, reset };
}
