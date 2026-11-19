import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Click actions: names, masking, and the action model
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

  it('does not call a checkbox that toggled dead', async () => {
    await load();
    document.body.innerHTML = '<input id="c" type="checkbox" />';
    clickOn('c');
    await settle();
    expect(sent[0]).toMatchObject({ action_type: 'click', is_frustration: 0 });
  });

  it('calls a button that changed nothing dead', async () => {
    await load();
    document.body.innerHTML = '<input id="b" type="button" value="Apply" />';
    clickOn('b');
    await settle();
    expect(sent[0]).toMatchObject({ action_type: 'dead_click', action_target: 'input[Apply]' });
  });

  it('does not call clicks with scrolling a rage', async () => {
    await load();
    document.body.innerHTML = '<div id="d">Report</div>';
    clickOn('d');
    document.dispatchEvent(new Event('scroll'));
    clickOn('d');
    clickOn('d');
    await settle();
    expect(sent.some((e) => e.action_type === 'rage_click')).toBe(false);
  });

  it('names an icon after its labelled parent', async () => {
    await load();
    document.body.innerHTML = '<div aria-label="Close panel"><svg><path id="p"></path></svg></div>';
    clickOn('p');
    await settle();
    expect(sent[0].action_target).toBe('div[Close panel]');
  });

  it('read no text from parents when the click is in a masked part', async () => {
    await load();
    document.body.innerHTML =
      '<button aria-label="Pay now">Pay <span data-oodle-privacy="mask"><i id="m">4111 1111</i></span></button>';
    clickOn('m');
    await settle();
    expect(sent[0].action_target).toBe('i#m');
    expect(sent[0].action_text).toBe('');
    expect(JSON.stringify(sent[0])).not.toContain('Pay');
  });

  it('cut masked children, typed text and editable text out of a parent name', async () => {
    await load();
    document.body.innerHTML =
      '<div id="d"><span class="oodle-privacy-mask">Jane Doe</span>' +
      '<textarea>secret draft</textarea><div contenteditable>typed note</div>' +
      '<select><option>Gold plan</option></select>Card summary</div>';
    clickOn('d');
    await settle();
    const all = JSON.stringify(sent[0]);
    expect(sent[0].action_target).toBe('div[Card summary]');
    for (const secret of ['Jane Doe', 'secret draft', 'typed note', 'Gold plan']) {
      expect(all).not.toContain(secret);
    }
  });

  it('skip a masked label and a masked aria-labelledby source', async () => {
    await load();
    document.body.innerHTML =
      '<label for="e" class="oodle-privacy-mask">jane@example.com</label>' +
      '<span id="n" data-oodle-privacy="hidden">Jane</span>' +
      '<input id="e" type="checkbox" aria-labelledby="n" title="Subscribe" />';
    clickOn('e');
    await settle();
    expect(sent[0].action_target).toBe('input[Subscribe]');
  });

  it('send no name from parents with actionText mask', async () => {
    await load({ actionText: 'mask' });
    document.body.innerHTML = '<button aria-label="Delete user Jane"><svg id="i"></svg></button>';
    clickOn('i');
    await settle();
    expect(JSON.stringify(sent[0])).not.toContain('Jane');
  });

  it('calls a click dead when only a request from before it ends', async () => {
    await load();
    const activity = await import('./core/activity');
    const poll = activity.requestStarted();
    document.body.innerHTML = '<div id="d">Report</div>';
    clickOn('d');
    await vi.advanceTimersByTimeAsync(20);
    activity.requestEnded(poll);
    await settle();
    expect(sent[0]).toMatchObject({ action_type: 'dead_click', is_frustration: 1 });
  });

  it('does not call a click dead when it starts a request', async () => {
    await load();
    const activity = await import('./core/activity');
    document.body.innerHTML = '<div id="d">Report</div>';
    clickOn('d');
    await vi.advanceTimersByTimeAsync(20);
    const r = activity.requestStarted();
    await vi.advanceTimersByTimeAsync(500);
    activity.requestEnded(r);
    await settle();
    expect(sent[0]).toMatchObject({ action_type: 'click', is_frustration: 0 });
    expect(sent[0].action_loading_time_ms).toBeGreaterThanOrEqual(500);
  });

  it('send a click still in progress when the page goes away', async () => {
    await load();
    const activity = await import('./core/activity');
    document.body.innerHTML = '<a id="l" href="/next">Home</a>';
    clickOn('l');
    await vi.advanceTimersByTimeAsync(20);
    activity.requestStarted();
    await vi.advanceTimersByTimeAsync(3000);
    expect(sent).toHaveLength(0);
    action.sendPendingOnExit();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ action_type: 'click', action_target: 'a[Home]', is_frustration: 0 });
    expect(sent[0].action_loading_time_ms).toBeGreaterThanOrEqual(3000);
  });

  it('does not call a click on a link dead', async () => {
    await load();
    document.body.innerHTML = '<a id="l" href="/next"><span id="t">Next</span></a>';
    clickOn('t');
    await settle();
    expect(sent[0]).toMatchObject({ action_type: 'click', is_frustration: 0 });
  });

  it('does not call a click dead when the user scrolls after it', async () => {
    await load();
    document.body.innerHTML = '<div id="d">Report</div>';
    clickOn('d');
    await vi.advanceTimersByTimeAsync(20);
    document.dispatchEvent(new Event('scroll'));
    await settle();
    expect(sent[0]).toMatchObject({ action_type: 'click', is_frustration: 0 });
  });

  it('names a click inside a button after the button', async () => {
    await load();
    document.body.innerHTML = '<button><svg></svg><span id="icon"></span>Create API Key</button>';
    clickOn('icon');
    await settle();
    expect(sent[0].action_target).toBe('button[Create API Key]');
  });

  it('names a large container by its first words, not its classes', async () => {
    await load();
    document.body.innerHTML =
      '<div id="card" class="mt-4 p-4">Create API Key ' + 'store this key somewhere safe '.repeat(5) + '</div>';
    clickOn('card');
    await settle();
    expect(sent[0].action_target).toMatch(/^div\[Create API Key store/);
    expect(sent[0].action_target).toContain('…');
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
