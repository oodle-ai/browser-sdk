/**
 * Marks the SDK's console wrappers, so SDK warnings can go to
 * the console method the wrapper replaced. They are shown to
 * the developer but not recorded as the app's console events.
 */
export const ORIGINAL = '__oodleOriginal';

export function sdkWarn(message: string): void {
  try {
    const current = console.warn as typeof console.warn & {
      [ORIGINAL]?: typeof console.warn;
    };
    (current[ORIGINAL] ?? current).call(
      console,
      '[@oodle-ai/rum] ' + message,
    );
  } catch {
    // No console to warn on.
  }
}
