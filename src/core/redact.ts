/**
 * Redaction applied to captured network headers and bodies
 * before anything else sees them, including the app's own
 * beforeSendNetwork and beforeSend hooks. There is no option
 * to turn it off: these are values that should never reach a
 * monitoring backend.
 */

export const REDACTED = '[REDACTED]';

/**
 * Header names that hold credentials, a session or the end
 * user's IP address, whatever their prefix: authorization,
 * cookie, x-api-key, x-auth-token, x-csrf-token,
 * x-session-id, x-forwarded-for, x-real-ip, cf-connecting-ip
 * and so on. `forwarded` is anchored so that
 * x-forwarded-proto and x-forwarded-host, which hold no
 * address, are kept.
 */
const SENSITIVE_HEADER_RE =
  /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/;

/**
 * Body keys whose values are replaced: credentials, payment
 * card data, government IDs and IP addresses. Matched against
 * the key with case and separators removed. `token` excludes
 * counts and limits (total_tokens, max_tokens, token_count),
 * which LLM APIs return and which hold no secret.
 */
const SENSITIVE_KEY_RE =
  /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;

export type NameMatcher = (name: string) => boolean;

/**
 * A matcher for header names or body keys: the built-in
 * pattern plus the app's own names (compared after
 * `normalize`) and RegExps (tested against the name as
 * given).
 */
function makeMatcher(
  builtIn: RegExp,
  normalize: (s: string) => string,
  extra: readonly (string | RegExp)[] | undefined,
): NameMatcher {
  const names = new Set<string>();
  const patterns: RegExp[] = [];
  if (Array.isArray(extra)) {
    for (const e of extra) {
      if (typeof e === 'string') names.add(normalize(e));
      else if (e instanceof RegExp) patterns.push(e);
    }
  }
  return (name: string) => {
    const n = normalize(name);
    if (builtIn.test(n) || names.has(n)) return true;
    for (const re of patterns) {
      re.lastIndex = 0;
      if (re.test(name)) return true;
    }
    return false;
  };
}

/** For lowercase header names; extra names ignore case. */
export function makeHeaderMatcher(
  extra: readonly (string | RegExp)[] | undefined,
): NameMatcher {
  return makeMatcher(
    SENSITIVE_HEADER_RE,
    (s) => s.toLowerCase(),
    extra,
  );
}

/** For body keys; ignores case, `-`, `_`, `.` and spaces. */
export function makeKeyMatcher(
  extra: readonly (string | RegExp)[] | undefined,
): NameMatcher {
  return makeMatcher(
    SENSITIVE_KEY_RE,
    (s) => s.toLowerCase().replace(/[-_.\s]/g, ''),
    extra,
  );
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

/**
 * The value with sensitive keys replaced, or `undefined` when
 * nothing in it was, so the caller can send the body exactly
 * as captured.
 */
function redactJsonValue(
  v: unknown,
  isSensitive: NameMatcher,
  depth: number,
): unknown | undefined {
  if (depth > 32 || v === null || typeof v !== 'object') {
    return undefined;
  }
  let changed = false;
  if (Array.isArray(v)) {
    const out = v.map((x) => {
      const r = redactJsonValue(x, isSensitive, depth + 1);
      if (r === undefined) return x;
      changed = true;
      return r;
    });
    return changed ? out : undefined;
  }
  // A null prototype keeps a "__proto__" key an ordinary key.
  const out: Record<string, unknown> = Object.create(null);
  for (const [k, x] of Object.entries(v)) {
    if (isSensitive(k) && x !== null && x !== '') {
      out[k] = REDACTED;
      changed = true;
      continue;
    }
    const r = redactJsonValue(x, isSensitive, depth + 1);
    if (r === undefined) {
      out[k] = x;
    } else {
      out[k] = r;
      changed = true;
    }
  }
  return changed ? out : undefined;
}

// "key": followed by a value, for JSON that does not parse (a
// body cut at maxBodySize).
const JSON_KEY_RE = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g;
const JSON_SCALAR_RE = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;

/**
 * Redacts what it can find in JSON that is cut short. A
 * sensitive key with a string or bare value has the value
 * replaced. A sensitive key whose value is an object or array
 * ends the body there, and so does a string value cut before
 * its closing quote: what follows cannot be told apart from
 * the rest without parsing, and the body was incomplete
 * anyway. Keys inside other objects are reached because the
 * scan moves on to the next key, not past the value.
 */
function redactJsonText(
  s: string,
  isSensitive: NameMatcher,
): string {
  let out = '';
  let last = 0;
  JSON_KEY_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = JSON_KEY_RE.exec(s)) !== null) {
    if (!isSensitive(m[1])) continue;
    const valueStart = m.index + m[0].length;
    const rest = s.slice(valueStart);
    if (rest[0] === '{' || rest[0] === '[') {
      return out + s.slice(last, valueStart) + `"${REDACTED}"`;
    }
    const v = JSON_SCALAR_RE.exec(rest);
    if (!v) {
      // A string cut before its closing quote: the body ends
      // inside the sensitive value.
      return rest[0] === '"'
        ? out + s.slice(last, valueStart) + `"${REDACTED}"`
        : out + s.slice(last);
    }
    if (v[1] === '""' || v[1] === 'null') continue;
    out += s.slice(last, valueStart) + `"${REDACTED}"`;
    last = valueStart + v[1].length;
    JSON_KEY_RE.lastIndex = last;
  }
  return out + s.slice(last);
}

function looksLikeForm(s: string): boolean {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(s);
}

/**
 * A captured body with sensitive values replaced. JSON keeps
 * its shape; form-encoded bodies keep their keys. Card numbers
 * are replaced wherever they appear. A body with nothing to
 * redact is returned exactly as captured: re-serializing JSON
 * would round large integers and drop its formatting.
 */
export function redactBody(
  body: string,
  isSensitive: NameMatcher,
): string {
  if (!body) return body;
  const t = body.trimStart();
  let out = body;
  if (t[0] === '{' || t[0] === '[') {
    let parsed: unknown;
    let ok = true;
    try {
      parsed = JSON.parse(body);
    } catch {
      ok = false;
    }
    if (ok) {
      const r = redactJsonValue(parsed, isSensitive, 0);
      if (r !== undefined) out = JSON.stringify(r);
    } else {
      out = redactJsonText(body, isSensitive);
    }
  } else if (looksLikeForm(t)) {
    try {
      const p = new URLSearchParams(body);
      let changed = false;
      p.forEach((v, k) => {
        if (isSensitive(k) && v) changed = true;
      });
      if (changed) {
        const kept = new URLSearchParams();
        p.forEach((v, k) => {
          kept.append(k, isSensitive(k) && v ? REDACTED : v);
        });
        out = kept.toString();
      }
    } catch {
      // Not form data after all; leave it to the card pass.
    }
  }
  return redactCardNumbers(out);
}
