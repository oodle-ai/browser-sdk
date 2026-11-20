import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

/**
 * Node 22+ puts its own `localStorage` on the global, and without
 * --localstorage-file it has no methods; it hides jsdom's. Tabs
 * share localStorage, so the tests need a working one.
 */
class MemoryStorage {
  private m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  clear() {
    this.m.clear();
  }
  getItem(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v));
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  key(i: number) {
    return Array.from(this.m.keys())[i] ?? null;
  }
}
Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
});

const SHARED_KEY = '__oodle_session_v2';
const TAB_KEY = '__oodle_tab';
const LEGACY_KEY = '__oodle_session';
const MIN = 60 * 1000;
const HOUR = 60 * MIN;

/** A fresh module over the same storage: what a reload looks like. */
async function reload() {
  vi.resetModules();
  const s = await import('./session');
  s._resetSessionModule();
  return s;
}

/** Another tab: same localStorage, its own sessionStorage. */
async function otherTab() {
  sessionStorage.clear();
  return reload();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  sessionStorage.clear();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('session lifetime', () => {
  it('has no session before any activity', async () => {
    const s = await reload();
    expect(s.getSessionId()).toBe('');
  });

  it('starts one on activity and keeps it while the user is active', async () => {
    const s = await reload();
    s.touchSession();
    const id = s.getSessionId();
    expect(id).not.toBe('');
    vi.setSystemTime(Date.now() + 10 * MIN);
    s.touchSession();
    vi.setSystemTime(Date.now() + 10 * MIN);
    expect(s.getSessionId()).toBe(id);
  });

  it('expires after 15 minutes without activity and is not renewed by background work', async () => {
    const s = await reload();
    s.touchSession();
    vi.setSystemTime(Date.now() + 16 * MIN);
    // An event from a timer or a poll: nothing is recorded.
    expect(s.getSessionId()).toBe('');
    expect(s.getSessionId()).toBe('');
  });

  it('is extended, never started, by the tab becoming visible', async () => {
    const s = await reload();
    s.touchSession();
    const id = s.getSessionId();
    vi.setSystemTime(Date.now() + 10 * MIN);
    s.extendSession();
    vi.setSystemTime(Date.now() + 10 * MIN);
    expect(s.getSessionId()).toBe(id);
    vi.setSystemTime(Date.now() + 16 * MIN);
    s.extendSession();
    expect(s.getSessionId()).toBe('');
  });

  it('starts the next session on the next user activity and tells listeners', async () => {
    const s = await reload();
    s.touchSession();
    const first = s.getSessionId();
    const renewed = vi.fn();
    s.onSessionRenewed(renewed);
    vi.setSystemTime(Date.now() + 16 * MIN);
    s.touchSession();
    const second = s.getSessionId();
    expect(second).not.toBe('');
    expect(second).not.toBe(first);
    expect(renewed).toHaveBeenCalledWith(first, second);
  });

  it('ends at four hours even with constant activity', async () => {
    const s = await reload();
    s.touchSession();
    const first = s.getSessionId();
    for (let i = 0; i < 25; i++) {
      vi.setSystemTime(Date.now() + 10 * MIN);
      s.touchSession();
    }
    expect(s.getSessionId()).not.toBe(first);
  });
});

describe('sessions across tabs', () => {
  it('shares the session id and gives each tab its own tab id', async () => {
    const a = await reload();
    a.touchSession();
    const sid = a.getSessionId();
    const tabA = a.getTabId();

    const b = await otherTab();
    b.touchSession();
    expect(b.getSessionId()).toBe(sid);
    expect(b.getTabId()).not.toBe(tabA);
  });

  it('claims the session start exactly once, whichever tab sends first', async () => {
    const a = await reload();
    a.touchSession();
    expect(a.claimSessionStart()).toBe(true);
    expect(a.claimSessionStart()).toBe(false);

    const b = await otherTab();
    b.touchSession();
    expect(b.claimSessionStart()).toBe(false);
  });

  it('keeps the tab id across a reload of the same tab', async () => {
    const a = await reload();
    a.touchSession();
    const tab = a.getTabId();
    const again = await reload();
    expect(again.getTabId()).toBe(tab);
  });

  it('ends a session another tab replaced at its own expiry', async () => {
    const s = await reload();
    s.touchSession();
    const first = s.getSessionId();
    const lastActivity = Date.now();
    // Another tab starts the next session after this one expired.
    vi.setSystemTime(Date.now() + 30 * MIN);
    localStorage.setItem(
      '__oodle_session_v2',
      JSON.stringify({ id: 'other', createdAt: Date.now(), lastActivity: Date.now(), started: true }),
    );
    expect(s.sessionEndedAt(first)).toBe(lastActivity + 15 * MIN);
    // Nor does this tab adopt it without its own user's activity.
    expect(s.getSessionId()).toBe('');
    s.touchSession();
    expect(s.getSessionId()).toBe('other');
  });

  it('joins a session another tab created at the same moment', async () => {
    const s = await reload();
    s.touchSession();
    const mine = s.getSessionId();
    // Another tab woke too and wrote its own session over ours.
    localStorage.setItem(
      '__oodle_session_v2',
      JSON.stringify({ id: 'theirs', createdAt: Date.now(), lastActivity: Date.now(), started: true }),
    );
    await vi.advanceTimersByTimeAsync(150);
    expect(mine).not.toBe('theirs');
    expect(s.getSessionId()).toBe('theirs');
  });

  it('takes a new tab id when another open tab holds the same one', async () => {
    // A stand-in channel shared by every instance, as tabs share one.
    const peers: any[] = [];
    class FakeChannel {
      onmessage: ((e: { data: unknown }) => void) | null = null;
      constructor() { peers.push(this); }
      postMessage(data: unknown) {
        for (const p of peers) if (p !== this) queueMicrotask(() => p.onmessage?.({ data }));
      }
      close() { peers.splice(peers.indexOf(this), 1); }
    }
    vi.stubGlobal('BroadcastChannel', FakeChannel);
    try {
      const first = await reload();
      first.initSessionListeners();
      const id = first.getTabId();
      // A duplicated tab starts with a copy of this tab's state.
      const copy = sessionStorage.getItem('__oodle_tab');
      vi.resetModules();
      const second = await import('./session');
      second._resetSessionModule();
      if (copy) sessionStorage.setItem('__oodle_tab', copy);
      second.initSessionListeners();
      await vi.advanceTimersByTimeAsync(10);
      expect(first.getTabId()).toBe(id);
      expect(second.getTabId()).not.toBe(id);
      first.destroySessionListeners();
      second.destroySessionListeners();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('replay segment indices', () => {
  it('hands out increasing indices and writes each one at once', async () => {
    const s = await reload();
    s.touchSession();
    expect(s.nextReplaySegmentIndex()).toBe(0);
    expect(s.nextReplaySegmentIndex()).toBe(1);
    // A reload that loses a debounced write would hand out an
    // index that already names a stored object.
    expect(JSON.parse(sessionStorage.getItem(TAB_KEY)!).replaySegmentSeq).toBe(2);
  });

  it('continues across a page reload in the same session', async () => {
    const s = await reload();
    s.touchSession();
    s.nextReplaySegmentIndex();
    s.nextReplaySegmentIndex();
    const again = await reload();
    again.touchSession();
    expect(again.nextReplaySegmentIndex()).toBe(2);
  });

  it('counts per tab, so two tabs in one session do not collide', async () => {
    const a = await reload();
    a.touchSession();
    a.nextReplaySegmentIndex();
    const b = await otherTab();
    b.touchSession();
    // Keys hold the tab id, so both may start at 0.
    expect(b.nextReplaySegmentIndex()).toBe(0);
  });

  it('restarts under the next session', async () => {
    const s = await reload();
    s.touchSession();
    s.nextReplaySegmentIndex();
    vi.setSystemTime(Date.now() + 16 * MIN);
    s.touchSession();
    expect(s.nextReplaySegmentIndex()).toBe(0);
  });
});

describe('upgrade from a per-tab session', () => {
  function writeLegacy(lastActivityAgo: number) {
    const now = Date.now();
    sessionStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({
        id: 'legacy-id',
        createdAt: now - HOUR,
        lastActivity: now - lastActivityAgo,
        viewCount: 4,
        errorCount: 1,
        actionCount: 2,
        sampled: true,
        replaySampled: true,
        replaySegmentSeq: 7,
      }),
    );
  }

  it('keeps the session, its replay path and its segment counter', async () => {
    writeLegacy(5 * MIN);
    const s = await reload();
    s.touchSession();
    expect(s.getSessionId()).toBe('legacy-id');
    expect(s.isLegacyReplayTab()).toBe(true);
    expect(s.nextReplaySegmentIndex()).toBe(7);
    // Its start was counted by the old SDK.
    expect(s.claimSessionStart()).toBe(false);
    expect(JSON.parse(localStorage.getItem(SHARED_KEY)!).id).toBe('legacy-id');
  });

  it('does not adopt a session the old SDK would have ended', async () => {
    writeLegacy(31 * MIN);
    const s = await reload();
    s.touchSession();
    expect(s.getSessionId()).not.toBe('legacy-id');
    expect(s.isLegacyReplayTab()).toBe(false);
  });
});
