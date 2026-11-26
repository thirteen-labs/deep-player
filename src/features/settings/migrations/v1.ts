/**
 * v1 migration. Schema version 1 is the initial stable schema; the job here is
 * defensive cleanup of persisted/imported data: drop unknown keys, fill missing
 * values from defaults, and clamp/repair invalid values. Unknown *future*
 * versions are rejected upstream (see migrations/index.ts) — never imported blindly.
 */
import { cloneDefaults } from '../defaults/settings.defaults';
import { settingsSchema } from '../validation/settings.schema';
import type { DeepPlayerSettings } from '../types/settings.types';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Recursively merge known keys from `input` onto `base`, ignoring unknown keys. */
function mergeKnown(base: unknown, input: unknown): unknown {
  if (!isPlainObject(base)) return input;
  if (!isPlainObject(input)) return base;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base)) {
    if (key in input) {
      out[key] = mergeKnown((base as Record<string, unknown>)[key], input[key]);
    }
  }
  return out;
}

/**
 * Best-effort sanitize: deep-merge known keys onto defaults, then validate.
 * Returns defaults on any validation failure. Never throws.
 */
export function sanitizeSettings(input: unknown): DeepPlayerSettings {
  const base = cloneDefaults();
  try {
    const merged = mergeKnown(base, input);
    const result = settingsSchema.safeParse(merged);
    if (result.success) return result.data;
  } catch {
    // fall through to per-section rescue
  }

  // Rescue valid sections individually so one bad section can't nuke the rest.
  try {
    if (isPlainObject(input)) {
      const rescued: Record<string, unknown> = { ...base };
      for (const key of Object.keys(base) as (keyof DeepPlayerSettings)[]) {
        if (key === 'schemaVersion') continue;
        if (key in input) {
          const merged = mergeKnown((base as unknown as Record<string, unknown>)[key], input[key]);
          const partial = settingsSchema.shape[key].safeParse(merged);
          if (partial.success) rescued[key] = partial.data;
        }
      }
      const full = settingsSchema.safeParse(rescued);
      if (full.success) return full.data;
    }
  } catch {
    // fall through
  }

  return base;
}

export const migrateV1 = (input: unknown): DeepPlayerSettings => sanitizeSettings(input);
