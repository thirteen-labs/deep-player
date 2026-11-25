import type { SQLiteDatabase } from 'expo-sqlite';

import { THEME_NAMES, type ThemePreference } from '@/constants/theme';

export const THEME_DB_NAME = 'deep-player.db';

const THEME_KEY = 'theme_preference';
const VALID_PREFERENCES = new Set<string>(THEME_NAMES);

export async function initThemeDb(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`
  );
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && VALID_PREFERENCES.has(value);
}

export async function loadThemePreference(db: SQLiteDatabase): Promise<ThemePreference | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [THEME_KEY]
  );
  if (!row) return null;
  return isThemePreference(row.value) ? row.value : null;
}

export async function saveThemePreference(db: SQLiteDatabase, preference: ThemePreference): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [THEME_KEY, preference]
  );
}