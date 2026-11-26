import type { SQLiteDatabase } from 'expo-sqlite';

import { EQUALIZER_BANDS } from '@/stores/equalizer-store';

const KEY = 'equalizer_settings';

export type EqualizerSettings = {
  enabled: boolean;
  presetId: string;
  bands: number[];
  preamp: number;
};

async function ensureSettingsTable(db: SQLiteDatabase) {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`,
  );
}

function parseSettings(raw: string): EqualizerSettings | null {
  try {
    const value = JSON.parse(raw) as Partial<EqualizerSettings>;
    const bands = value.bands;
    if (
      typeof value.enabled !== 'boolean' ||
      typeof value.presetId !== 'string' ||
      typeof value.preamp !== 'number' ||
      !Array.isArray(bands) ||
      bands.length !== EQUALIZER_BANDS.length ||
      !bands.every((band) => typeof band === 'number' && Number.isFinite(band))
    ) {
      return null;
    }
    return { enabled: value.enabled, presetId: value.presetId, bands, preamp: value.preamp };
  } catch {
    return null;
  }
}

export async function loadEqualizerSettings(db: SQLiteDatabase): Promise<EqualizerSettings | null> {
  await ensureSettingsTable(db);
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [KEY]);
  if (!row) return null;
  return parseSettings(row.value);
}

export async function saveEqualizerSettings(
  db: SQLiteDatabase,
  settings: EqualizerSettings,
): Promise<void> {
  await ensureSettingsTable(db);
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    KEY,
    JSON.stringify(settings),
  ]);
}
