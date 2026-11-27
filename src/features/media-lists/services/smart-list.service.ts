/**
 * Smart-list evaluation. A smart list is a saved query, never a copy of media
 * rows. System lists use the same rule engine as user-created lists, with a
 * protected `isSystem` flag.
 */
import {
  durationSeconds,
  resolutionLabel,
  type MediaItem,
  type MediaListContext,
  type MediaSortField,
  type MediaType,
  type SortConfig,
  type SmartList,
  type SmartRule,
  type SmartRuleGroup,
  type SmartRuleValue,
} from '../types';
import { sortMedia } from './media-query.service';

function isEmpty(value: unknown): boolean {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0);
}

function valuesEqual(left: unknown, right: SmartRuleValue): boolean {
  if (typeof right === 'boolean') return Boolean(left) === right;
  if (typeof right === 'number') return Number(left) === right;
  return String(left ?? '').toLowerCase() === String(right ?? '').toLowerCase();
}

function getRuleValue(
  item: MediaItem,
  field: string,
  context: MediaListContext,
): string | number | boolean | undefined {
  switch (field) {
    case 'title':
      return item.title;
    case 'artist':
      return item.artist || item.albumArtist;
    case 'album':
      return item.album;
    case 'albumArtist':
      return item.albumArtist;
    case 'genre':
      return item.genre;
    case 'mediaType':
      return item.mediaType;
    case 'duration':
      return durationSeconds(item);
    case 'size':
      return item.size;
    case 'favorite':
      return item.favorite;
    case 'playCount':
      return context.playCounts?.[item.id] ?? item.playCount ?? 0;
    case 'lastPlayedAt':
      return context.lastPlayedAt?.[item.id] ?? undefined;
    case 'addedAt':
    case 'dateAdded':
      return item.addedAt;
    case 'playbackPosition':
      return context.playbackPositions?.[item.id] ?? 0;
    case 'folderId':
      return (context.folderIdsByTrack?.[item.id] ?? []).join(',');
    case 'resolution':
      return resolutionLabel(item) ?? undefined;
    case 'inProgress': {
      const duration = durationSeconds(item);
      const position = context.playbackPositions?.[item.id] ?? 0;
      return duration > 0 && position > 10 && position < duration - 30;
    }
    case 'isCompleted': {
      const duration = durationSeconds(item);
      const position = context.playbackPositions?.[item.id] ?? 0;
      return duration > 0 && position >= duration - 30;
    }
    default:
      return undefined;
  }
}

export function evaluateSmartRule(
  item: MediaItem,
  rule: SmartRule,
  context: MediaListContext = {},
): boolean {
  const value = getRuleValue(item, rule.field, context);
  const expected = rule.value;

  switch (rule.operator) {
    case 'is_empty':
      return isEmpty(value);
    case 'equals':
      return valuesEqual(value, expected);
    case 'not_equals':
      return !valuesEqual(value, expected);
    case 'contains':
      return String(value ?? '')
        .toLowerCase()
        .includes(String(expected ?? '').toLowerCase());
    case 'greater_than':
      return Number(value ?? 0) > Number(expected ?? 0);
    case 'less_than':
      return Number(value ?? 0) < Number(expected ?? 0);
    case 'before':
      return Number(value ?? 0) < Number(expected ?? 0);
    case 'after':
      return Number(value ?? 0) > Number(expected ?? 0);
    default:
      return true;
  }
}

export function evaluateSmartRuleGroup(
  item: MediaItem,
  group: SmartRuleGroup,
  context: MediaListContext = {},
): boolean {
  const results = [
    ...group.rules.map((rule) => evaluateSmartRule(item, rule, context)),
    ...(group.groups ?? []).map((child) => evaluateSmartRuleGroup(item, child, context)),
  ];

  if (results.length === 0) return true;
  return group.operator === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

function sortFromList(list: SmartList): SortConfig | undefined {
  if (list.sort) return list.sort;
  const field = list.sortBy as MediaSortField;
  if (!field) return undefined;
  return { field, direction: list.sortDirection === 'desc' ? 'desc' : 'asc' };
}

/** Evaluate a saved smart list against the current library snapshot. */
export function evaluateSmartList(
  items: MediaItem[],
  list: SmartList,
  context: MediaListContext = {},
): MediaItem[] {
  const allowed = new Set<string>(list.mediaTypes.map((type) => type.toLowerCase()));
  const candidates = allowed.size
    ? items.filter((item) => allowed.has(item.mediaType.toLowerCase()))
    : items;
  const matched = candidates.filter((item) => evaluateSmartRuleGroup(item, list.conditions, context));
  return sortMedia(matched, sortFromList(list), context);
}

function rule(field: string, operator: SmartRule['operator'], value?: SmartRuleValue): SmartRule {
  return { field, operator, value };
}

function systemList(
  id: string,
  name: string,
  mediaTypes: MediaType[],
  conditions: SmartRuleGroup,
  sort: SortConfig,
  extras: Partial<SmartList> = {},
): SmartList {
  return {
    id,
    name,
    description: undefined,
    section: mediaTypes.includes('video') ? 'video' : 'music',
    mediaTypes,
    conditions,
    sort,
    isSystem: true,
    isPinned: false,
    isHidden: false,
    sortBy: sort.field,
    sortDirection: sort.direction,
    createdAt: 0,
    updatedAt: 0,
    ...extras,
  };
}

const DESC_DATE: SortConfig = { field: 'dateAdded', direction: 'desc' };
const ASC_TITLE: SortConfig = { field: 'title', direction: 'asc' };
const DESC_PLAY_COUNT: SortConfig = { field: 'playCount', direction: 'desc' };

/** Built-in collections, ordered as the product spec lists them. */
export function getSystemSmartLists(): SmartList[] {
  return [
    systemList('recently-added', 'Recently Added', ['music', 'video'], { operator: 'AND', rules: [] }, DESC_DATE),
    systemList(
      'recently-played',
      'Recently Played',
      ['music', 'video'],
      { operator: 'AND', rules: [rule('lastPlayedAt', 'greater_than', 0)] },
      { field: 'lastPlayedAt', direction: 'desc' },
    ),
    systemList(
      'most-played',
      'Most Played',
      ['music', 'video'],
      { operator: 'AND', rules: [rule('playCount', 'greater_than', 0)] },
      DESC_PLAY_COUNT,
    ),
    systemList(
      'favorites',
      'Favorites',
      ['music', 'video'],
      { operator: 'AND', rules: [rule('favorite', 'equals', true)] },
      ASC_TITLE,
    ),
    systemList(
      'continue-watching',
      'Continue Watching',
      ['video'],
      {
        operator: 'AND',
        rules: [rule('mediaType', 'equals', 'video'), rule('inProgress', 'equals', true)],
      },
      { field: 'lastPlayedAt', direction: 'desc' },
    ),
    systemList(
      'continue-listening',
      'Continue Listening',
      ['music'],
      {
        operator: 'AND',
        rules: [rule('mediaType', 'equals', 'music'), rule('inProgress', 'equals', true)],
      },
      { field: 'lastPlayedAt', direction: 'desc' },
    ),
    systemList(
      'unwatched',
      'Unwatched',
      ['video'],
      {
        operator: 'AND',
        rules: [rule('mediaType', 'equals', 'video'), rule('lastPlayedAt', 'is_empty')],
      },
      DESC_DATE,
    ),
    systemList(
      'unorganized',
      'Unorganized',
      ['music', 'video'],
      { operator: 'AND', rules: [rule('folderId', 'is_empty')] },
      ASC_TITLE,
    ),
    systemList(
      'long-videos',
      'Long Videos',
      ['video'],
      {
        operator: 'AND',
        rules: [rule('mediaType', 'equals', 'video'), rule('duration', 'greater_than', 1200)],
      },
      { field: 'duration', direction: 'desc' },
    ),
    systemList(
      'music-videos',
      'Music Videos',
      ['video'],
      {
        operator: 'OR',
        rules: [],
        groups: [
          { operator: 'AND', rules: [rule('mediaType', 'equals', 'video'), rule('title', 'contains', 'music video')] },
          { operator: 'AND', rules: [rule('mediaType', 'equals', 'video'), rule('genre', 'contains', 'music')] },
        ],
      },
      ASC_TITLE,
    ),
  ];
}

export function findSmartList(lists: SmartList[], id: string): SmartList | undefined {
  return lists.find((list) => list.id === id);
}

export function isDestructiveSmartList(list: SmartList): boolean {
  return list.isSystem;
}
