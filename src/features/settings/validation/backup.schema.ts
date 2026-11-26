/** Backup envelope validation (spec §9). */
import { z } from 'zod';

import { BACKUP_CATEGORIES } from '../types/settings.enums';
import { SETTINGS_SCHEMA_VERSION } from '../types/settings.types';
import { sectionSchemas } from './settings.schema';

export const BACKUP_APP = 'Deep Player';
export const BACKUP_TYPE = 'settings';
export const BACKUP_VERSION = 1;

/** Per-category partial schemas (each section optional + partial for partial restoration). */
const partialSettings = z.object({
  appearance: sectionSchemas.appearance.partial().optional(),
  playback: sectionSchemas.playback.partial().optional(),
  video: sectionSchemas.video.partial().optional(),
  audio: sectionSchemas.audio.partial().optional(),
  folders: sectionSchemas.folders.partial().optional(),
  player: sectionSchemas.player.partial().optional(),
  storage: sectionSchemas.storage.partial().optional(),
  privacy: sectionSchemas.privacy.partial().optional(),
  notifications: sectionSchemas.notifications.partial().optional(),
  accessibility: sectionSchemas.accessibility.partial().optional(),
  advanced: sectionSchemas.advanced.partial().optional(),
});

// video.subtitles nested partial
const partialVideo = sectionSchemas.video
  .extend({ subtitles: sectionSchemas.video.shape.subtitles.partial() })
  .partial()
  .optional();

export const backupSettingsSchema = partialSettings.extend({ video: partialVideo });

export const backupSchema = z.object({
  app: z.literal(BACKUP_APP),
  backupType: z.literal(BACKUP_TYPE),
  backupVersion: z.number().int().nonnegative(),
  settingsSchemaVersion: z.number().int().nonnegative(),
  exportedAt: z.string(),
  settings: backupSettingsSchema,
});

export type Backup = z.infer<typeof backupSchema>;
export type BackupCategory = (typeof BACKUP_CATEGORIES)[number];

/** Verify application identity + envelope. Returns parsed backup or throws. */
export function parseBackup(input: unknown): Backup {
  const parsed = backupSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Invalid backup: ' + JSON.stringify(parsed.error.issues));
  }
  // Unknown future schema versions should not be imported blindly.
  if (parsed.data.settingsSchemaVersion > SETTINGS_SCHEMA_VERSION) {
    throw new Error(
      `Backup uses a newer settings schema (${parsed.data.settingsSchemaVersion}); update Deep Player before importing.`,
    );
  }
  return parsed.data;
}

export { BACKUP_CATEGORIES };
