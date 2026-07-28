import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const SESSION_KEY = '__oodle_session';
const HOUR = 60 * 60 * 1000;

async function loadModule() {
  vi.resetModules();
  return import('./session');
}

describe('replay segment indices', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hands out increasing indices', async () => {
    const s = await loadModule();
    expect(s.nextReplaySegmentIndex()).toBe(0);
    expect(s.nextReplaySegmentIndex()).toBe(1);
    expect(s.nextReplaySegmentIndex()).toBe(2);
  });

  it('persists each index immediately, not on a debounce', async () => {
    const s = await loadModule();
    s.nextReplaySegmentIndex();
    s.nextReplaySegmentIndex();

    // A reload that loses a debounced write would hand
    // out an index that already names a stored object.
    const raw = JSON.parse(
      sessionStorage.getItem(SESSION_KEY)!,
    );
    expect(raw.replaySegmentSeq).toBe(2);
  });

  it('continues across a page reload in the same session', async () => {
    const first = await loadModule();
    const idA = first.getSessionId();
    expect(first.nextReplaySegmentIndex()).toBe(0);
    expect(first.nextReplaySegmentIndex()).toBe(1);

    // Fresh module state, same sessionStorage: exactly
    // what a reload looks like.
    const second = await loadModule();
    expect(second.getSessionId()).toBe(idA);
    expect(second.nextReplaySegmentIndex()).toBe(2);
  });

  it('restarts indices under a new id when the session rotates', async () => {
    const s = await loadModule();
    const idA = s.getSessionId();
    s.nextReplaySegmentIndex();
    s.nextReplaySegmentIndex();

    // Past the 4 hour cap.
    vi.setSystemTime(Date.now() + 5 * HOUR);

    const idB = s.getSessionId();
    expect(idB).not.toBe(idA);
    // Indices are namespaced by session id server-side,
    // so restarting at 0 is safe and expected.
    expect(s.nextReplaySegmentIndex()).toBe(0);
  });

  it('restarts indices after the inactivity timeout', async () => {
    const s = await loadModule();
    const idA = s.getSessionId();
    s.nextReplaySegmentIndex();

    vi.setSystemTime(Date.now() + 31 * 60 * 1000);

    expect(s.getSessionId()).not.toBe(idA);
    expect(s.nextReplaySegmentIndex()).toBe(0);
  });
});
