/**
 * Data minimization settings for what leaves the browser.
 *
 * Every option defaults to the behavior the SDK had before it
 * existed, so an app that sets none of them sends the same
 * events. The state lives here rather than being read through
 * getConfig() so that the helpers below are safe to call before
 * init() and from tests that never configure the SDK.
 */

export type ConsoleLevel = 'error' | 'warn';
export type ReferrerMode = 'path' | 'origin' | 'none';
export type MessageMode = 'full' | 'scrub' | 'none';
export type ActionTextMode = 'full' | 'mask';
export type UserAgentMode = 'full' | 'none';
export type QueryStringMode = 'events' | 'all';
export type UserInfoMode = 'full' | 'id' | 'none';

export interface PrivacyOptions {
  urlPathPatterns?: readonly string[];
  maskUrlPath?: (path: string) => string;
  referrerUrl?: ReferrerMode;
  consoleLevels?: readonly ConsoleLevel[];
  errorMessages?: MessageMode;
  actionText?: ActionTextMode;
  userAgent?: UserAgentMode;
  stripQueryStrings?: QueryStringMode;
  userInfo?: UserInfoMode;
  privacyLevel?: string;
  viewUrlQueryParams?: readonly string[];
}

interface CompiledPattern {
  /** Literal segments, or `:name` for any one segment. */
  segs: string[];
  /** Ends in `*`: matches any number of further segments. */
  rest: boolean;
}

interface PrivacyState {
  patterns: CompiledPattern[];
  maskFn: ((path: string) => string) | null;
  referrer: ReferrerMode;
  consoleLevels: readonly ConsoleLevel[];
  messages: MessageMode;
  actionText: ActionTextMode;
  userAgent: UserAgentMode;
  queryStrings: QueryStringMode;
  userInfo: UserInfoMode;
  keepParams: readonly string[];
}

const ALL_CONSOLE_LEVELS: readonly ConsoleLevel[] = [
  'error',
  'warn',
];

function defaults(): PrivacyState {
  return {
    patterns: [],
    maskFn: null,
    referrer: 'path',
    consoleLevels: ALL_CONSOLE_LEVELS,
    messages: 'full',
    actionText: 'full',
    userAgent: 'full',
    queryStrings: 'events',
    userInfo: 'full',
    keepParams: [],
  };
}

let state: PrivacyState = defaults();

/** Placeholder for a path whose mask function failed. */
export const REDACTED_PATH = '/:redacted';

const PATH_CACHE_MAX = 256;
const pathCache = new Map<string, string>();
let warnedMaskFnError = false;

function warn(msg: string) {
  // Bound to the console at call time, so the SDK's own
  // console.warn hook (if installed) records it like any
  // other warning instead of looping.
  console.warn('[@oodle-ai/rum] ' + msg);
}

/**
 * Picks `value` when it is one of `allowed`. An unknown value
 * falls back to the most private choice, not the default: an
 * app that misspells a privacy setting meant to turn something
 * off, and sending the data anyway would defeat that.
 */
function pickMode<T extends string>(
  name: string,
  value: unknown,
  allowed: readonly T[],
  fallback: T,
  strictest: T,
): T {
  if (value === undefined) return fallback;
  if (
    typeof value === 'string' &&
    (allowed as readonly string[]).includes(value)
  ) {
    return value as T;
  }
  warn(
    `${name} must be one of ${allowed
      .map((a) => `'${a}'`)
      .join(', ')}. Using '${strictest}'.`,
  );
  return strictest;
}

export function compilePathPattern(
  pattern: string,
): CompiledPattern | null {
  if (typeof pattern !== 'string') return null;
  if (!pattern.startsWith('/')) return null;
  const segs = pattern.split('/').slice(1);
  if (segs.length > 0 && segs[segs.length - 1] === '') {
    segs.pop();
  }
  let rest = false;
  if (segs.length > 0 && segs[segs.length - 1] === '*') {
    rest = true;
    segs.pop();
  }
  for (const s of segs) {
    if (s === '' || s === ':' || s.includes('*')) {
      return null;
    }
  }
  return { segs, rest };
}

function compilePatterns(
  value: unknown,
): CompiledPattern[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    warn(
      'urlPathPatterns must be an array of path' +
        " patterns such as '/projects/:id'. It is ignored.",
    );
    return [];
  }
  const out: CompiledPattern[] = [];
  for (const p of value) {
    const c = compilePathPattern(p);
    if (c) {
      out.push(c);
    } else {
      warn(
        `urlPathPatterns: ${JSON.stringify(p)} is not a` +
          " valid pattern. Patterns start with '/', use" +
          " ':name' for one segment and may end in '/*'." +
          ' It is ignored.',
      );
    }
  }
  return out;
}

function compileConsoleLevels(
  value: unknown,
): readonly ConsoleLevel[] {
  if (value === undefined) return ALL_CONSOLE_LEVELS;
  if (!Array.isArray(value)) {
    warn(
      "consoleLevels must be an array such as ['error']." +
        ' Console capture is off.',
    );
    return [];
  }
  const levels = ALL_CONSOLE_LEVELS.filter((l) =>
    value.includes(l),
  );
  if (
    value.some(
      (v) => !(ALL_CONSOLE_LEVELS as unknown[]).includes(v),
    )
  ) {
    warn(
      "consoleLevels accepts only 'error' and 'warn'." +
        ' Other values are ignored.',
    );
  }
  return levels;
}

export function configurePrivacy(
  opts: PrivacyOptions,
): void {
  pathCache.clear();
  warnedMaskFnError = false;
  const maskFn = opts.maskUrlPath;
  if (maskFn !== undefined && typeof maskFn !== 'function') {
    warn('maskUrlPath must be a function. It is ignored.');
  }
  state = {
    patterns: compilePatterns(opts.urlPathPatterns),
    maskFn: typeof maskFn === 'function' ? maskFn : null,
    referrer: pickMode(
      'referrerUrl',
      opts.referrerUrl,
      ['path', 'origin', 'none'] as const,
      'path',
      'none',
    ),
    consoleLevels: compileConsoleLevels(
      opts.consoleLevels,
    ),
    messages: pickMode(
      'errorMessages',
      opts.errorMessages,
      ['full', 'scrub', 'none'] as const,
      'full',
      'none',
    ),
    // Text the replay masks must not reappear in click events.
    actionText: pickMode(
      'actionText',
      opts.actionText,
      ['full', 'mask'] as const,
      opts.privacyLevel === 'mask' ? 'mask' : 'full',
      'mask',
    ),
    userAgent: pickMode(
      'userAgent',
      opts.userAgent,
      ['full', 'none'] as const,
      'full',
      'none',
    ),
    queryStrings: pickMode(
      'stripQueryStrings',
      opts.stripQueryStrings,
      ['events', 'all'] as const,
      'events',
      'all',
    ),
    userInfo: pickMode(
      'userInfo',
      opts.userInfo,
      ['full', 'id', 'none'] as const,
      'full',
      'none',
    ),
    keepParams: Array.isArray(opts.viewUrlQueryParams)
      ? opts.viewUrlQueryParams
      : [],
  };
}

/** Test hook: back to the behavior with no options set. */
export function resetPrivacy(): void {
  state = defaults();
  pathCache.clear();
  warnedMaskFnError = false;
}

export function hasPathMasking(): boolean {
  return state.patterns.length > 0 || state.maskFn !== null;
}

function applyPatterns(path: string): string {
  const parts = path.split('/').slice(1);
  const trailingSlash =
    parts.length > 0 && parts[parts.length - 1] === '';
  if (trailingSlash) parts.pop();
  for (const p of state.patterns) {
    if (p.rest) {
      if (parts.length < p.segs.length) continue;
    } else if (parts.length !== p.segs.length) {
      continue;
    }
    let ok = true;
    for (let i = 0; i < p.segs.length; i++) {
      const s = p.segs[i];
      if (s[0] === ':') {
        if (parts[i] === '') {
          ok = false;
          break;
        }
      } else if (s !== parts[i]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    let out = '/' + p.segs.join('/');
    if (p.rest && parts.length > p.segs.length) {
      out += (p.segs.length > 0 ? '/' : '') + '*';
    }
    if (trailingSlash && !out.endsWith('/')) out += '/';
    return out;
  }
  return path;
}

function computeMaskedPath(path: string): string {
  let out =
    state.patterns.length > 0 ? applyPatterns(path) : path;
  if (state.maskFn) {
    try {
      const r = state.maskFn(out);
      // Fail closed. Sending the raw path because the app's
      // own masking broke is the leak the option prevents.
      out = typeof r === 'string' ? r : REDACTED_PATH;
    } catch (e) {
      if (!warnedMaskFnError) {
        warnedMaskFnError = true;
        warn(
          'maskUrlPath threw. Paths are sent as ' +
            `'${REDACTED_PATH}' until it is fixed: ${String(e)}`,
        );
      }
      out = REDACTED_PATH;
    }
  }
  return out;
}

/**
 * The URL path with `urlPathPatterns` and `maskUrlPath`
 * applied. Called for every event, so it returns at once when
 * nothing is configured and caches results otherwise: the page
 * path rarely changes, and API paths repeat.
 */
export function maskPath(path: string): string {
  if (!hasPathMasking()) return path;
  const hit = pathCache.get(path);
  if (hit !== undefined) return hit;
  const out = computeMaskedPath(path);
  if (pathCache.size >= PATH_CACHE_MAX) pathCache.clear();
  pathCache.set(path, out);
  return out;
}

function isAbsoluteUrl(url: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url);
}

/**
 * A request URL without its query string or fragment, with the
 * path masked. A relative URL stays relative (as the resolved
 * path) so that it does not gain an origin it never had; before
 * this, a relative URL failed to parse and was sent with its
 * query string intact.
 */
export function sanitizeResourceUrl(
  url: string,
  base?: string,
): string {
  if (isAbsoluteUrl(url)) {
    let u: URL;
    try {
      u = new URL(url);
    } catch {
      return url;
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      // data:, blob: and similar carry no path to mask, and a
      // data: URL's "path" is its whole payload.
      return u.protocol === 'data:'
        ? 'data:'
        : u.origin + u.pathname;
    }
    return u.origin + maskPath(u.pathname);
  }
  try {
    const u = new URL(
      url,
      base ??
        (typeof location !== 'undefined'
          ? location.href
          : 'http://localhost/'),
    );
    return maskPath(u.pathname);
  } catch {
    const cut = url.search(/[?#]/);
    return cut >= 0 ? url.slice(0, cut) : url;
  }
}

/**
 * Masks only the path of a full URL and keeps its query and
 * fragment. Used where the SDK sent the full URL before (the
 * replay page URL, span `url.full`), so that path masking does
 * not also change what else those fields hold.
 */
export function maskUrlPathOnly(url: string): string {
  if (!hasPathMasking() || typeof url !== 'string') {
    return url;
  }
  return rewriteUrl(url, (u) => u.search + u.hash);
}

/**
 * Whether the replay page URL and span URLs need rewriting at
 * all, so callers can skip the work when they do not.
 */
export function rewritesFullUrls(): boolean {
  return hasPathMasking() || state.queryStrings === 'all';
}

/**
 * The page URL session replay records. With
 * `stripQueryStrings: 'all'` it matches `view_url`: no
 * fragment, and only the `viewUrlQueryParams` in the query.
 */
export function sanitizeReplayUrl(url: string): string {
  if (state.queryStrings !== 'all') return maskUrlPathOnly(url);
  if (typeof url !== 'string') return url;
  return rewriteUrl(url, (u) => {
    const keep = state.keepParams;
    if (keep.length === 0 || !u.search) return '';
    const kept = new URLSearchParams();
    u.searchParams.forEach((v, k) => {
      if (keep.includes(k)) kept.append(k, v);
    });
    const q = kept.toString();
    return q ? '?' + q : '';
  });
}

/**
 * A request URL on a span. With `stripQueryStrings: 'all'` it
 * matches `resource_url`: no query or fragment.
 */
export function sanitizeSpanUrl(url: string): string {
  if (state.queryStrings !== 'all') return maskUrlPathOnly(url);
  if (typeof url !== 'string') return url;
  return rewriteUrl(url, () => '');
}

function rewriteUrl(
  url: string,
  suffix: (u: URL) => string,
): string {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return url;
  }
  return u.origin + maskPath(u.pathname) + suffix(u);
}

let referrerCacheKey: string | null = null;
let referrerCacheVal = '';
let referrerCacheState: PrivacyState | null = null;

export function sanitizeReferrer(referrer: string): string {
  if (
    referrer === referrerCacheKey &&
    referrerCacheState === state
  ) {
    return referrerCacheVal;
  }
  let out = '';
  if (referrer && state.referrer !== 'none') {
    try {
      const u = new URL(referrer);
      out =
        state.referrer === 'origin'
          ? u.origin
          : u.origin + maskPath(u.pathname);
    } catch {
      out = state.referrer === 'origin' ? '' : referrer;
    }
  }
  referrerCacheKey = referrer;
  referrerCacheVal = out;
  referrerCacheState = state;
  return out;
}

export function consoleLevels(): readonly ConsoleLevel[] {
  return state.consoleLevels;
}

export function messageMode(): MessageMode {
  return state.messages;
}

export function sendUserAgent(): boolean {
  return state.userAgent === 'full';
}

/**
 * The user fields from identify() as `userInfo` lets them be
 * sent. `user_status` is not here: whether a user was
 * identified says nothing about who they are.
 */
export function userFields(
  id: string,
  name: string,
  email: string,
): { user_id: string; user_name: string; user_email: string } {
  switch (state.userInfo) {
    case 'full':
      return { user_id: id, user_name: name, user_email: email };
    case 'id':
      return { user_id: id, user_name: '', user_email: '' };
    default:
      return { user_id: '', user_name: '', user_email: '' };
  }
}

// --- Message scrubbing ---

// Each quote style gets its own expression so the character
// classes stay disjoint and matching is linear. The leading
// group stands in for a lookbehind (a parse error on Safari
// before 16.4, which would break the whole bundle): a quote
// only opens a string at the start or after a non-word
// character, so the apostrophe in "can't" does not.
const QUOTED_RES: [RegExp, string][] = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, '$1`?`'],
];
const URL_RE = /\bhttps?:\/\/[^\s'"`<>()\]]+/g;
const EMAIL_RE =
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const UUID_RE =
  /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g;
// Hex runs long enough to be an ID or token. At least one
// digit keeps plain words, and at least one letter leaves
// all-digit runs to LONG_NUM_RE.
const HEX_RE =
  /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g;
const LONG_NUM_RE = /\d{4,}/g;

/**
 * Replaces the parts of a message that most often hold data
 * rather than describe the failure: quoted strings, URLs,
 * emails, IDs and long numbers. What is left still groups
 * errors of the same kind together.
 */
export function scrubMessage(msg: string): string {
  if (!msg) return msg;
  let out = msg.replace(EMAIL_RE, '<email>');
  out = out.replace(URL_RE, (u) => {
    const s = sanitizeResourceUrl(u);
    return s === u ? '<url>' : s;
  });
  for (const [re, rep] of QUOTED_RES) {
    out = out.replace(re, rep);
  }
  out = out.replace(UUID_RE, '<id>');
  out = out.replace(HEX_RE, '<id>');
  out = out.replace(LONG_NUM_RE, '<n>');
  return out;
}

/** A V8 (`    at ...`) or Firefox/Safari (`fn@url:1:2`) frame. */
const FRAME_RE = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;

/** A message as `errorMessages` says it may be sent. */
export function sanitizeMessage(msg: string): string {
  switch (state.messages) {
    case 'full':
      return msg;
    case 'scrub':
      return scrubMessage(msg);
    default:
      return '';
  }
}

/**
 * The stack with its message replaced to match
 * `sanitizeMessage`. V8 opens a stack with "Name: message";
 * the frames below hold script URLs and line numbers, which
 * are left alone so stacks still map to source.
 */
export function sanitizeStack(
  stack: string,
  rawMessage: string,
): string {
  if (state.messages === 'full' || !stack) return stack;
  if (!rawMessage) return stack;
  // Only a message in the header is the message; a match
  // inside a frame is a coincidence. Firefox and Safari
  // stacks have no header and start with a frame.
  const m = FRAME_RE.exec(stack);
  const headerEnd = m ? m.index : stack.length;
  const idx = stack.indexOf(rawMessage);
  if (idx < 0 || idx + rawMessage.length > headerEnd) {
    return stack;
  }
  const replacement = sanitizeMessage(rawMessage);
  let head = stack.slice(0, idx) + replacement;
  if (!replacement) head = head.replace(/:\s*$/, '');
  return head + stack.slice(idx + rawMessage.length);
}

// --- Action text ---

/**
 * Elements whose text the replay masks or omits. Click events
 * read the same markers so that text kept out of the replay
 * is not sent in an action instead. Kept here so the recorder
 * and click tracking cannot drift apart.
 */
export const BLOCK_SELECTOR =
  '[data-oodle-privacy="hidden"],' + '.oodle-privacy-hidden';
export const MASK_TEXT_SELECTOR =
  '[data-oodle-privacy="mask"],' + '.oodle-privacy-mask';
const ACTION_MASK_SELECTOR =
  BLOCK_SELECTOR +
  ',' +
  MASK_TEXT_SELECTOR +
  ',.rr-block,.rr-mask';

export function isActionTextMasked(el: Element): boolean {
  if (state.actionText === 'mask') return true;
  try {
    return (
      typeof el.closest === 'function' &&
      el.closest(ACTION_MASK_SELECTOR) !== null
    );
  } catch {
    return true;
  }
}
