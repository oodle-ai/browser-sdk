// Browser tracing for @oodle-ai/rum. Import this entry once, before
// OodleRum.init(), and set `openTelemetry: true`:
//
//   import '@oodle-ai/rum/tracing';
//   import { OodleRum } from '@oodle-ai/rum';
//
// It needs the OpenTelemetry peer packages. Apps that do not import it do
// not need them.
import { setTracingInit } from './core/tracing-loader';
import { initOtelTracing } from './otel/tracing';

setTracingInit(initOtelTracing);
