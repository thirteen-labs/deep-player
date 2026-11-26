/**
 * Settings store (spec §7): Zustand + persistence middleware.
 *
 * Provides:
 *  - read individual settings (selectors / getSettingById)
 *  - update individual settings + grouped settings
 *  - reset individual settings / complete categories / everything
 *  - hydrate from storage
 *  - validate stored data (Zod) + run migrations before hydration completes
 *  - export/import settings (see ../backup)
 *
 * Production requirements satisfied:
 *  - runtime Zod validation
 *  - migration before hydration is considered complete
 *  - immutable defaults
 *  - storage error fallback (safe storage adapter; merge falls back to defaults)
 *  - NOT hydrated until migrations + validation finish
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { cloneDefaults, DEFAULT_SETTINGS } from '../defaults/settings.defaults';
import { migrateSettingsSafe } from '../migrations';
import { sanitizeSettings } from '../migrations/v1';
import { SETTINGS_SCHEMA_VERSION } from '../types/settings.types';
import type { DeepPlayerSettings, SettingsSection } from '../types/settings.types';
import { getSettingById, keyOf, sectionOf, setSettingById } from './setting-path';
import { getSettingsStorage, SETTINGS_STORAGE_KEY } from './settings.persistence';

export interface SettingsStore {
  settings: DeepPlayerSettings;
  /** True only after storage read + migrations + validation have finished. */
  hydrated: boolean;

  /** Update one section shallowly (spec signature). */
  updateSetting: <K extends keyof DeepPlayerSettings>(
    section: K,
    value: Partial<DeepPlayerSettings[K]>,
  ) => void;

  /** Update grouped settings across one section. */
  updateSection: <K extends keyof DeepPlayerSettings>(
    section: K,
    value: Partial<DeepPlayerSettings[K]>,
  ) => void;

  /** Set a single (possibly nested) setting by dotted id, e.g. `video.subtitles.autoLoad`. */
  setSetting: (id: string, value: unknown) => void;

  /** Read a single (possibly nested) setting by dotted id. */
  getSetting: (id: string) => unknown;

  /** Replace the entire settings object (validated + sanitized). */
  replaceSettings: (settings: DeepPlayerSettings) => void;

  /** Reset one individual setting by dotted id to its default. */
  resetSetting: (id: string) => void;

  /** Reset a complete category to defaults. */
  resetCategory: (section: SettingsSection) => void;

  /** Reset everything to defaults (does not delete media files). */
  resetAll: () => void;

  /** Hydrate from storage (migrations + validation applied first). */
  hydrateSettings: (settings: unknown) => void;

  setHydrated: (value: boolean) => void;
}

interface PersistedShape {
  settings: DeepPlayerSettings;
}

function isSettingsSection(key: string): key is SettingsSection {
  return key in DEFAULT_SETTINGS && key !== 'schemaVersion';
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: cloneDefaults(),
      hydrated: false,

      updateSetting: (section, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [section]: { ...(state.settings[section] as object), ...(value as object) },
          },
        })),

      updateSection: (section, value) => get().updateSetting(section, value),

      setSetting: (id, value) =>
        set((state) => ({
          settings: sanitizeSettings(setSettingById(state.settings, id, value)),
        })),

      getSetting: (id) => getSettingById(get().settings, id),

      replaceSettings: (settings) =>
        set({ settings: sanitizeSettings({ ...settings, schemaVersion: SETTINGS_SCHEMA_VERSION }) }),

      resetSetting: (id) =>
        set((state) => {
          const defaultValue = getSettingById(DEFAULT_SETTINGS, id);
          return { settings: sanitizeSettings(setSettingById(state.settings, id, defaultValue)) };
        }),

      resetCategory: (section) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [section]: structuredClone(DEFAULT_SETTINGS[section]),
          },
        })),

      resetAll: () => set({ settings: cloneDefaults() }),

      hydrateSettings: (settings) =>
        set({ settings: sanitizeSettings(settings), hydrated: true }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: SETTINGS_SCHEMA_VERSION,
      storage: createJSONStorage(() => getSettingsStorage()),

      partialize: (state): PersistedShape => ({ settings: state.settings }),

      // Migration runs before hydration completes; never throws.
      migrate: (persistedState, version): PersistedShape => {
        const inner =
          persistedState && typeof persistedState === 'object' && 'settings' in persistedState
            ? (persistedState as { settings: unknown }).settings
            : persistedState;
        return { settings: migrateSettingsSafe(inner, version) };
      },

      // Re-validate + merge on top of current state; fall back to defaults.
      merge: (persistedState, currentState) => {
        try {
          const inner =
            persistedState && typeof persistedState === 'object' && 'settings' in persistedState
              ? (persistedState as { settings: unknown }).settings
              : undefined;
          const settings = inner ? sanitizeSettings(inner) : currentState.settings;
          return { ...currentState, settings };
        } catch {
          return { ...currentState, settings: cloneDefaults() };
        }
      },

      // Called after migration + merge finish (or on error). Only now hydrated=true.
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // Storage error fallback: keep current (default-safe) settings, still hydrate.
          state?.setHydrated(true);
          return;
        }
        state?.setHydrated(true);
      },
    },
  ),
);

/* ---- Re-export path helpers used by reset/search layers ---- */
export { getSettingById, setSettingById, keyOf, sectionOf, isSettingsSection };

/** Non-hook access for use outside React. */
export const settingsStoreApi = useSettingsStore;
