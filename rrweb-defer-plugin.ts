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
 */
export const RRWEB_CALLBACK =
  'callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer))';

const HOOK = '__oodleWrapMutationCallback';

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

export function patchRrwebSource(
  code: string,
  deferModule: string = deferModulePath(),
): string {
  const count = code.split(RRWEB_CALLBACK).length - 1;
  if (count !== 1) {
    throw new Error(
      `rrweb-defer: expected 1 MutationObserver callback in rrweb, found ${count}. ` +
        'rrweb changed; update rrweb-defer-plugin.ts.',
    );
  }
  return (
    `import { wrapMutationCallback as ${HOOK} } from ${JSON.stringify(deferModule)};\n` +
    code.replace(
      RRWEB_CALLBACK,
      `${HOOK}(${RRWEB_CALLBACK})`,
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
