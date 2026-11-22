/**
 * Web-only helper: uses the browser's `window.prompt` when available, since
 * the native platforms use `Alert.prompt` instead.
 */
export function promptName(message: string, defaultValue?: string): string | null {
  const promptFn = (globalThis as { prompt?: (message: string, defaultValue?: string) => string | null }).prompt;
  return promptFn ? promptFn(message, defaultValue) : null;
}
