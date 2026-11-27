// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  discardDeferredMutations,
  flushDeferredMutations,
  hasDeferredMutations,
  setMutationDeferral,
  wrapMutationCallback,
} from './mutation-defer';
import {
  RRWEB_CALLBACK,
  patchRrwebSource,
} from '../../rrweb-defer-plugin';

const observer = {} as MutationObserver;
const rec = (n: number) =>
  ({ type: 'childList', n }) as unknown as MutationRecord;

describe('mutation deferral', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    setMutationDeferral(false);
    discardDeferredMutations();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('passes records straight through while off', () => {
    const cb = vi.fn();
    wrapMutationCallback(cb)([rec(1)], observer);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('holds records until the deadline when on', () => {
    setMutationDeferral(true);
    const cb = vi.fn();
    const wrapped = wrapMutationCallback(cb);
    wrapped([rec(1)], observer);
    wrapped([rec(2)], observer);
    expect(cb).not.toHaveBeenCalled();
    expect(hasDeferredMutations()).toBe(true);

    vi.advanceTimersByTime(100);
    // Consecutive deliveries reach rrweb as one batch, in
    // order.
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0]).toEqual([
      rec(1),
      rec(2),
    ]);
    expect(hasDeferredMutations()).toBe(false);
  });

  it('runs in an idle callback when the browser has one', () => {
    let idle: (() => void) | null = null;
    vi.stubGlobal(
      'requestIdleCallback',
      (fn: () => void, opts: { timeout: number }) => {
        expect(opts.timeout).toBe(100);
        idle = fn;
        return 1;
      },
    );
    vi.stubGlobal('cancelIdleCallback', () => {});
    setMutationDeferral(true);
    const cb = vi.fn();
    wrapMutationCallback(cb)([rec(1)], observer);
    expect(cb).not.toHaveBeenCalled();
    idle!();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('keeps order across observers', () => {
    setMutationDeferral(true);
    const calls: string[] = [];
    const a = wrapMutationCallback(() => calls.push('a'));
    const b = wrapMutationCallback(() => calls.push('b'));
    a([rec(1)], observer);
    b([rec(2)], observer);
    a([rec(3)], observer);
    flushDeferredMutations();
    expect(calls).toEqual(['a', 'b', 'a']);
  });

  it('flushes before an interaction rrweb records with a target', () => {
    setMutationDeferral(true);
    const cb = vi.fn();
    wrapMutationCallback(cb)([rec(1)], observer);

    // rrweb listens on document in the capture phase; the
    // flush listener on window runs before it.
    let seenByDocument = -1;
    const onDoc = () => {
      seenByDocument = cb.mock.calls.length;
    };
    document.addEventListener('pointerdown', onDoc, true);
    document.body.dispatchEvent(
      new Event('pointerdown', { bubbles: true }),
    );
    document.removeEventListener('pointerdown', onDoc, true);
    expect(seenByDocument).toBe(1);
  });

  it('skips the flush when rrweb already knows the target', () => {
    const known = document.createElement('input');
    document.body.appendChild(known);
    setMutationDeferral(true, (n) => n === known);
    const cb = vi.fn();
    wrapMutationCallback(cb)([rec(1)], observer);

    known.dispatchEvent(new Event('input', { bubbles: true }));
    expect(cb).not.toHaveBeenCalled();

    // A node added by a queued change has no id yet.
    const added = document.createElement('button');
    document.body.appendChild(added);
    added.dispatchEvent(
      new Event('pointerdown', { bubbles: true }),
    );
    expect(cb).toHaveBeenCalledTimes(1);
    known.remove();
    added.remove();
  });

  it('checks the innermost target inside a shadow root', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    const inner = document.createElement('button');
    root.appendChild(inner);
    // The host is known, the button inside it is not.
    setMutationDeferral(true, (n) => n === host);
    const cb = vi.fn();
    wrapMutationCallback(cb)([rec(1)], observer);
    inner.dispatchEvent(
      new Event('click', { bubbles: true, composed: true }),
    );
    expect(cb).toHaveBeenCalledTimes(1);
    host.remove();
  });

  it('does not flush on scroll', () => {
    setMutationDeferral(true);
    const cb = vi.fn();
    wrapMutationCallback(cb)([rec(1)], observer);
    window.dispatchEvent(new Event('scroll'));
    expect(cb).not.toHaveBeenCalled();
  });

  it('flushes everything when turned off', () => {
    setMutationDeferral(true);
    const cb = vi.fn();
    wrapMutationCallback(cb)([rec(1)], observer);
    setMutationDeferral(false);
    expect(cb).toHaveBeenCalledTimes(1);
    // And no longer defers.
    wrapMutationCallback(cb)([rec(2)], observer);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('processes records queued during a flush in the same flush', () => {
    setMutationDeferral(true);
    const second = vi.fn();
    const wrappedSecond = wrapMutationCallback(second);
    const first = wrapMutationCallback(() => {
      wrappedSecond([rec(2)], observer);
    });
    first([rec(1)], observer);
    flushDeferredMutations();
    expect(second).toHaveBeenCalledTimes(1);
    expect(hasDeferredMutations()).toBe(false);
  });

  it('keeps flushing past a callback that throws', () => {
    setMutationDeferral(true);
    const after = vi.fn();
    wrapMutationCallback(() => {
      throw new Error('boom');
    })([rec(1)], observer);
    wrapMutationCallback(after)([rec(2)], observer);
    expect(() => flushDeferredMutations()).not.toThrow();
    expect(after).toHaveBeenCalledTimes(1);
  });

  it('discards without processing', () => {
    setMutationDeferral(true);
    const cb = vi.fn();
    wrapMutationCallback(cb)([rec(1)], observer);
    discardDeferredMutations();
    vi.advanceTimersByTime(1000);
    expect(cb).not.toHaveBeenCalled();
  });
});

describe('rrweb build patch', () => {
  const require = createRequire(import.meta.url);
  const dir = require
    .resolve('rrweb')
    .replace(/[\\/]dist[\\/].*$/, '');

  // Fails when an rrweb upgrade moves the call site, before
  // a build could ship a recorder that no longer defers.
  it.each(['rrweb.js'])(
    'finds exactly one MutationObserver callback in dist/%s',
    (file) => {
      const src = readFileSync(
        `${dir}/dist/${file}`,
        'utf8',
      );
      const out = patchRrwebSource(src, '/defer.ts');
      expect(out.startsWith(
        'import { wrapMutationCallback as __oodleWrapMutationCallback } from "/defer.ts";',
      )).toBe(true);
      expect(out).toContain(
        `__oodleWrapMutationCallback(${RRWEB_CALLBACK})`,
      );
    },
  );

  it('refuses a source without the call site', () => {
    expect(() =>
      patchRrwebSource('const x = 1;', '/defer.ts'),
    ).toThrow(
      /found 0/,
    );
  });
});
