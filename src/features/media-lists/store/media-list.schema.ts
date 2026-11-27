/** Runtime validation for persisted media-list preferences and smart lists. */
import { z } from 'zod';

import type { SmartRuleGroup } from '../types';

export const MEDIA_LIST_STORAGE_KEY = 'deep-player-media-lists-v1';
export const MEDIA_LIST_SCHEMA_VERSION = 1;

const mediaSectionSchema = z.enum(['smart', 'music', 'video']);
const mediaTypeSchema = z.enum(['music', 'video']);
const listLayoutSchema = z.enum(['grid', 'list']);
const sortDirectionSchema = z.enum(['asc', 'desc']);
const mediaSortFieldSchema = z.enum([
  'title',
  'artist',
  'album',
  'duration',
  'dateAdded',
  'dateModified',
  'lastPlayedAt',
  'playCount',
  'size',
  'resolution',
  'favoritesFirst',
]);

const listPreferenceSchema = z.object({
  layout: listLayoutSchema,
  columns: z.number().int().min(1).max(6).optional(),
});

const sortConfigSchema = z.object({
  field: mediaSortFieldSchema,
  direction: sortDirectionSchema,
});

const mediaFilterSchema = z.object({
  mediaTypes: z.array(mediaTypeSchema).optional(),
  folderIds: z.array(z.string()).optional(),
  favoritesOnly: z.boolean().optional(),
  completed: z.boolean().optional(),
  minDuration: z.number().optional(),
  maxDuration: z.number().optional(),
  minSize: z.number().optional(),
  maxSize: z.number().optional(),
  formats: z.array(z.string()).optional(),
  resolutions: z.array(z.string()).optional(),
  dateAddedFrom: z.number().optional(),
  dateAddedTo: z.number().optional(),
});

const smartRuleOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'contains',
  'greater_than',
  'less_than',
  'before',
  'after',
  'is_empty',
]);

const smartRuleSchema = z.object({
  field: z.string().min(1),
  operator: smartRuleOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
});

const smartRuleGroupSchema: z.ZodType<SmartRuleGroup> = z.lazy(() =>
  z.object({
    operator: z.enum(['AND', 'OR']),
    rules: z.array(smartRuleSchema),
    groups: z.array(smartRuleGroupSchema).optional(),
  }),
);

const smartListSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string().optional(),
  section: mediaSectionSchema,
  mediaTypes: z.array(mediaTypeSchema),
  conditions: smartRuleGroupSchema,
  sort: sortConfigSchema.optional(),
  artworkUri: z.string().optional(),
  icon: z.string().optional(),
  isSystem: z.boolean(),
  isPinned: z.boolean(),
  isHidden: z.boolean(),
  sortBy: z.string(),
  sortDirection: sortDirectionSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});

const layoutPreferencesSchema = z.object({
  smart: z.object({ layout: z.literal('grid'), columns: z.number().int().min(1).max(6) }),
  music: z.object({ layout: z.literal('list') }),
  video: z.object({ layout: z.literal('grid'), columns: z.number().int().min(1).max(6) }),
});

const preferencesSchema = z.object({
  layout: layoutPreferencesSchema,
  rememberCustomLayouts: z.boolean(),
  lastOpenedSection: mediaSectionSchema,
  defaultSort: z.record(mediaSectionSchema, z.string()),
});

export const persistedMediaListsSchema = z.object({
  preferences: preferencesSchema,
  layoutsByList: z.record(z.string(), listPreferenceSchema),
  sortsByList: z.record(z.string(), sortConfigSchema),
  filtersByList: z.record(z.string(), mediaFilterSchema),
  customSmartLists: z.array(smartListSchema),
  hiddenSmartListIds: z.array(z.string()),
  pinnedSmartListIds: z.array(z.string()),
  smartListOrder: z.array(z.string()),
});

export type PersistedMediaLists = z.infer<typeof persistedMediaListsSchema>;

export function parsePersistedMediaLists(value: unknown): PersistedMediaLists | null {
  const result = persistedMediaListsSchema.safeParse(value);
  return result.success ? result.data : null;
}
