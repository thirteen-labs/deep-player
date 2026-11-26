/**
 * Import settings from a JSON backup (spec §9 import workflow).
 * Validate → verify identity → check schema version → migrate → show available
 * categories → preview changes → confirm → apply atomically → verify.
 * Invalid imports NEVER partially overwrite existing preferences.
 */
import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

import { sanitizeSettings } from '../migrations';
import { BACKUP_CATEGORIES, type BackupCategory } from '../types/settings.enums';
import { SETTINGS_SCHEMA_VERSION } from '../types/settings.types';
import type { DeepPlayerSettings } from '../types/settings.types';
import { getSettingById, setSettingById } from '../store/setting-path';
import { settingsSchema } from '../validation/settings.schema';
import { parseBackup, type Backup } from '../validation/backup.schema';

export interface ImportChange {
  id: string;
  category: BackupCategory;
  before: unknown;
  after: unknown;
}

export interface ImportPreview {
  backup: Backup;
  categories: BackupCategory[]; // categories present in the backup
  changes: ImportChange[]; // changes for the selected categories
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function flatten(section: unknown, prefix: string, out: { id: string; value: unknown }[]): void {
  if (isPlainObject(section)) {
    for (const [k, v] of Object.entries(section)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else {
    out.push({ id: prefix, value: section });
  }
}

/** Which categories does this backup contain? */
export function backupCategories(backup: Backup): BackupCategory[] {
  return BACKUP_CATEGORIES.filter((c) => isPlainObject(backup.settings) && c in (backup.settings as object));
}

/**
 * Build the merged, validated settings result for the selected categories
 * WITHOUT applying it. Returns null if nothing would change / invalid.
 */
export function mergeBackup(
  current: DeepPlayerSettings,
  backup: Backup,
  categories?: BackupCategory[],
): DeepPlayerSettings {
  const selected = categories ?? backupCategories(backup);
  let merged: DeepPlayerSettings = structuredClone(current);

  for (const category of selected) {
    const incoming = (backup.settings as Record<string, unknown>)[category];
    if (!isPlainObject(incoming)) continue;
    const baseSection = (merged as unknown as Record<string, unknown>)[category];
    const mergedSection = deepMergeSection(baseSection, incoming);
    merged = { ...merged, [category]: mergedSection } as DeepPlayerSettings;
  }

  // Full-schema validation before applying; sanitize fills any gaps from defaults.
  const sanitized = sanitizeSettings(merged);
  // Never restore a private wallpaper path from backup.
  sanitized.appearance.wallpaperUri = current.appearance.wallpaperUri;
  sanitized.schemaVersion = SETTINGS_SCHEMA_VERSION;
  return sanitized;
}

function deepMergeSection(base: unknown, incoming: Record<string, unknown>): unknown {
  if (!isPlainObject(base)) return incoming;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(incoming)) {
    const child = out[k];
    out[k] = isPlainObject(child) && isPlainObject(v) ? deepMergeSection(child, v) : v;
  }
  return out;
}

/** Preview which settings would change (without applying). */
export function previewImport(
  current: DeepPlayerSettings,
  backup: Backup,
  categories?: BackupCategory[],
): ImportPreview {
  const selected = categories ?? backupCategories(backup);
  const merged = mergeBackup(current, backup, selected);
  const changes: ImportChange[] = [];

  for (const category of selected) {
    const incoming = (backup.settings as Record<string, unknown>)[category];
    if (!isPlainObject(incoming)) continue;
    const flat: { id: string; value: unknown }[] = [];
    flatten(incoming, category, flat);
    for (const { id } of flat) {
      if (id.endsWith('wallpaperUri')) continue;
      const before = getSettingById(current, id);
      const after = getSettingById(merged, id);
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        changes.push({ id, category, before, after });
      }
    }
  }

  return { backup, categories: backupCategories(backup), changes };
}

export interface ApplyImportResult {
  settings: DeepPlayerSettings;
  changed: number;
}

/**
 * Validate + merge + apply atomically. `apply` is called exactly once with the
 * complete validated settings; if it throws, existing preferences are untouched.
 * After applying, verify the new configuration (re-read + re-validate).
 */
export async function applyImport(
  current: DeepPlayerSettings,
  rawBackup: unknown,
  apply: (settings: DeepPlayerSettings) => void | Promise<void>,
  readBack: () => DeepPlayerSettings,
  categories?: BackupCategory[],
): Promise<ApplyImportResult> {
  const backup = parseBackup(rawBackup); // throws → nothing applied
  const preview = previewImport(current, backup, categories);
  const merged = mergeBackup(current, backup, categories);

  // Full validation must pass before we touch existing preferences.
  const checked = settingsSchema.safeParse(merged);
  if (!checked.success) throw new Error('Merged settings failed validation; nothing was applied.');

  // Snapshot to roll back on failure (atomicity).
  const snapshot = structuredClone(current);
  try {
    await apply(checked.data);
  } catch (err) {
    await apply(snapshot); // restore
    throw err;
  }

  // Verify the new configuration.
  const verified = settingsSchema.safeParse(readBack());
  if (!verified.success) {
    await apply(snapshot);
    throw new Error('Post-import verification failed; existing settings restored.');
  }

  return { settings: verified.data, changed: preview.changes.length };
}

/** Pick a JSON backup file with the document picker. Returns parsed JSON or null. */
export async function pickBackupFile(): Promise<unknown | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const file = new File(result.assets[0].uri);
  const text = await file.text();
  return JSON.parse(text);
}

export { parseBackup, setSettingById };
