import type { SQLiteDatabase } from 'expo-sqlite';

import { FONT_SCALES, type FontScale } from '@/constants/typography';

const KEY = 'font_size';
const VALID_SCALES = new Set<string>(Object.keys(FONT_SCALES));

async function ensureSettingsTable(db: SQLiteDatabase) {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`,
  );
  return db;
}

export function isFontScale(value: unknown): value is FontScale {
  return typeof value === 'string' && VALID_SCALES.has(value);
}

export async function loadFontScale(db: SQLiteDatabase): Promise<FontScale | null> {
  await ensureSettingsTable(db);
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [KEY],
  );
  if (!row) return null;
  return isFontScale(row.value) ? row.value : null;
}

export async function saveFontScale(db: SQLiteDatabase, value: FontScale): Promise<void> {
  await ensureSettingsTable(db);
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [KEY, value],
  );
}
