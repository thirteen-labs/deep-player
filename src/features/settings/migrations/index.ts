/**
 * Versioned migrations (spec §7 production requirement + §17 rec #2).
 * Migration runs before hydration is considered complete.
 *
 * - `version` here is the persisted schemaVersion of the stored blob.
 * - Unknown FUTURE versions are rejected (caller falls back to defaults),
 *   never imported blindly.
 */
import { cloneDefaults } from '../defaults/settings.defaults';
import { SETTINGS_SCHEMA_VERSION } from '../types/settings.types';
import type { DeepPlayerSettings } from '../types/settings.types';
import { sanitizeSettings } from './v1';

/** Persisted wrapper shape written by the Zustand persist layer. */
export interface PersistedSettingsEnvelope {
  version?: number;
  state?: unknown;
  settings?: unknown;
}

export class UnknownSettingsVersionError extends Error {
  constructor(version: number) {
    super(`Unknown future settings schema version: ${version} (supported: ${SETTINGS_SCHEMA_VERSION})`);
    this.name = 'UnknownSettingsVersionError';
  }
}

/**
 * Run migrations for a persisted blob.
 * @param persisted raw persisted value (already JSON-parsed by zustand)
 * @param fromVersion persisted schema version
 */
export function migrateSettings(persisted: unknown, fromVersion: number): DeepPlayerSettings {
  if (!Number.isFinite(fromVersion) || fromVersion < 0) {
    return sanitizeSettings(persisted);
  }
  // Unknown future version: refuse rather than risk corrupting preferences.
  if (fromVersion > SETTINGS_SCHEMA_VERSION) {
    throw new UnknownSettingsVersionError(fromVersion);
  }
  // Future hook: chain v0→v1→… migrations here. For now every known version
  // funnels through the v1 sanitizer which repairs + fills defaults.
  return sanitizeSettings(persisted);
}

/** Safe wrapper used by persistence: never throws, always returns valid settings. */
export function migrateSettingsSafe(persisted: unknown, fromVersion: number): DeepPlayerSettings {
  try {
    return migrateSettings(persisted, fromVersion);
  } catch {
    return cloneDefaults();
  }
}

export { sanitizeSettings };
