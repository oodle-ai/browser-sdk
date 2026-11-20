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

import { waitForIdle, watchActivity } from '../core/activity';
import { onPageExit } from '../core/transport';
import { generateId } from '../core/session';
import { ACTION_MASK_SELECTOR, isActionTextMasked } from '../core/privacy';
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
  /** The user typed or scrolled while the click was watched. */
  userInput: boolean;
  /** Text was selected when the click came: part of a selection. */
  selected: boolean;
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

function isDead(a: ClickAction): boolean {
  return a.deadCandidate && !a.selected && !a.hadActivity && !a.userInput;
}

function frustrations(a: ClickAction, rage: boolean, anyDead = false): string[] {
  const f: string[] = [];
  if (rage) f.push('rage_click');
  // A burst is also dead when any of its clicks got no response.
  if (rage ? anyDead : isDead(a)) f.push('dead_click');
  if (a.errorCount > 0) f.push('error_click');
  return f;
}

function send(a: ClickAction, rage: boolean, count = 1, anyDead = false) {
  if (!emit) return;
  const f = frustrations(a, rage, anyDead);
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
    // Clicks that come with scrolling or a text selection are a user
    // reading or selecting (a double or triple click), not raging.
    const reading = c.clicks.some((a) => a.userInput || a.selected);
    if (c.clicks.length >= RAGE_CLICKS && !reading) {
      // One action for the burst. Counts
      // are summed; the time is the first click's.
      const first = c.clicks[0];
      const anyDead = c.clicks.some(isDead);
      for (const a of c.clicks.slice(1)) {
        first.errorCount += a.errorCount;
        first.resourceCount += a.resourceCount;
        first.longTaskCount += a.longTaskCount;
        first.hadActivity = first.hadActivity || a.hadActivity;
      }
      send(first, true, c.clicks.length, anyDead);
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
  const pending = { flush, poll: null as ReturnType<typeof setInterval> | null };
  waitingChains.add(pending);
  pending.poll = setInterval(() => {
    if (finished()) {
      clearInterval(pending.poll!);
      waitingChains.delete(pending);
      flush();
    }
  }, 50);
  cancels.push(() => {
    clearInterval(pending.poll!);
    waitingChains.delete(pending);
  });
}

/** Closed chains whose clicks still wait for the page to go idle. */
const waitingChains = new Set<{ flush: () => void; poll: ReturnType<typeof setInterval> | null }>();

/**
 * Sends every click still in progress when the page goes away. A click
 * with no response ends within 100 ms, so one still waiting got a
 * response: it is sent as a click, with its loading time up to now.
 * Without this, the click that left the page, often a link, is lost.
 */
export function sendPendingOnExit() {
  const now = Date.now();
  for (const a of inFlight) {
    if (a.done) continue;
    a.hadActivity = true;
    a.userInput = lastUserInputMs >= a.startMs;
    a.loadingTimeMs = Math.max(0, now - a.startMs);
    a.done = true;
  }
  if (chain) closeChain();
  for (const w of [...waitingChains]) {
    if (w.poll) clearInterval(w.poll);
    waitingChains.delete(w);
    w.flush();
  }
}

/** A click on a label is a click on the control it names. */
function forControl(el: HTMLElement): HTMLElement {
  if (el.tagName === 'LABEL') {
    const id = el.getAttribute('for');
    const control = id ? document.getElementById(id) : null;
    if (control) return control;
  }
  return el;
}

function hasSelection(): boolean {
  try {
    const s = window.getSelection?.();
    return !!s && !s.isCollapsed && s.toString().length > 0;
  } catch {
    return false;
  }
}

/**
 * Clicks on these are not dead when the page shows no change: a link
 * may navigate away, a canvas draws without DOM changes, and editable
 * text takes the caret.
 */
const NOT_DEAD_SELECTOR =
  // Text fields take the caret without changing the page; checkboxes,
  // radios and buttons must change something, so they stay candidates.
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]),' +
  'textarea,select,[contenteditable],[contenteditable] *,canvas,a[href],a[href] *';

/** How many parents a click's name may come from. */
const MAX_NAME_PARENTS = 10;

/** The first line of `t`, cut at 80 characters. */
function firstLine(t: string): string {
  const line = t.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  return line.length > 80 ? line.slice(0, 79) + '…' : line;
}

function attr(el: HTMLElement, name: string): string {
  return (el.getAttribute(name) ?? '').trim();
}

/** A name the element gives itself, in the order a reader would use. */
function ownName(el: HTMLElement): string {
  // Only form fields read their labels: the lookup searches the whole
  // document, and a label naming a button or a link is rare.
  const labels =
    el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'
      ? (el as HTMLInputElement).labels
      : null;
  if (labels && labels.length > 0) {
    const label = labels[0] as HTMLElement;
    if (!isActionTextMasked(label)) return firstLine(visibleText(label));
  }
  if (el.tagName === 'INPUT') {
    const type = attr(el, 'type');
    if (type === 'button' || type === 'submit' || type === 'reset') {
      return firstLine((el as HTMLInputElement).value ?? '');
    }
  }
  const role = attr(el, 'role');
  if (['BUTTON', 'LABEL', 'A'].includes(el.tagName) || role === 'button' || role === 'link') {
    const t = firstLine(visibleText(el));
    if (t) return t;
  }
  const aria = attr(el, 'aria-label');
  if (aria) return firstLine(aria);
  const labelledBy = attr(el, 'aria-labelledby');
  if (labelledBy) {
    const t = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter((x): x is HTMLElement => !!x && !isActionTextMasked(x))
      .map((x) => visibleText(x))
      .join(' ');
    if (t.trim()) return firstLine(t);
  }
  for (const a of ['alt', 'title', 'placeholder']) {
    const v = attr(el, a);
    if (v) return firstLine(v);
  }
  return '';
}

/**
 * The name of a click: the first name that the clicked element or one
 * of its parents gives itself (a label, a button's text, aria-label,
 * alt, title), and failing that the first visible text found going up.
 * An icon in a toolbar is named after its labelled parent, not after
 * its CSS classes.
 */
function findActionName(target: HTMLElement): { el: HTMLElement; name: string } | null {
  for (const pass of [ownName, (el: HTMLElement) => firstLine(visibleText(el))]) {
    let el: HTMLElement | null = target;
    for (let i = 0; el && i <= MAX_NAME_PARENTS && el.tagName !== 'BODY' && el.tagName !== 'HTML'; i++) {
      const name = pass(el);
      if (name) return { el, name };
      el = el.parentElement;
    }
  }
  return null;
}

/** The text a user reads on an element, with its line breaks. */
/**
 * Parts of an element whose text an action must not carry: text the
 * replay masks, and what the user typed or picked. A click name read
 * from a parent covers its children too, so these are cut out of it.
 */
const KEEP_OUT_SELECTOR =
  ACTION_MASK_SELECTOR +
  ',[contenteditable],input,textarea,select,script,style,template,noscript,[hidden]';

/**
 * Elements that start a new line. A name is the first line a user
 * reads, and these give the line breaks without asking the browser to
 * lay out the page, which reading innerText would do on every click.
 */
const BLOCK_TAGS = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BR', 'DD', 'DETAILS', 'DIV', 'DL', 'DT',
  'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5',
  'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'SUMMARY',
  'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
]);

/**
 * The text a user reads on an element, up to `limit` characters, with a
 * line break at each block element. It stops once it has the text it
 * needs, so a click on a large container reads only its first rows.
 */
function visibleText(el: HTMLElement, limit = 200): string {
  let out = '';
  let line = '';
  const endLine = () => {
    const t = line.replace(/\s+/g, ' ').trim();
    if (t) out += (out ? '\n' : '') + t;
    line = '';
  };
  const walk = (node: Node): boolean => {
    for (let c = node.firstChild; c; c = c.nextSibling) {
      if (out.length + line.length >= limit) return false;
      if (c.nodeType === 3) {
        line += c.nodeValue ?? '';
      } else if (c.nodeType === 1) {
        let keptOut = true;
        try {
          keptOut = (c as Element).matches(KEEP_OUT_SELECTOR);
        } catch {
          keptOut = true;
        }
        if (keptOut) {
          // Text on either side of a cut-out part is never joined.
          endLine();
          continue;
        }
        const block = BLOCK_TAGS.has((c as Element).tagName);
        if (block) endLine();
        if (!walk(c)) return false;
        if (block) endLine();
      }
    }
    return true;
  };
  walk(el);
  endLine();
  return out.slice(0, limit);
}

// When the user last changed a field or scrolled.
let lastUserInputMs = 0;

// Page activity seen since the last pointer down, and the watch that
// sees it. Tabs, selects and menus change the page on pointer down, so
// a click that watched only from its own event saw no change and was
// called dead.
let pointerActivity = false;
let stopPointerWatch: (() => void) | null = null;
let pointerWatchTimer: ReturnType<typeof setTimeout> | null = null;

function endPointerWatch() {
  if (stopPointerWatch) stopPointerWatch();
  stopPointerWatch = null;
  if (pointerWatchTimer) clearTimeout(pointerWatchTimer);
  pointerWatchTimer = null;
}

export function onPointerDown() {
  endPointerWatch();
  pointerActivity = false;
  stopPointerWatch = watchActivity(() => {
    pointerActivity = true;
  });
  // A press held longer than this is not one click.
  pointerWatchTimer = setTimeout(endPointerWatch, 1000);
}

// The control of the label just clicked. The browser sends that control
// a second click of its own, in the same task; it is one user action.
let labelledControl: Element | null = null;

export function onClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  if (!target || typeof target.tagName !== 'string') return;
  if (labelledControl && target === labelledControl) {
    labelledControl = null;
    return;
  }
  const label =
    typeof target.closest === 'function' ? target.closest('label') : null;
  if (label) {
    const control =
      (label as HTMLLabelElement).control ??
      (label.htmlFor ? document.getElementById(label.htmlFor) : null);
    if (control && control !== target) {
      labelledControl = control;
      setTimeout(() => {
        labelledControl = null;
      }, 0);
    }
  }
  const sawPointerActivity = pointerActivity;
  pointerActivity = false;
  endPointerWatch();
  const selector = getSelector(target);
  const chosenName = getChosenActionName(target);
  // A click in a masked part, or with action text masked, reads no text
  // from the page at all: not from the element and not from its parents.
  const masked = chosenName === null && isActionTextMasked(target);
  const found = chosenName === null && !masked ? findActionName(target) : null;
  const named = found?.el ?? target;
  const tagName = named.tagName.toLowerCase();
  const text = chosenName ?? (found ? visibleText(named).slice(0, 200) : '');
  const targetName =
    chosenName !== null
      ? `${tagName}[${chosenName}]`
      : found
        ? `${tagName}[${found.name}]`
        : getIdOrClassName(target, tagName);

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
    deadCandidate: !matchesSafe(forControl(target), NOT_DEAD_SELECTOR),
    selected: hasSelection(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: false,
    userInput: false,
    done: false,
  };
  inFlight.push(a);
  cancels.push(
    waitForIdle(a.startMs, (r) => {
      a.hadActivity = r.hadActivity || sawPointerActivity;
      // A user who scrolls or changes a field after the click got on
      // with the page: typing, or a checkbox that toggled, is a response
      // even when the page shows no other change.
      a.userInput = lastUserInputMs >= a.startMs;
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
  const input = () => {
    lastUserInputMs = Date.now();
  };
  const removeExit = onPageExit(sendPendingOnExit);
  document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
  document.addEventListener('click', handler, { capture: true, passive: true });
  document.addEventListener('input', input, { capture: true, passive: true });
  document.addEventListener('scroll', input, { capture: true, passive: true });
  teardown = () => {
    removeExit();
    endPointerWatch();
    document.removeEventListener('pointerdown', onPointerDown, {
      capture: true,
    } as EventListenerOptions);
    document.removeEventListener('click', handler, {
      capture: true,
    } as EventListenerOptions);
    document.removeEventListener('input', input, { capture: true } as EventListenerOptions);
    document.removeEventListener('scroll', input, { capture: true } as EventListenerOptions);
  };
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

function matchesSafe(el: HTMLElement, selector: string): boolean {
  try {
    return typeof el.closest === 'function' && el.closest(selector) !== null;
  } catch {
    return false;
  }
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
