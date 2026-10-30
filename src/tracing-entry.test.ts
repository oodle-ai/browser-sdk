import { afterEach, describe, expect, it, vi } from 'vitest';

const config = {
  instanceId: 'inst-test',
  apiKey: 'key',
  endpoint: 'https://inst-test-rum.collector.oodle.ai',
  service: 'web',
  sessionReplay: false,
  openTelemetry: true,
};

describe('browser tracing entry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns when openTelemetry is on and the entry is not imported', async () => {
    vi.resetModules();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { OodleRum } = await import('./index');
    OodleRum.init(config);
    expect(
      warn.mock.calls.some((c) => String(c[0]).includes("'@oodle-ai/rum/tracing' is not imported")),
    ).toBe(true);
    OodleRum.stop();
  });

  it('runs the registered tracing init when the entry is imported', async () => {
    vi.resetModules();
    const { setTracingInit } = await import('./core/tracing-loader');
    const init = vi.fn().mockResolvedValue(undefined);
    setTracingInit(init);
    const { OodleRum } = await import('./index');
    OodleRum.init(config);
    expect(init).toHaveBeenCalledTimes(1);
    OodleRum.stop();
  });
});
