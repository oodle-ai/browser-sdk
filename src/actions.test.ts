import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Click names: element text, masking, and the
 * data-oodle-action-name attribute an app sets to choose one.
 */

const actions: { target: string; text: string }[] = [];

vi.mock('./events/faro', () => ({
  initEvents: () => {},
  initVisibilityTracking: () => {},
  trackPageView: () => {},
  trackCustomEvent: () => {},
  destroyEvents: () => {},
  trackAction: (
    _type: string,
    target: string,
    _selector: string,
    text: string,
  ) => {
    actions.push({ target, text });
  },
}));

vi.mock('./core/transport', () => ({
  flushAll: () => {},
  initTransportListeners: () => {},
  destroyTransportListeners: () => {},
  setReinitCallback: () => {},
}));

vi.mock('./core/telemetry', () => ({
  initTelemetry: () => {},
  destroyTelemetry: () => {},
}));

vi.mock('./replay/recorder', () => ({
  initReplay: () => {},
  stopReplay: () => {},
}));

const base = {
  instanceId: 'inst',
  apiKey: 'key',
  endpoint: 'https://localhost',
  service: 'test',
  sessionReplay: false,
};

async function start(extra: Record<string, unknown> = {}) {
  vi.resetModules();
  const { OodleRum } = await import('./index');
  OodleRum.init({ ...base, ...extra } as any);
  return OodleRum;
}

function click(html: string, id: string) {
  document.body.innerHTML = html;
  document
    .getElementById(id)!
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return actions[actions.length - 1];
}

describe('click names', () => {
  let sdk: Awaited<ReturnType<typeof start>>;

  beforeEach(() => {
    actions.length = 0;
  });

  afterEach(() => {
    sdk?.stop();
    document.body.innerHTML = '';
  });

  it('use the element text by default', async () => {
    sdk = await start();
    expect(click('<span id="s">Delete table salaries</span>', 's')).toEqual({
      target: 'span[Delete table salaries]',
      text: 'Delete table salaries',
    });
  });

  it("send no text with actionText 'mask'", async () => {
    sdk = await start({ actionText: 'mask' });
    expect(click('<span id="s">Delete table salaries</span>', 's')).toEqual({
      target: 'span#s',
      text: '',
    });
  });

  it('use data-oodle-action-name over the text, even when masked', async () => {
    sdk = await start({ actionText: 'mask' });
    expect(
      click(
        '<div data-oodle-action-name="Delete table">' +
          '<span id="s">Delete table salaries</span></div>',
        's',
      ),
    ).toEqual({ target: 'span[Delete table]', text: 'Delete table' });
  });

  it('ignore an empty data-oodle-action-name', async () => {
    sdk = await start();
    expect(
      click('<span id="s" data-oodle-action-name="  ">Open</span>', 's'),
    ).toEqual({ target: 'span[Open]', text: 'Open' });
  });
});
