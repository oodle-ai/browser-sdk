/**
 * Redaction applied to captured network headers and bodies
 * before anything else sees them, including the app's own
 * beforeSendNetwork and beforeSend hooks. There is no option
 * to turn it off: these are values that should never reach a
 * monitoring backend.
 */
export declare const REDACTED = "[REDACTED]";
export declare function isBuiltInSensitiveHeader(lowerName: string): boolean;
export type KeyMatcher = (key: string) => boolean;
export declare function makeKeyMatcher(extra: readonly (string | RegExp)[] | undefined): KeyMatcher;
/** Payment card numbers, recognized by their checksum. */
export declare function redactCardNumbers(s: string): string;
/**
 * A captured body with sensitive values replaced. JSON keeps
 * its shape; form-encoded bodies keep their keys. Card
 * numbers are replaced wherever they appear.
 */
export declare function redactBody(body: string, isSensitive: KeyMatcher): string;
