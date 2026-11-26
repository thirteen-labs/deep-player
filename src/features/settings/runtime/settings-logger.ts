/** Console warning policy driven by advanced.loggingLevel. */
import { useSettingsStore } from '../store/settings.store';

type LoggingLevel = 'none' | 'error' | 'warn' | 'debug';

export function settingsWarn(message: string, ...details: unknown[]): void {
  const level = useSettingsStore.getState().settings.advanced.loggingLevel as LoggingLevel;
  if (level !== 'warn' && level !== 'debug') return;
  console.warn(message, ...details);
}

export function settingsDebug(message: string, ...details: unknown[]): void {
  if (useSettingsStore.getState().settings.advanced.loggingLevel !== 'debug') return;
  console.log(message, ...details);
}
