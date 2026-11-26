/**
 * Storage layer (spec §1 storage split + §7).
 *
 * Settings persistence responsibility: **MMKV** (react-native-mmkv) for app
 * preferences. SQLite (expo-sqlite) remains for structured media data and
 * SecureStore (expo-secure-store) for secrets — those are separate modules and
 * are NOT used for UI preferences here.
 *
 * Requirement: storage error fallback. If MMKV cannot be created or any
 * read/write throws (corrupted storage, native module missing, web), we fall
 * back to an in-memory store (and localStorage on web) instead of crashing.
 */
import { Platform } from 'react-native';

export const SETTINGS_STORAGE_ID = 'deep-player-settings';
export const SETTINGS_STORAGE_KEY = 'deep-player-settings-v1';

interface KeyValueStorage {
  getString(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** Minimal sync storage compatible with zustand's createJSONStorage. */
export interface SyncStorage {
  getItem(name: string): string | null;
  setItem(name: string, value: string): void;
  removeItem(name: string): void;
}

function createInMemoryStorage(): SyncStorage {
  const map = new Map<string, string>();
  return {
    getItem: (name) => map.get(name) ?? null,
    setItem: (name, value) => {
      map.set(name, value);
    },
    removeItem: (name) => {
      map.delete(name);
    },
  };
}

function createWebStorage(): SyncStorage | null {
  if (Platform.OS !== 'web') return null;
  try {
    const store = globalThis.localStorage;
    if (!store) return null;
    const probe = '__deep_player_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return {
      getItem: (name) => {
        try {
          return store.getItem(name);
        } catch {
          return null;
        }
      },
      setItem: (name, value) => {
        try {
          store.setItem(name, value);
        } catch {
          // ignore quota / access errors
        }
      },
      removeItem: (name) => {
        try {
          store.removeItem(name);
        } catch {
          // ignore
        }
      },
    };
  } catch {
    return null;
  }
}

function createMmkvStorage(): SyncStorage | null {
  try {
    // Lazily require so a missing native module never crashes module init.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMMKV } = require('react-native-mmkv') as {
      createMMKV: (config?: { id?: string }) => KeyValueStorage;
    };
    const mmkv = createMMKV({ id: SETTINGS_STORAGE_ID });

    // Probe to detect a broken native binding early.
    const probeKey = '__deep_player_probe__';
    mmkv.set(probeKey, '1');
    mmkv.remove(probeKey);

    return {
      getItem: (name) => {
        try {
          return mmkv.getString(name) ?? null;
        } catch {
          return null;
        }
      },
      setItem: (name, value) => {
        try {
          mmkv.set(name, value);
        } catch {
          // storage error fallback: swallow, in-memory state remains source of truth
        }
      },
      removeItem: (name) => {
        try {
          mmkv.remove(name);
        } catch {
          // ignore
        }
      },
    };
  } catch {
    return null;
  }
}

let cached: SyncStorage | null = null;

/** A safe, synchronous storage adapter for zustand persist. */
export function getSettingsStorage(): SyncStorage {
  if (cached) return cached;
  const mmkv = createMmkvStorage();
  if (mmkv) {
    cached = mmkv;
    return cached;
  }
  const web = createWebStorage();
  if (web) {
    cached = web;
    return cached;
  }
  cached = createInMemoryStorage();
  return cached;
}

/** Reset the cached adapter (tests). */
export function resetSettingsStorageCache(): void {
  cached = null;
}
