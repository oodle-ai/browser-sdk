import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Click actions: names, masking, and the Datadog action model
 * (one event when the action ends, frustration types, counts).
 */

const config: Record<string, unknown> = {
  instanceId: 'inst',
  apiKey: 'key',
  endpoint: 'https://localhost',
  service: 'test',
};

vi.mock('./core/config', () => ({ getConfig: () => config }));

type Ev = Record<string, any>;
let sent: Ev[] = [];
let action: typeof import('./events/action');
let privacy: typeof import('./core/privacy');

async function load(extra: Record<string, unknown> = {}) {
  vi.resetModules();
  for (const k of Object.keys(config)) {
    if (!['instanceId', 'apiKey', 'endpoint', 'service'].includes(k)) delete config[k];
  }
  Object.assign(config, extra);
  privacy = await import('./core/privacy');
  privacy.configurePrivacy(config as any);
  action = await import('./events/action');
  action.initActions((d) => sent.push(d));
}

function clickOn(id: string) {
  document
    .getElementById(id)!
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

/** Lets the action's idle wait and the rage window run out. */
async function settle() {
  await vi.advanceTimersByTimeAsync(11_000);
}

describe('click actions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sent = [];
  });

  afterEach(() => {
    action.destroyActions();
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('use the element text by default', async () => {
    await load();
    document.body.innerHTML = '<span id="s">Delete table salaries</span>';
    clickOn('s');
    await settle();
    expect(sent[0]).toMatchObject({
      action_target: 'span[Delete table salaries]',
      action_text: 'Delete table salaries',
    });
  });

  it("send no text with actionText 'mask'", async () => {
    await load({ actionText: 'mask' });
    document.body.innerHTML = '<span id="s">Delete table salaries</span>';
    clickOn('s');
    await settle();
    expect(sent[0]).toMatchObject({ action_target: 'span#s', action_text: '' });
  });

  it('use data-oodle-action-name over the text, even when masked', async () => {
    await load({ actionText: 'mask' });
    document.body.innerHTML =
      '<div data-oodle-action-name="Delete table">' +
      '<span id="s">Delete table salaries</span></div>';
    clickOn('s');
    await settle();
    expect(sent[0]).toMatchObject({
      action_target: 'span[Delete table]',
      action_text: 'Delete table',
    });
  });

  it('ignore an empty data-oodle-action-name', async () => {
    await load();
    document.body.innerHTML = '<span id="s" data-oodle-action-name="  ">Open</span>';
    clickOn('s');
    await settle();
    expect(sent[0]).toMatchObject({ action_target: 'span[Open]' });
  });

  it('is sent once, when the page goes idle, with its loading time', async () => {
    await load();
    document.body.innerHTML = '<button id="b">Save</button><div id="out"></div>';
    clickOn('b');
    expect(sent).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(50);
    document.getElementById('out')!.textContent = 'saved';
    await settle();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      event_type: 'action',
      action_type: 'click',
      is_frustration: 0,
    });
    expect(sent[0].action_loading_time_ms).toBeGreaterThanOrEqual(50);
    expect(typeof sent[0].action_id).toBe('string');
  });

  it('marks a click after which nothing happened as dead', async () => {
    await load();
    document.body.innerHTML = '<button id="b">Save</button>';
    clickOn('b');
    await settle();
    expect(sent[0]).toMatchObject({
      action_type: 'dead_click',
      action_frustration_types: 'dead_click',
      is_frustration: 1,
    });
  });

  it('does not call a click into a form field dead', async () => {
    await load();
    document.body.innerHTML = '<input id="i" />';
    clickOn('i');
    await settle();
    expect(sent[0]).toMatchObject({ action_type: 'click', is_frustration: 0 });
  });

  it('sends a burst of clicks on one element as one rage click', async () => {
    await load();
    document.body.innerHTML = '<button id="b">Pay</button>';
    clickOn('b');
    clickOn('b');
    clickOn('b');
    clickOn('b');
    await settle();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      action_type: 'rage_click',
      action_click_count: 4,
      is_frustration: 1,
    });
    expect(sent[0].action_frustration_types).toContain('rage_click');
  });

  it('counts errors during the action and calls it an error click', async () => {
    await load();
    document.body.innerHTML = '<button id="b">Go</button>';
    clickOn('b');
    const id = action.currentActionId();
    expect(id).not.toBe('');
    action.countInAction({ event_type: 'error' });
    document.body.appendChild(document.createElement('p'));
    await settle();
    expect(sent[0]).toMatchObject({
      action_id: id,
      action_type: 'error_click',
      action_error_count: 1,
      is_frustration: 1,
    });
    expect(action.currentActionId()).toBe('');
  });
});
