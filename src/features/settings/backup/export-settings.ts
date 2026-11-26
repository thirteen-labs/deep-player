/**
 * Export settings to a versioned JSON backup (spec §9 export workflow).
 * Steps: validate → build versioned doc → serialize → write file → share.
 * Never includes secrets, credentials, media, or (by default) private paths.
 */
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { BackupCategory } from '../types/settings.enums';
import { BACKUP_CATEGORIES } from '../types/settings.enums';
import { SETTINGS_SCHEMA_VERSION } from '../types/settings.types';
import type { DeepPlayerSettings } from '../types/settings.types';
import { settingsSchema } from '../validation/settings.schema';
import { BACKUP_APP, BACKUP_TYPE, BACKUP_VERSION, type Backup } from '../validation/backup.schema';

export const APP_NAME = BACKUP_APP;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** `deep-player-settings-2026-11-26.json` */
export function backupFileName(date = new Date()): string {
  return `deep-player-settings-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

/** Keys that must never appear in a backup (spec §9 exclusions). */
const SECRET_KEYS = ['pin', 'pinHash', 'pinSalt', 'token', 'secret', 'credential', 'biometricSecret', 'password'];

function stripSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSecrets);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEYS.some((s) => k.toLowerCase().includes(s))) continue;
      out[k] = stripSecrets(v);
    }
    return out;
  }
  return value;
}

/** Categories enabled by `storage.backupInclude*`. */
function includedCategories(settings: DeepPlayerSettings, requested?: BackupCategory[]): BackupCategory[] {
  const enabled = new Set<BackupCategory>(BACKUP_CATEGORIES);
  if (!settings.storage.backupIncludeAppearance) enabled.delete('appearance');
  if (!settings.storage.backupIncludePlayback) enabled.delete('playback');
  if (!settings.storage.backupIncludeFolders) enabled.delete('folders');
  if (!settings.storage.backupIncludePresets) enabled.delete('player');
  const base = Array.from(enabled);
  return requested ? base.filter((c) => requested.includes(c)) : base;
}

/**
 * Build a versioned backup document from current settings.
 * @param categories restrict to a subset (partial export); default = enabled set.
 */
export function buildBackup(settings: DeepPlayerSettings, categories?: BackupCategory[]): Backup {
  // Validate settings first (step 4 of export workflow).
  const validated = settingsSchema.parse(settings);
  const include = new Set(includedCategories(validated, categories));
  const out: Backup['settings'] = {};
  for (const category of BACKUP_CATEGORIES) {
    if (!include.has(category)) continue;
    const section = (validated as unknown as Record<string, unknown>)[category];
    (out as Record<string, unknown>)[category] = stripSecrets(section);
  }
  // Never export a private wallpaper path.
  if (out.appearance && 'wallpaperUri' in out.appearance) {
    (out.appearance as Record<string, unknown>).wallpaperUri = null;
  }
  return {
    app: BACKUP_APP,
    backupType: BACKUP_TYPE,
    backupVersion: BACKUP_VERSION,
    settingsSchemaVersion: SETTINGS_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings: out,
  };
}

export function serializeBackup(backup: Backup): string {
  return JSON.stringify(backup, null, 2);
}

/** Write backup JSON to a file in the document directory. Returns the file URI. */
export async function writeBackupFile(backup: Backup, fileName = backupFileName()): Promise<string> {
  const file = new File(Paths.document, fileName);
  if (file.exists) file.delete();
  file.create();
  await file.write(serializeBackup(backup));
  return file.uri;
}

/** Full export workflow: build → write → share. Returns share + file info. */
export async function exportSettings(
  settings: DeepPlayerSettings,
  categories?: BackupCategory[],
): Promise<{ uri: string; shared: boolean; backup: Backup }> {
  const backup = buildBackup(settings, categories);
  const uri = await writeBackupFile(backup);
  let shared = false;
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Export Deep Player settings' });
      shared = true;
    }
  } catch {
    // Sharing is best-effort; file is still written.
  }
  return { uri, shared, backup };
}
