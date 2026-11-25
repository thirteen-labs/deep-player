import type { SQLiteDatabase } from 'expo-sqlite';

import type { ListLayout } from '@/stores/layout-store';

const KEY = 'list_layout';
const VALID_LAYOUTS = new Set<string>(['flex', 'grid']);

async function ensureSettingsTable(db: SQLiteDatabase) {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`,
  );
  return db;
}

export function isListLayout(value: unknown): value is ListLayout {
  return typeof value === 'string' && VALID_LAYOUTS.has(value);
}

export async function loadListLayout(db: SQLiteDatabase): Promise<ListLayout | null> {
  await ensureSettingsTable(db);
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [KEY],
  );
  if (!row) return null;
  return isListLayout(row.value) ? row.value : null;
}

export async function saveListLayout(db: SQLiteDatabase, value: ListLayout): Promise<void> {
  await ensureSettingsTable(db);
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [KEY, value],
  );
}
