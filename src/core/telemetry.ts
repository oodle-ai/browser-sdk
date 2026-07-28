import { enqueue } from './transport';

const FLUSH_INTERVAL_MS = 60_000;
const TELEMETRY_BATCH_KEY = 'sdk_telemetry';

interface TelemetryCounters {
  events_rate_limited: number;
  events_should_send_dropped: number;
  send_failures: number;
  compression_failures: number;
  retry_drops: number;
  transport_drops: number;
  exit_send_failures: number;
  replay_events_dropped: number;
  replay_rebases: number;
  replay_overload_pauses: number;
}

const counters: TelemetryCounters = {
  events_rate_limited: 0,
  events_should_send_dropped: 0,
  send_failures: 0,
  compression_failures: 0,
  retry_drops: 0,
  transport_drops: 0,
  exit_send_failures: 0,
  replay_events_dropped: 0,
  replay_rebases: 0,
  replay_overload_pauses: 0,
};

export function incrTelemetry(
  key: keyof TelemetryCounters,
  amount = 1,
) {
  counters[key] += amount;
}

function hasData(): boolean {
  for (const key in counters) {
    if (
      counters[
        key as keyof TelemetryCounters
      ] > 0
    ) {
      return true;
    }
  }
  return false;
}

function flushTelemetry() {
  if (!hasData()) return;
  const snapshot = { ...counters };
  for (const key in counters) {
    counters[
      key as keyof TelemetryCounters
    ] = 0;
  }
  enqueue(TELEMETRY_BATCH_KEY, {
    _type: 'sdk_telemetry',
    timestamp: new Date().toISOString(),
    ...snapshot,
  });
}

let telemetryTimer: ReturnType<
  typeof setInterval
> | null = null;

let telemetryVisHandler:
  | (() => void)
  | null = null;

export function initTelemetry() {
  if (telemetryTimer) return;
  telemetryTimer = setInterval(
    flushTelemetry,
    FLUSH_INTERVAL_MS,
  );

  if (typeof document !== 'undefined') {
    telemetryVisHandler = () => {
      if (
        document.visibilityState === 'hidden'
      ) {
        flushTelemetry();
      }
    };
    document.addEventListener(
      'visibilitychange',
      telemetryVisHandler,
    );
  }
}

export function destroyTelemetry() {
  if (telemetryTimer) {
    clearInterval(telemetryTimer);
    telemetryTimer = null;
  }
  if (
    telemetryVisHandler &&
    typeof document !== 'undefined'
  ) {
    document.removeEventListener(
      'visibilitychange',
      telemetryVisHandler,
    );
    telemetryVisHandler = null;
  }
  flushTelemetry();
}
