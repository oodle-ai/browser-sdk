import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * What leaves the SDK: ids on every event, the session start
 * flag, and view updates collapsed per batch without losing the
 * flags that count the view and the session.
 */

const config: Record<string, unknown> = {
  instanceId: 'inst',
  apiKey: 'key',
  endpoint: 'https://localhost',
  service: 'test',
};
vi.mock('../core/config', () => ({ getConfig: () => config }));
vi.mock('web-vitals', () => ({
  onLCP: () => {},
  onFCP: () => {},
  onTTFB: () => {},
  onFID: () => {},
}));

let started = false;
vi.mock('../core/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../core/session')>()),
  getSessionId: () => 'session-1',
  isSessionSampled: () => true,
  claimSessionStart: () => {
    if (started) return false;
    started = true;
    return true;
  },
}));
vi.mock('../core/telemetry', () => ({ incrTelemetry: () => {} }));
vi.mock('../core/otel-bridge', () => ({ getActiveTraceContext: () => null }));
vi.mock('../replay/recorder', () => ({
  isReplayActive: () => false,
  hasReplayFlushed: () => false,
}));

type Ev = Record<string, any>;
/** The queue as the transport keeps it: upserts replace in place. */
let queue: Ev[] = [];
const keys = new Map<string, number>();
vi.mock('../core/transport', () => ({
  enqueue: (_k: string, item: Ev) => {
    queue.push(item);
  },
  upsert: (_k: string, key: string, item: Ev, merge?: (a: Ev, b: Ev) => Ev) => {
    const i = keys.get(key);
    if (i === undefined) {
      keys.set(key, queue.length);
      queue.push(item);
    } else {
      queue[i] = merge ? merge(queue[i], item) : item;
    }
  },
  flushAll: () => {},
  isServerRateLimited: () => false,
}));

let faro: typeof import('./faro');

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  queue = [];
  keys.clear();
  started = false;
  window.history.replaceState(null, '', '/home');
  if (!(performance as any).addEventListener) {
    (performance as any).addEventListener = () => {};
    (performance as any).removeEventListener = () => {};
  }
  faro = await import('./faro');
  faro.initEvents();
});

afterEach(() => {
  faro.destroyEvents();
  vi.useRealTimers();
});

describe('events sent', () => {
  it('gives every event its own id and the tab and view it happened in', () => {
    faro.trackCustomEvent('a');
    faro.trackCustomEvent('b');
    const custom = queue.filter((e) => e.event_type === 'custom');
    expect(custom).toHaveLength(2);
    expect(custom[0].event_id).not.toBe(custom[1].event_id);
    expect(custom[0].tab_id).toBeTruthy();
    const viewId = queue.find((e) => e.event_type === 'view')!.view_id;
    expect(custom[0].view_id).toBe(viewId);
  });

  it('flags the first event of the session, and only that one', () => {
    faro.trackCustomEvent('a');
    const flagged = queue.filter((e) => e.session_is_new === 1);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].event_type).toBe('view');
  });

  it('collapses a view to one queued row that keeps its first-update flags', async () => {
    const viewRows = () => queue.filter((e) => e.event_type === 'view' || e.event_type === 'page_load');
    expect(viewRows()).toHaveLength(1);
    faro.trackCustomEvent('a');
    await vi.advanceTimersByTimeAsync(15_000);
    const rows = viewRows();
    expect(rows).toHaveLength(1);
    expect(rows[0].view_update_seq).toBeGreaterThan(1);
    expect(rows[0].view_is_new).toBe(1);
    expect(rows[0].session_is_new).toBe(1);
  });

  it('adds browser and OS versions parsed from the user agent', () => {
    faro.trackCustomEvent('a');
    const e = queue.find((x) => x.event_type === 'custom')!;
    expect(e).toHaveProperty('browser_version');
    expect(e).toHaveProperty('os_version');
  });
});

describe('user agent parsing', () => {
  const iphone =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
  const android =
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36';
  const edge =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.67';
  const mac =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  const crios =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1';

  it('names iOS, not macOS, for an iPhone', () => {
    expect(faro.getOSName(iphone)).toBe('iOS');
    expect(faro.getOSVersion(iphone)).toBe('17.4');
    expect(faro.getBrowserName(iphone)).toBe('Safari');
    expect(faro.getBrowserVersion(iphone)).toBe('17.4');
    expect(faro.getDeviceType(iphone)).toBe('mobile');
  });

  it('names Android, not Linux', () => {
    expect(faro.getOSName(android)).toBe('Android');
    expect(faro.getOSVersion(android)).toBe('14');
    expect(faro.getBrowserName(android)).toBe('Chrome');
  });

  it('tells Edge and Chrome on iOS from Chrome and Safari', () => {
    expect(faro.getBrowserName(edge)).toBe('Edge');
    expect(faro.getBrowserVersion(edge)).toBe('124.0.2478.67');
    expect(faro.getBrowserName(crios)).toBe('Chrome');
    expect(faro.getOSName(mac)).toBe('macOS');
    expect(faro.getOSVersion(mac)).toBe('10.15.7');
  });
});

describe('resource types', () => {
  it('maps initiators and extensions to Datadog types', () => {
    expect(faro.resourceType('link', 'https://a/x.css')).toBe('css');
    expect(faro.resourceType('script', 'https://a/x')).toBe('js');
    expect(faro.resourceType('img', 'https://a/p')).toBe('image');
    expect(faro.resourceType('css', 'https://a/f.woff2')).toBe('font');
    expect(faro.resourceType('xmlhttprequest', 'https://a/api')).toBe('xhr');
    expect(faro.resourceType('other', 'https://a/api')).toBe('other');
  });
});
