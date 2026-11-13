/**
 * Redaction applied to captured network headers and bodies
 * before anything else sees them, including the app's own
 * beforeSendNetwork and beforeSend hooks. There is no option
 * to turn it off: these are values that should never reach a
 * monitoring backend.
 */

export const REDACTED = '[REDACTED]';

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  // Headers that carry the end user's IP address, which
  // proxies and CDNs add and some APIs echo back.
  'forwarded',
  'x-forwarded-for',
  'x-original-forwarded-for',
  'x-real-ip',
  'x-client-ip',
  'x-cluster-client-ip',
  'cf-connecting-ip',
  'true-client-ip',
  'fastly-client-ip',
]);

/**
 * Header names that hold credentials or a client address
 * whatever their prefix: x-auth-token, x-csrf-token,
 * x-session-id, x-forwarded-host and so on.
 */
const SENSITIVE_HEADER_RE =
  /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|forwarded/;

export function isBuiltInSensitiveHeader(
  lowerName: string,
): boolean {
  return (
    SENSITIVE_HEADER_NAMES.has(lowerName) ||
    SENSITIVE_HEADER_RE.test(lowerName)
  );
}

/**
 * Body keys whose values are replaced: credentials, payment
 * card data, government IDs and IP addresses. Matched
 * against the key name, ignoring case and separators.
 */
const SENSITIVE_KEY_RE =
  /passw|secret|token|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_.\s]/g, '');
}

export type KeyMatcher = (key: string) => boolean;

export function makeKeyMatcher(
  extra: readonly (string | RegExp)[] | undefined,
): KeyMatcher {
  const names = new Set<string>();
  const patterns: RegExp[] = [];
  if (Array.isArray(extra)) {
    for (const e of extra) {
      if (typeof e === 'string') names.add(normalizeKey(e));
      else if (e instanceof RegExp) patterns.push(e);
    }
  }
  return (key: string) => {
    const n = normalizeKey(key);
    if (SENSITIVE_KEY_RE.test(n) || names.has(n)) return true;
    for (const re of patterns) {
      re.lastIndex = 0;
      if (re.test(key)) return true;
    }
    return false;
  };
}

function luhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

// 13 to 19 digits, optionally grouped by spaces or dashes.
const CARD_RE = /\b\d(?:[ -]?\d){12,18}\b/g;

/** Payment card numbers, recognized by their checksum. */
export function redactCardNumbers(s: string): string {
  return s.replace(CARD_RE, (m) => {
    const digits = m.replace(/[ -]/g, '');
    // Card numbers start with 2-6 (Mastercard, Amex, Visa,
    // Discover and others). Checking it keeps millisecond
    // timestamps and most IDs, a tenth of which pass the
    // checksum by chance.
    return digits.length >= 13 &&
      digits.length <= 19 &&
      digits[0] >= '2' &&
      digits[0] <= '6' &&
      luhnValid(digits)
      ? REDACTED
      : m;
  });
}

function redactJsonValue(
  v: unknown,
  isSensitive: KeyMatcher,
  depth: number,
): unknown {
  if (depth > 32 || v === null || typeof v !== 'object') {
    return v;
  }
  if (Array.isArray(v)) {
    return v.map((x) => redactJsonValue(x, isSensitive, depth + 1));
  }
  const out: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(v)) {
    out[k] =
      isSensitive(k) && x !== null && x !== ''
        ? REDACTED
        : redactJsonValue(x, isSensitive, depth + 1);
  }
  return out;
}

// "key": value, for JSON that does not parse (a body cut at
// maxBodySize). The value is a string or a bare token.
const JSON_PAIR_RE =
  /"((?:[^"\\]|\\.){1,200})"(\s*:\s*)("(?:[^"\\]|\\.)*"|[^\s,}\]]+)/g;

function redactJsonText(
  s: string,
  isSensitive: KeyMatcher,
): string {
  return s.replace(JSON_PAIR_RE, (m, key, sep, value) =>
    isSensitive(key) && value !== '""' && value !== 'null'
      ? `"${key}"${sep}"${REDACTED}"`
      : m,
  );
}

function looksLikeForm(s: string): boolean {
  return /^[\w.%+-]+=[^&]*(&[\w.%+-]+=[^&]*)*$/.test(s);
}

/**
 * A captured body with sensitive values replaced. JSON keeps
 * its shape; form-encoded bodies keep their keys. Card
 * numbers are replaced wherever they appear.
 */
export function redactBody(
  body: string,
  isSensitive: KeyMatcher,
): string {
  if (!body) return body;
  const t = body.trimStart();
  let out = body;
  if (t[0] === '{' || t[0] === '[') {
    try {
      out = JSON.stringify(
        redactJsonValue(JSON.parse(body), isSensitive, 0),
      );
    } catch {
      out = redactJsonText(body, isSensitive);
    }
  } else if (looksLikeForm(t)) {
    try {
      const p = new URLSearchParams(body);
      let changed = false;
      p.forEach((v, k) => {
        if (isSensitive(k) && v) {
          p.set(k, REDACTED);
          changed = true;
        }
      });
      if (changed) out = p.toString();
    } catch {
      // Not form data after all; leave it to the card pass.
    }
  }
  return redactCardNumbers(out);
}
