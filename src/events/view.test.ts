import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The view lifecycle: which URL changes start a view, the
 * updates a view sends, and the counts it carries.
 */

let sessionId = 'session-1';
let renew: ((prev: string, next: string) => void) | null = null;

vi.mock('web-vitals', () => ({
  onLCP: () => {},
  onFCP: () => {},
  onTTFB: () => {},
  onFID: () => {},
}));

vi.mock('../core/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../core/session')>()),
  getSessionId: () => sessionId,
  onSessionRenewed: (cb: any) => {
    renew = cb;
    return () => {
      renew = null;
    };
  },
}));

type Ev = Record<string, any>;
let sent: Array<{ data: Ev; sid: string }> = [];
let view: typeof import('./view');

const updates = (id?: string) =>
  sent.filter((e) => !id || e.data.view_id === id).map((e) => e.data);

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  sessionId = 'session-1';
  sent = [];
  window.history.replaceState(null, '', '/start');
  view = await import('./view');
  view.initViews((data, sid) => sent.push({ data, sid }), (loc) => loc.href);
});

afterEach(() => {
  view.destroyViews();
  vi.useRealTimers();
});

describe('views', () => {
  it('sends the first view at once, as the page load', () => {
    expect(updates()).toHaveLength(1);
    expect(updates()[0]).toMatchObject({
      view_loading_type: 'initial_load',
      view_update_seq: 1,
      view_is_active: 1,
      view_url_path: '/start',
    });
  });

  it('starts a view only when the path changes', () => {
    const first = updates()[0].view_id;
    window.history.replaceState({ scroll: 1 }, '', '/start?tab=2');
    window.history.pushState(null, '', '/start#anchor');
    expect(updates().filter((u) => u.view_id !== first)).toHaveLength(0);

    window.history.pushState(null, '', '/next');
    const ended = updates(first).at(-1)!;
    expect(ended.view_is_active).toBe(0);
    const next = updates().filter((u) => u.view_id !== first);
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({
      view_loading_type: 'route_change',
      view_url_path: '/next',
      view_update_seq: 1,
    });
  });

  it('treats a hash route as a path', () => {
    const first = updates()[0].view_id;
    window.history.pushState(null, '', '/start#/settings');
    expect(updates().some((u) => u.view_id !== first)).toBe(true);
  });

  it('counts events in the view and sends at most one update per throttle period', async () => {
    const id = view.currentViewId();
    const before = updates(id).length;
    view.countInView({ event_type: 'action', is_frustration: 1 });
    view.countInView({ event_type: 'error' });
    view.countInView({ event_type: 'console', console_level: 'error' });
    view.countInView({ event_type: 'console', console_level: 'warn' });
    view.countInView({ event_type: 'resource' });
    view.countInView({ event_type: 'long_task' });
    await vi.advanceTimersByTimeAsync(view.UPDATE_THROTTLE_MS - 1);
    const mid = updates(id).length;
    await vi.advanceTimersByTimeAsync(view.UPDATE_THROTTLE_MS + 11_000);
    const last = updates(id).at(-1)!;
    expect(last).toMatchObject({
      view_action_count: 1,
      view_frustration_count: 1,
      view_error_count: 2,
      view_resource_count: 1,
      view_long_task_count: 1,
    });
    // Six events, one update for them (plus the loading time).
    expect(updates(id).length - before).toBeLessThanOrEqual(2);
    expect(mid).toBeGreaterThanOrEqual(before);
    // Updates only ever go up.
    const seqs = updates(id).map((u) => u.view_update_seq);
    expect([...seqs].sort((a, b) => a - b)).toEqual(seqs);
  });

  it('measures a route change loading time from page activity', async () => {
    window.history.pushState(null, '', '/slow');
    const id = view.currentViewId();
    await vi.advanceTimersByTimeAsync(40);
    document.body.appendChild(document.createElement('div'));
    await vi.advanceTimersByTimeAsync(500);
    const last = updates(id).at(-1)!;
    expect(last.view_loading_time_ms).toBeGreaterThanOrEqual(40);
    expect(last.view_loading_time_ms).toBeLessThan(500);
  });

  it('ends the view in its own session and starts one in the next', () => {
    const first = view.currentViewId();
    sessionId = 'session-2';
    renew!('session-1', 'session-2');
    const end = sent.filter((e) => e.data.view_id === first).at(-1)!;
    expect(end.data.view_is_active).toBe(0);
    expect(end.sid).toBe('session-1');
    const next = sent.filter((e) => e.data.view_id !== first);
    expect(next[0].sid).toBe('session-2');
    expect(next[0].data.view_update_seq).toBe(1);
  });

  it('ends the view when the page is left', () => {
    const id = view.currentViewId();
    window.dispatchEvent(new Event('pagehide'));
    expect(updates(id).at(-1)!.view_is_active).toBe(0);
    expect(view.currentViewId()).toBe('');
  });

  it('starts no view for events sent while the page is left', () => {
    window.dispatchEvent(new Event('pagehide'));
    view.ensureView();
    expect(view.currentViewId()).toBe('');
  });

  it('starts a bf_cache view when the page comes back from the cache', () => {
    window.dispatchEvent(new Event('pagehide'));
    const show = new Event('pageshow') as PageTransitionEvent;
    Object.defineProperty(show, 'persisted', { value: true });
    window.dispatchEvent(show);
    const id = view.currentViewId();
    expect(id).not.toBe('');
    expect(updates(id)[0].view_loading_type).toBe('bf_cache');
  });
});
