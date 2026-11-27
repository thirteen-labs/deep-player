/**
 * Shared media query engine.
 *
 * It operates on metadata already indexed in the local SQLite store; it never
 * scans the filesystem. Pure functions keep adapters and presentation
 * components interchangeable and make sort/search/filter behavior testable.
 */
import {
  durationSeconds,
  resolutionLabel,
  type MediaFilter,
  type MediaItem,
  type MediaListContext,
  type MediaQuery,
  type MediaQueryResult,
  type MediaSortField,
  type SortConfig,
} from '../types';

const COMPLETION_TOLERANCE_SECONDS = 30;

function normalize(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function fileName(uri: string): string {
  const clean = uri.split(/[?#]/, 1)[0];
  return decodeURIComponent(clean.split('/').pop() ?? clean);
}

function folderName(uri: string): string {
  const parts = uri.split(/[?#]/, 1)[0].split('/');
  return decodeURIComponent(parts.at(-2) ?? '');
}

function extension(item: MediaItem): string {
  const name = fileName(item.uri);
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
}

function playbackPosition(item: MediaItem, context: MediaListContext): number {
  return Math.max(0, context.playbackPositions?.[item.id] ?? 0);
}

function isCompleted(item: MediaItem, context: MediaListContext): boolean {
  const duration = durationSeconds(item);
  return duration > 0 && playbackPosition(item, context) >= duration - COMPLETION_TOLERANCE_SECONDS;
}

/** Case-insensitive metadata search over the fields Deep Player indexes. */
export function matchesSearch(item: MediaItem, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;

  return [
    item.title,
    item.artist,
    item.album,
    item.albumArtist,
    item.genre,
    item.mimeType,
    fileName(item.uri),
    folderName(item.uri),
  ].some((value) => normalize(value).includes(q));
}

export function applySearch(items: MediaItem[], query: string | undefined): MediaItem[] {
  if (!query?.trim()) return items;
  return items.filter((item) => matchesSearch(item, query));
}

/** Compose every supported filter field. Empty/undefined filters are no-ops. */
export function applyMediaFilter(
  items: MediaItem[],
  filter: MediaFilter | undefined,
  context: MediaListContext = {},
): MediaItem[] {
  if (!filter) return items;

  const mediaTypes = filter.mediaTypes?.map(normalize);
  const formats = filter.formats?.map(normalize);
  const resolutions = filter.resolutions?.map(normalize);

  return items.filter((item) => {
    if (mediaTypes?.length && !mediaTypes.includes(normalize(item.mediaType))) return false;

    if (filter.folderIds?.length) {
      const ids = context.folderIdsByTrack?.[item.id] ?? [];
      if (!filter.folderIds.some((id) => ids.includes(id))) return false;
    }

    if (filter.favoritesOnly != null && item.favorite !== filter.favoritesOnly) return false;
    if (filter.completed != null && isCompleted(item, context) !== filter.completed) return false;

    const duration = durationSeconds(item);
    if (filter.minDuration != null && duration < filter.minDuration) return false;
    if (filter.maxDuration != null && duration > filter.maxDuration) return false;

    if (filter.minSize != null && item.size < filter.minSize) return false;
    if (filter.maxSize != null && item.size > filter.maxSize) return false;

    if (formats?.length) {
      const formatMatch = formats.some(
        (format) => normalize(item.mimeType).includes(format) || extension(item).includes(format),
      );
      if (!formatMatch) return false;
    }

    if (resolutions?.length) {
      const resolution = normalize(resolutionLabel(item));
      if (!resolution || !resolutions.some((value) => resolution.includes(value))) return false;
    }

    if (filter.dateAddedFrom != null && item.addedAt < filter.dateAddedFrom) return false;
    if (filter.dateAddedTo != null && item.addedAt > filter.dateAddedTo) return false;

    return true;
  });
}

function sortValue(
  item: MediaItem,
  field: MediaSortField,
  context: MediaListContext,
): string | number | undefined {
  switch (field) {
    case 'title':
      return normalize(item.title || fileName(item.uri));
    case 'artist':
      return normalize(item.artist || item.albumArtist);
    case 'album':
      return normalize(item.album);
    case 'duration':
      return item.durationMs;
    case 'dateAdded':
      return item.addedAt;
    case 'dateModified':
      return item.dateModified ?? item.addedAt;
    case 'lastPlayedAt':
      return context.lastPlayedAt?.[item.id] ?? 0;
    case 'playCount':
      return context.playCounts?.[item.id] ?? item.playCount ?? 0;
    case 'size':
      return item.size;
    case 'resolution': {
      if (!item.width || !item.height) return undefined;
      return item.width * item.height;
    }
    default:
      return undefined;
  }
}

function compareValues(a: string | number | undefined, b: string | number | undefined): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
  return Number(a) - Number(b);
}

/**
 * Deterministic sort: primary field + direction, then media ID as a stable
 * secondary key so equal values never reorder between renders.
 */
export function sortMedia(
  items: MediaItem[],
  sort: SortConfig | undefined,
  context: MediaListContext = {},
): MediaItem[] {
  if (!sort) return items;

  const direction = sort.direction === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    // `favoritesFirst` is a semantic sort used by the existing Music tab. It
    // always puts favorites ahead of the rest, then falls back to title.
    if (sort.field === 'favoritesFirst') {
      const favorites = Number(b.favorite) - Number(a.favorite);
      if (favorites !== 0) return favorites;
      return compareValues(normalize(a.title), normalize(b.title)) || a.id.localeCompare(b.id);
    }

    const primary = compareValues(sortValue(a, sort.field, context), sortValue(b, sort.field, context));
    if (primary !== 0) return primary * direction;
    return a.id.localeCompare(b.id);
  });
}

export function queryMedia(
  items: MediaItem[],
  query: MediaQuery = {},
  context: MediaListContext = {},
): MediaQueryResult {
  const filtered = applySearch(items, query.search);
  const matched = applyMediaFilter(filtered, query.filter, context);
  const sorted = sortMedia(matched, query.sort, context);

  const offset = Math.max(0, query.offset ?? 0);
  const hasMore = query.limit != null ? offset + query.limit < sorted.length : false;
  const paged = query.limit != null ? sorted.slice(offset, offset + query.limit) : sorted.slice(offset);

  return { items: paged, total: sorted.length, hasMore };
}

/** Total duration in seconds for a list of media items. */
export function totalDuration(items: MediaItem[]): number {
  return items.reduce((sum, item) => sum + durationSeconds(item), 0);
}
