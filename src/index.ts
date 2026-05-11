import {
  type OodleRumConfig,
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
  trackPageView,
  trackAction,
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

const NativeMutationObserver =
  typeof MutationObserver !== 'undefined'
    ? MutationObserver
    : null;

let initialized = false;
let teardownNavigation: (() => void) | null =
  null;
let teardownClickTracking: (() => void) | null =
  null;

let pendingActivityObserver:
  MutationObserver
  | null = null;
let pendingActivityTimer:
  ReturnType<typeof setTimeout>
  | null = null;

export const OodleRum = {
  init(config: OodleRumConfig) {
    if (initialized) return;
    setConfig(config);
    initTags(config.tags);
    setSampleRates(
      config.sessionSampleRate ?? 100,
      config.replaySampleRate ?? 100,
    );
    initialized = true;

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

    teardownNavigation =
      setupNavigationTracking();
    teardownClickTracking =
      setupClickTracking();

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
    trackCustomEvent(name, properties);
  },

  addFeatureFlag(name: string, value: string) {
    addFeatureFlag(name, value);
  },

  getSessionId(): string {
    return getSessionId();
  },

  getUserId(): string {
    return getUserId();
  },

  flush() {
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
    if (teardownNavigation) {
      teardownNavigation();
      teardownNavigation = null;
    }
    if (teardownClickTracking) {
      teardownClickTracking();
      teardownClickTracking = null;
    }
    cleanupPendingActivity();
    initialized = false;
  },
};

function setupNavigationTracking():
  (() => void) | null {
  if (typeof window === 'undefined') return null;

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    trackPageView();
  };

  const originalReplaceState =
    history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    trackPageView();
  };

  const onPopState = () => trackPageView();
  window.addEventListener(
    'popstate',
    onPopState,
  );

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener(
      'popstate',
      onPopState,
    );
  };
}

function cleanupPendingActivity() {
  if (pendingActivityObserver) {
    pendingActivityObserver.disconnect();
    pendingActivityObserver = null;
  }
  if (pendingActivityTimer) {
    clearTimeout(pendingActivityTimer);
    pendingActivityTimer = null;
  }
}

function setupClickTracking():
  (() => void) | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const RAGE_THRESHOLD = 3;
  const RAGE_WINDOW_MS = 1000;
  const DEAD_CLICK_WAIT_MS = 1000;

  let recentClicks: {
    selector: string;
    time: number;
  }[] = [];

  const onClick = (e: Event) => {
    const target = (
      e as MouseEvent
    ).target as HTMLElement;
    if (!target) return;

    const selector = getSelector(target);
    const text = (
      target.textContent ?? ''
    )
      .trim()
      .slice(0, 200);
    const tagName =
      target.tagName?.toLowerCase() ?? '';
    const targetName = getTargetName(
      target,
      tagName,
      text,
    );
    const now = Date.now();
    const clickX = (e as MouseEvent).clientX;
    const clickY = (e as MouseEvent).clientY;

    recentClicks.push({ selector, time: now });
    recentClicks = recentClicks.filter(
      (c) => now - c.time < RAGE_WINDOW_MS,
    );

    const sameTarget = recentClicks.filter(
      (c) => c.selector === selector,
    );
    if (sameTarget.length >= RAGE_THRESHOLD) {
      trackAction(
        'rage_click',
        targetName,
        selector,
        text,
        true,
        clickX,
        clickY,
      );
      recentClicks = [];
      return;
    }

    detectDeadClick(
      target,
      targetName,
      selector,
      text,
      clickX,
      clickY,
    );
  };

  document.addEventListener('click', onClick, {
    capture: true,
    passive: true,
  });

  function detectDeadClick(
    target: HTMLElement,
    targetName: string,
    selector: string,
    text: string,
    clickX: number,
    clickY: number,
  ) {
    const tag =
      target.tagName?.toLowerCase() ?? '';
    const isInteractive =
      tag === 'a' ||
      tag === 'button' ||
      tag === 'input' ||
      tag === 'select' ||
      tag === 'textarea' ||
      target.hasAttribute('onclick') ||
      target.getAttribute('role') ===
        'button' ||
      target.closest('a, button') !== null;

    if (!isInteractive) {
      trackAction(
        'click',
        targetName,
        selector,
        text,
        false,
        clickX,
        clickY,
      );
      return;
    }

    cleanupPendingActivity();

    if (!NativeMutationObserver) return;
    pendingActivityObserver =
      new NativeMutationObserver(() => {
        cleanupPendingActivity();
        trackAction(
          'click',
          targetName,
          selector,
          text,
          false,
          clickX,
          clickY,
        );
      });

    pendingActivityObserver.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      },
    );

    pendingActivityTimer = setTimeout(() => {
      cleanupPendingActivity();
      trackAction(
        'dead_click',
        targetName,
        selector,
        text,
        false,
        clickX,
        clickY,
      );
    }, DEAD_CLICK_WAIT_MS);
  }

  return () => {
    document.removeEventListener(
      'click',
      onClick,
      { capture: true } as EventListenerOptions,
    );
    cleanupPendingActivity();
  };
}

function getTargetName(
  el: HTMLElement,
  tagName: string,
  text: string,
): string {
  const ariaLabel =
    el.getAttribute('aria-label');
  if (ariaLabel) {
    return `${tagName}[${ariaLabel}]`;
  }
  const title = el.getAttribute('title');
  if (title) return `${tagName}[${title}]`;
  const shortText = text.split('\n')[0].trim();
  if (shortText && shortText.length <= 80) {
    return `${tagName}[${shortText}]`;
  }
  if (el.id) return `${tagName}#${el.id}`;
  const classes = Array.from(
    el.classList ?? [],
  )
    .slice(0, 3)
    .join('.');
  if (classes) return `${tagName}.${classes}`;
  return tagName;
}

function getSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const tag =
    el.tagName?.toLowerCase() ?? '';
  const classes = Array.from(
    el.classList ?? [],
  )
    .slice(0, 3)
    .join('.');
  return classes ? `${tag}.${classes}` : tag;
}

export type {
  OodleRumConfig,
  OtelConfig,
  UserInfo,
};
