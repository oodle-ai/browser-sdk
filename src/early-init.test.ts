import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

// A tag in <head> that runs before <html> is parsed, or a
// script injected before any markup (as automation tools
// do), finds no documentElement.
describe('init before the document has a root element', () => {
  let root: HTMLElement | null = null;

  afterEach(async () => {
    const { OodleRum } = await import('./index');
    OodleRum.stop();
    if (root && !document.documentElement) {
      document.appendChild(root);
    }
  });

  it('does not throw', async () => {
    vi.resetModules();
    sessionStorage.clear();
    const { OodleRum } = await import('./index');
    root = document.documentElement;
    document.removeChild(root);
    expect(document.documentElement).toBeNull();

    let err: unknown = null;
    try {
      OodleRum.init({
        instanceId: 'test',
        apiKey: 'test',
        endpoint: 'http://localhost:1',
        service: 'test',
        sessionReplay: false,
      } as any);
    } catch (e) {
      err = e;
    }
    expect((err as Error | null)?.stack ?? null).toBeNull();
  });
});
