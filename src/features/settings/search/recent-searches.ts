/** Offline recent-search history stored in a dedicated MMKV instance. */
import { createMMKV } from 'react-native-mmkv';

const STORAGE_KEY = 'recent';
const MAX_RECENT = 8;

let mmkv: ReturnType<typeof createMMKV> | null = null;

function storage() {
  if (!mmkv) {
    try {
      mmkv = createMMKV({ id: 'deep-player-settings-search' });
    } catch {
      mmkv = null;
    }
  }
  return mmkv;
}

export function getRecentSearches(): string[] {
  try {
    const raw = storage()?.getString(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  const clean = query.trim();
  if (!clean) return;
  const next = [clean, ...getRecentSearches().filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(
    0,
    MAX_RECENT,
  );
  try {
    storage()?.set(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Recent searches are best-effort only.
  }
}

export function clearRecentSearches(): void {
  try {
    storage()?.remove(STORAGE_KEY);
  } catch {
    // ignore
  }
}
