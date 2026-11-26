/** Full-settings hook (use sparingly; prefer slices). */
import { useSettingsStore } from '../store/settings.store';
import type { DeepPlayerSettings } from '../types/settings.types';

export function useSettings(): { settings: DeepPlayerSettings; hydrated: boolean } {
  const settings = useSettingsStore((s) => s.settings);
  const hydrated = useSettingsStore((s) => s.hydrated);
  return { settings, hydrated };
}
