/** Accessibility preferences consumed by shared UI primitives. */
import { useSettingsStore } from '../store/settings.store';

/** Increase touch targets when the user enables large controls. */
export function useLargeControls(): boolean {
  return useSettingsStore((s) => s.settings.accessibility.largeControls);
}

/** Add explicit hints and accessibility tree metadata to shared rows/cards. */
export function useScreenReaderOptimized(): boolean {
  return useSettingsStore((s) => s.settings.accessibility.screenReaderOptimized);
}

/** Use the high-contrast palette before any scoped theme override. */
export function useHighContrast(): boolean {
  return useSettingsStore((s) => s.settings.accessibility.highContrast);
}
