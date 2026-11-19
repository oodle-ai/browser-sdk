/**
 * Click actions.
 *
 * A click is an action that lasts until the page stops doing
 * work because of it (see core/activity). The event is sent
 * when the action ends, with its loading time, how many errors,
 * resources and long tasks happened during it, and its
 * frustration types. Events that happen during the action carry
 * its `action_id`, which links an error to the click that
 * caused it.
 *
 * Frustrations:
 * - rage: RAGE_CLICKS or more clicks on one element within
 *   RAGE_WINDOW_MS. They are sent as one action.
 * - dead: a click on an element that is not a form field, after
 *   which the page did nothing.
 * - error: a JS error happened during the action.
 */

import { waitForIdle } from '../core/activity';
import { generateId } from '../core/session';
import { isActionTextMasked } from '../core/privacy';
import { currentViewId, currentViewPath } from './view';

export const RAGE_CLICKS = 3;
export const RAGE_WINDOW_MS = 1000;

export type EmitAction = (data: Record<string, unknown>) => void;

interface ClickAction {
  id: string;
  startMs: number;
  viewId: string;
  viewPath: string;
  target: string;
  selector: string;
  text: string;
  x: number;
  y: number;
  deadCandidate: boolean;
  errorCount: number;
  resourceCount: number;
  longTaskCount: number;
  loadingTimeMs: number;
  hadActivity: boolean;
  done: boolean;
}

interface Chain {
  selector: string;
  clicks: ClickAction[];
  timer: ReturnType<typeof setTimeout> | null;
}

let emit: EmitAction | null = null;
let chain: Chain | null = null;
const inFlight: ClickAction[] = [];
const cancels: Array<() => void> = [];
let teardown: (() => void) | null = null;

/** The most recent action still in progress, for linking events. */
export function currentActionId(): string {
  for (let i = inFlight.length - 1; i >= 0; i--) {
    if (!inFlight[i].done) return inFlight[i].id;
  }
  return '';
}

/** Counts an event against every action in progress. */
export function countInAction(data: Record<string, unknown>) {
  for (const a of inFlight) {
    if (a.done) continue;
    switch (data.event_type) {
      case 'error':
        a.errorCount++;
        break;
      case 'console':
        if (data.console_level === 'error') a.errorCount++;
        break;
      case 'resource':
        a.resourceCount++;
        break;
      case 'long_task':
        a.longTaskCount++;
        break;
    }
  }
}

function frustrations(a: ClickAction, rage: boolean): string[] {
  const f: string[] = [];
  if (rage) f.push('rage_click');
  if (a.deadCandidate && !a.hadActivity) f.push('dead_click');
  if (a.errorCount > 0) f.push('error_click');
  return f;
}

function send(a: ClickAction, rage: boolean, count = 1) {
  if (!emit) return;
  const f = frustrations(a, rage);
  const type = rage
    ? 'rage_click'
    : f.includes('dead_click')
      ? 'dead_click'
      : f.includes('error_click')
        ? 'error_click'
        : 'click';
  const data: Record<string, unknown> = {
    event_type: 'action',
    timestamp: new Date(a.startMs).toISOString(),
    action_id: a.id,
    action_type: type,
    action_target: a.target,
    action_selector: a.selector,
    action_text: a.text,
    action_name: a.target,
    action_frustration_types: f.join(','),
    is_frustration: f.length > 0 ? 1 : 0,
    action_loading_time_ms: Math.round(a.loadingTimeMs),
    action_error_count: a.errorCount,
    action_resource_count: a.resourceCount,
    action_long_task_count: a.longTaskCount,
    action_click_count: count,
    view_id: a.viewId,
    view_url_path: a.viewPath,
    click_x: a.x,
    click_y: a.y,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
  };
  emit(data);
}

function closeChain() {
  const c = chain;
  chain = null;
  if (!c) return;
  if (c.timer) clearTimeout(c.timer);
  const finished = () => c.clicks.every((a) => a.done);
  const flush = () => {
    if (c.clicks.length >= RAGE_CLICKS) {
      // One action for the burst. Counts
      // are summed; the time is the first click's.
      const first = c.clicks[0];
      for (const a of c.clicks.slice(1)) {
        first.errorCount += a.errorCount;
        first.resourceCount += a.resourceCount;
        first.longTaskCount += a.longTaskCount;
        first.hadActivity = first.hadActivity || a.hadActivity;
      }
      send(first, true, c.clicks.length);
    } else {
      for (const a of c.clicks) send(a, false);
    }
    for (const a of c.clicks) {
      const i = inFlight.indexOf(a);
      if (i >= 0) inFlight.splice(i, 1);
    }
  };
  if (finished()) {
    flush();
    return;
  }
  const poll = setInterval(() => {
    if (finished()) {
      clearInterval(poll);
      flush();
    }
  }, 50);
  cancels.push(() => clearInterval(poll));
}

function isFormField(el: HTMLElement): boolean {
  const tag = el.tagName?.toLowerCase() ?? '';
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'label') {
    return true;
  }
  if (el.isContentEditable) return true;
  return typeof el.closest === 'function' && el.closest('label') !== null;
}

function hasSelection(): boolean {
  try {
    const s = window.getSelection?.();
    return !!s && !s.isCollapsed && s.toString().length > 0;
  } catch {
    return false;
  }
}

export function onClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  if (!target || typeof target.tagName !== 'string') return;
  const selector = getSelector(target);
  const tagName = target.tagName.toLowerCase();
  const chosenName = getChosenActionName(target);
  const masked = chosenName === null && isActionTextMasked(target);
  const text =
    chosenName ?? (masked ? '' : (target.textContent ?? '').trim().slice(0, 200));
  const targetName =
    chosenName !== null
      ? `${tagName}[${chosenName}]`
      : getTargetName(target, tagName, text, masked);

  const a: ClickAction = {
    id: generateId(),
    startMs: Date.now(),
    viewId: currentViewId(),
    viewPath: currentViewPath(),
    target: targetName,
    selector,
    text,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !isFormField(target) && !hasSelection(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: false,
    done: false,
  };
  inFlight.push(a);
  cancels.push(
    waitForIdle(a.startMs, (r) => {
      a.hadActivity = r.hadActivity;
      a.loadingTimeMs =
        r.endMs !== null && !r.timedOut ? Math.max(0, r.endMs - a.startMs) : 0;
      a.done = true;
    }),
  );

  if (chain && chain.selector === selector) {
    chain.clicks.push(a);
  } else {
    closeChain();
    chain = { selector, clicks: [a], timer: null };
  }
  const c = chain!;
  if (c.timer) clearTimeout(c.timer);
  c.timer = setTimeout(() => {
    if (chain === c) closeChain();
  }, RAGE_WINDOW_MS);
}

export function initActions(emitAction: EmitAction) {
  if (typeof document === 'undefined') return;
  destroyActions();
  emit = emitAction;
  const handler = (e: Event) => onClick(e as MouseEvent);
  document.addEventListener('click', handler, { capture: true, passive: true });
  teardown = () =>
    document.removeEventListener('click', handler, {
      capture: true,
    } as EventListenerOptions);
}

export function destroyActions() {
  if (chain) closeChain();
  for (const c of cancels.splice(0)) c();
  inFlight.splice(0);
  if (teardown) teardown();
  teardown = null;
  emit = null;
}

const ACTION_NAME_ATTR = 'data-oodle-action-name';

function getChosenActionName(el: HTMLElement): string | null {
  try {
    const named =
      typeof el.closest === 'function' ? el.closest(`[${ACTION_NAME_ATTR}]`) : null;
    const v = named?.getAttribute(ACTION_NAME_ATTR)?.trim();
    return v ? v.slice(0, 200) : null;
  } catch {
    return null;
  }
}

function getTargetName(
  el: HTMLElement,
  tagName: string,
  text: string,
  masked = false,
): string {
  // aria-label and title are text a user reads, and often
  // hold the same data as the element's content.
  if (masked) return getIdOrClassName(el, tagName);
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return `${tagName}[${ariaLabel}]`;
  const title = el.getAttribute('title');
  if (title) return `${tagName}[${title}]`;
  const shortText = text.split('\n')[0].trim();
  if (shortText && shortText.length <= 80) return `${tagName}[${shortText}]`;
  return getIdOrClassName(el, tagName);
}

function getIdOrClassName(el: HTMLElement, tagName: string): string {
  if (el.id) return `${tagName}#${el.id}`;
  const classes = Array.from(el.classList ?? []).slice(0, 3).join('.');
  if (classes) return `${tagName}.${classes}`;
  return tagName;
}

function getSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const tag = el.tagName?.toLowerCase() ?? '';
  const classes = Array.from(el.classList ?? []).slice(0, 3).join('.');
  return classes ? `${tag}.${classes}` : tag;
}
