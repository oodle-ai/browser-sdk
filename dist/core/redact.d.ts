/**
 * Redaction applied to captured network headers and bodies
 * before anything else sees them, including the app's own
 * beforeSendNetwork and beforeSend hooks. There is no option
 * to turn it off: these are values that should never reach a
 * monitoring backend.
 */
export declare const REDACTED = "[REDACTED]";
export type NameMatcher = (name: string) => boolean;
/** For lowercase header names; extra names ignore case. */
export declare function makeHeaderMatcher(extra: readonly (string | RegExp)[] | undefined): NameMatcher;
/** For body keys; ignores case, `-`, `_`, `.` and spaces. */
export declare function makeKeyMatcher(extra: readonly (string | RegExp)[] | undefined): NameMatcher;
/** Payment card numbers, recognized by their checksum. */
export declare function redactCardNumbers(s: string): string;
/**
 * A captured body with sensitive values replaced. JSON keeps
 * its shape; form-encoded bodies keep their keys. Card numbers
 * are replaced wherever they appear. A body with nothing to
 * redact is returned exactly as captured: re-serializing JSON
 * would round large integers and drop its formatting.
 */
export declare function redactBody(body: string, isSensitive: NameMatcher): string;
