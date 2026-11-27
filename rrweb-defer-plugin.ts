import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

/**
 * Routes rrweb's MutationObserver callback through
 * `wrapMutationCallback` (src/replay/mutation-defer.ts), so
 * the SDK decides when rrweb processes DOM changes.
 *
 * rrweb has no option for this, and it rejects a patched
 * global `MutationObserver`, so the call site is rewritten at
 * build time. rrweb is pinned to an exact version; if an
 * upgrade changes the call site, the build fails here rather
 * than shipping a recorder that silently stopped deferring.
 *
 * Two more rewrites stop rrweb from keeping serialized
 * copies of the page it never reads again; see
 * RRWEB_META_ADD and RRWEB_LAST_SNAPSHOT.
 */
export const RRWEB_CALLBACK =
  'callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer))';

const HOOK = '__oodleWrapMutationCallback';

/**
 * rrweb's node map keeps, for every node it has seen, the
 * object it serialized the node into: attributes, text,
 * and the array of serialized children. The recorder only
 * ever reads `id` back (and checks that an entry exists),
 * so the rest is dead weight, and the children arrays keep
 * the first snapshot's records alive after the nodes they
 * describe were moved and re-recorded. On a 1,500-row
 * table re-sorted a few times that was about 27,000
 * records, twice the live node count, and most of the
 * SDK's heap after GC.
 *
 * The map gets a two-field record instead. The emitted
 * snapshot keeps the full object.
 */
export const RRWEB_META_ADD =
  'mirror2.add(n2, serializedNode);';
const SLIM_META_ADD =
  'mirror2.add(n2, { id: serializedNode.id, type: serializedNode.type });';

/**
 * rrweb also keeps the last full snapshot event, the whole
 * serialized document, to compare its timestamp for
 * `checkoutEveryNms`. Only the timestamp is kept now.
 */
export const RRWEB_LAST_SNAPSHOT =
  'lastFullSnapshotEvent = e2;';
const SLIM_LAST_SNAPSHOT =
  'lastFullSnapshotEvent = { timestamp: e2.timestamp };';

/** Resolved lazily: only a real build needs the path. */
function deferModulePath(): string {
  return fileURLToPath(
    new URL(
      './src/replay/mutation-defer.ts',
      import.meta.url,
    ),
  );
}

// The ESM build only: the patch prepends an `import`, and
// the library build resolves rrweb through its `import`
// condition for both output formats.
const RRWEB_ID = /[\\/]rrweb[\\/]dist[\\/]rrweb\.m?js$/;

function countOf(code: string, needle: string): number {
  return code.split(needle).length - 1;
}

export function patchRrwebSource(
  code: string,
  deferModule: string = deferModulePath(),
): string {
  for (const [what, needle] of [
    ['MutationObserver callback', RRWEB_CALLBACK],
    ['node map insert', RRWEB_META_ADD],
    ['last snapshot store', RRWEB_LAST_SNAPSHOT],
  ]) {
    const count = countOf(code, needle);
    if (count !== 1) {
      throw new Error(
        `rrweb-defer: expected 1 ${what} in rrweb, found ${count}. ` +
          'rrweb changed; update rrweb-defer-plugin.ts.',
      );
    }
  }
  return (
    `import { wrapMutationCallback as ${HOOK} } from ${JSON.stringify(deferModule)};\n` +
    code
      .replace(
        RRWEB_CALLBACK,
        `${HOOK}(${RRWEB_CALLBACK})`,
      )
      .replace(RRWEB_META_ADD, SLIM_META_ADD)
      .replace(
        RRWEB_LAST_SNAPSHOT,
        SLIM_LAST_SNAPSHOT,
      )
  );
}

export function rrwebDeferPlugin(): Plugin {
  let patched = 0;
  return {
    name: 'oodle-rrweb-defer',
    // Tests mock rrweb; only the library build bundles it.
    apply: 'build',
    enforce: 'pre',
    transform(code, id) {
      if (!RRWEB_ID.test(id.split('?')[0])) return null;
      patched++;
      return { code: patchRrwebSource(code), map: null };
    },
    buildEnd(err) {
      // A build that bundles the recorder but never saw
      // rrweb would ship without deferral.
      if (!err && patched === 0) {
        this.error(
          'rrweb-defer: rrweb was not transformed. Check RRWEB_ID.',
        );
      }
    },
  };
}
