import type { OodleRumConfig } from './config';

type TracingInit = (config: OodleRumConfig) => Promise<void>;

// The tracing code lives in its own entry, `@oodle-ai/rum/tracing`, which
// registers itself here when the app imports it. The main entry must not
// name the OpenTelemetry packages: a bundler resolves every import it can
// see, even a lazy one, so an app without those optional packages failed
// to build whether or not it turned tracing on.
let tracingInit: TracingInit | undefined;

export function setTracingInit(init: TracingInit): void {
  tracingInit = init;
}

export function getTracingInit(): TracingInit | undefined {
  return tracingInit;
}
