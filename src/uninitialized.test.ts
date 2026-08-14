import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

async function loadSdk() {
  vi.resetModules();
  return (await import('./index')).OodleRum;
}

// Apps gate init() on environment (production only) but
// call the rest of the API from shared code. Every public
// method has to survive that.
describe('public API without init', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('does not throw from any method', async () => {
    const OodleRum = await loadSdk();

    expect(() => {
      OodleRum.identify({
        id: 'user-123',
        email: 'jane@example.com',
      });
      OodleRum.setTags({ team: 'checkout' });
      OodleRum.addFeatureFlag('new_nav', 'on');
      OodleRum.trackEvent('checkout', {
        total: 99.99,
      });
      OodleRum.flush();
      OodleRum.stop();
    }).not.toThrow();
  });

  it('reports an empty session id', async () => {
    const OodleRum = await loadSdk();

    expect(OodleRum.getSessionId()).toBe('');
    // Minting a session would also persist it.
    expect(
      sessionStorage.getItem('__oodle_session'),
    ).toBeNull();
  });

  it('still answers for identity', async () => {
    const OodleRum = await loadSdk();
    OodleRum.identify({ id: 'user-123' });

    expect(OodleRum.getUserId()).toBe(
      'user-123',
    );
  });

  it('keeps tags set before a later init', async () => {
    const OodleRum = await loadSdk();
    const { getTags } = await import(
      './core/tags'
    );

    OodleRum.setTags({
      team: 'checkout',
      tier: 'free',
    });
    OodleRum.init({
      instanceId: 'i',
      apiKey: 'k',
      endpoint: 'https://collector.oodle.ai',
      service: 'my-app',
      tags: { app: 'web', tier: 'unknown' },
    });

    expect(getTags()).toEqual({
      app: 'web',
      team: 'checkout',
      tier: 'free',
    });
    OodleRum.stop();
  });

  it('stays uninitialized on a bad endpoint', async () => {
    const OodleRum = await loadSdk();
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    OodleRum.init({
      instanceId: 'i',
      apiKey: 'k',
      endpoint: 'https://evil.example.com',
      service: 'my-app',
    });
    error.mockRestore();

    // init() bailed, so the rest of the API must
    // behave as it does before any init() at all.
    expect(() =>
      OodleRum.trackEvent('checkout'),
    ).not.toThrow();
    expect(OodleRum.getSessionId()).toBe('');
  });
});
