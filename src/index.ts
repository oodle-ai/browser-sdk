import {
  type NetworkCapture,
  type OodleRumConfig,
  type RumEvent,
  type OtelConfig,
  setConfig,
  getConfig,
} from './core/config';
import {
  getSessionId,
  setSampleRates,
  isReplaySampled,
  initSessionListeners,
  destroySessionListeners,
  touchSession,
} from './core/session';
import {
  setUser,
  type UserInfo,
  getUserId,
} from './core/user';
import {
  flushAll,
  initTransportListeners,
  destroyTransportListeners,
  setReinitCallback,
} from './core/transport';
import {
  initTags,
  setTags as _setTags,
} from './core/tags';
import {
  addFeatureFlag,
  clearFeatureFlags,
} from './core/flags';
import {
  initEvents,
  initVisibilityTracking,
  trackCustomEvent,
  destroyEvents,
} from './events/faro';
import {
  initReplay,
  stopReplay,
} from './replay/recorder';
import {
  initTelemetry,
  destroyTelemetry,
} from './core/telemetry';

let initialized = false;

export const OodleRum = {
  init(config: OodleRumConfig) {
    if (initialized) return;
    if (!setConfig(config)) return;
    initTags(config.tags);
    setSampleRates(
      config.sessionSampleRate ?? 100,
      config.replaySampleRate ?? 100,
    );
    initialized = true;
    // A page load is user activity: it starts a session when
    // none is live, before anything reads the sampling decision.
    touchSession();

    // Ahead of initTransportListeners: a tab_hidden event
    // only makes it out of the page if it is queued before
    // the transport's own visibilitychange listener runs
    // the exit flush. See initVisibilityTracking.
    initVisibilityTracking();

    initTransportListeners();
    initSessionListeners();
    initTelemetry();
    setReinitCallback(() => {
      initTransportListeners();
    });

    if (
      config.sessionReplay !== false &&
      isReplaySampled()
    ) {
      initReplay();
    }

    initEvents();

    if (config.openTelemetry) {
      import('./otel/tracing').then((m) =>
        m.initOtelTracing(config),
      ).catch((e) => {
        console.warn(
          '[@oodle-ai/rum] Failed to init' +
            ' OpenTelemetry:',
          e,
        );
      });
    }
  },

  // The methods below are safe to call whether or not
  // init() ran. Apps commonly gate init() on environment
  // (production only) while calling identify/trackEvent
  // unconditionally from shared code; those calls go
  // nowhere instead of throwing.
  //
  // setTags/identify/addFeatureFlag stay live even when
  // uninitialized, so state recorded before an init() that
  // comes later still applies once it does.

  setTags(tags: Record<string, string>) {
    _setTags(tags);
  },

  identify(user: UserInfo) {
    setUser(user);
  },

  trackEvent(
    name: string,
    properties?: Record<string, unknown>,
  ) {
    if (!initialized) return;
    trackCustomEvent(name, properties);
  },

  addFeatureFlag(name: string, value: string) {
    addFeatureFlag(name, value);
  },

  getSessionId(): string {
    // Not merely a config read: this mints and persists a
    // session. An uninitialized SDK must not touch storage.
    if (!initialized) return '';
    return getSessionId();
  },

  getUserId(): string {
    return getUserId();
  },

  flush() {
    if (!initialized) return;
    flushAll();
  },

  stop() {
    if (!initialized) return;
    stopReplay();
    destroyEvents();
    destroyTelemetry();
    destroySessionListeners();
    flushAll(true);
    clearFeatureFlags();
    destroyTransportListeners();
    initialized = false;
  },
};

export type {
  NetworkCapture,
  OodleRumConfig,
  RumEvent,
  OtelConfig,
  UserInfo,
};
