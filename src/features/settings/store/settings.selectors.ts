/**
 * Selectors (spec §7 "Recommended selectors"): subscribe to slices, not the
 * whole settings object, to avoid unnecessary re-renders.
 */
import type { DeepPlayerSettings, SettingsSection } from '../types/settings.types';
import { getSettingById } from './setting-path';
import { useSettingsStore } from './settings.store';

export const selectSettings = (s: { settings: DeepPlayerSettings }) => s.settings;
export const selectHydrated = (s: { hydrated: boolean }) => s.hydrated;

export function sectionSelector<K extends SettingsSection>(section: K) {
  return (s: { settings: DeepPlayerSettings }) => s.settings[section];
}

export function settingSelector(id: string) {
  return (s: { settings: DeepPlayerSettings }) => getSettingById(s.settings, id);
}

/** Hook: subscribe to a whole section. */
export function useSettingsSection<K extends SettingsSection>(section: K) {
  return useSettingsStore(sectionSelector(section));
}

/** Hook: subscribe to one setting by dotted id. */
export function useSettingValue(id: string) {
  return useSettingsStore(settingSelector(id));
}
