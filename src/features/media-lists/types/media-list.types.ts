/**
 * Shared media-list domain types.
 *
 * Deep Player already owns the canonical media record in `Track`. The list
 * architecture deliberately aliases that record instead of introducing a
 * second media library. Durations in query/filter inputs are seconds; Track
 * stores `durationMs`, so conversions happen at the engine boundary.
 */
import type { Track } from '@/lib/db/schema';

/** Sections exposed by the unified list architecture. */
export type MediaSection = 'smart' | 'music' | 'video';

/** Shared list-level states used by loading/empty/error presentations. */
export type MediaListStateKind =
  | 'loading'
  | 'error'
  | 'empty'
  | 'search'
  | 'permission'
  | 'missing'
  | 'no-thumbnail';

/** Keep the existing database vocabulary (`music` | `video`) in engine APIs. */
export type MediaType = 'music' | 'video';

/**
 * The single media record used by every presentation. Optional fields are
 * supplied by platform adapters when the media store exposes them; the list
 * engine never requires a schema migration to consume them.
 */
export type MediaItem = Track & {
  dateModified?: number;
  playCount?: number;
  width?: number;
  height?: number;
  resolution?: string;
};

export type SortDirection = 'asc' | 'desc';

export type MediaSortField =
  | 'title'
  | 'artist'
  | 'album'
  | 'duration'
  | 'dateAdded'
  | 'dateModified'
  | 'lastPlayedAt'
  | 'playCount'
  | 'size'
  | 'resolution'
  | 'favoritesFirst';

export interface SortConfig {
  field: MediaSortField;
  direction: SortDirection;
}

/**
 * Composable filters. All media lists share this shape; adapters decide which
 * fields are meaningful for their section.
 */
export interface MediaFilter {
  mediaTypes?: MediaType[];
  folderIds?: string[];

  favoritesOnly?: boolean;
  completed?: boolean;

  /** Seconds. */
  minDuration?: number;
  /** Seconds. */
  maxDuration?: number;

  /** Bytes. */
  minSize?: number;
  /** Bytes. */
  maxSize?: number;

  formats?: string[];
  resolutions?: string[];

  /** Unix milliseconds. */
  dateAddedFrom?: number;
  /** Unix milliseconds. */
  dateAddedTo?: number;
}

/**
 * Playback-derived facts are supplied by the caller so list queries never
 * mutate the media library record itself.
 */
export interface MediaListContext {
  /** Seconds. */
  playbackPositions?: Record<string, number>;
  /** Unix milliseconds. */
  lastPlayedAt?: Record<string, number>;
  playCounts?: Record<string, number>;
  folderIdsByTrack?: Record<string, string[]>;
}

export interface MediaQuery {
  /** Case-insensitive metadata search. */
  search?: string;
  filter?: MediaFilter;
  sort?: SortConfig;
  offset?: number;
  limit?: number;
}

export interface MediaQueryResult<T extends MediaItem = MediaItem> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export const DEFAULT_SORT: Record<MediaSection, SortConfig> = {
  smart: { field: 'title', direction: 'asc' },
  music: { field: 'title', direction: 'asc' },
  video: { field: 'dateAdded', direction: 'desc' },
};

export const EMPTY_FILTER: MediaFilter = {};

export function isVideoItem(item: MediaItem): boolean {
  return item.mediaType === 'video';
}

export function isAudioItem(item: MediaItem): boolean {
  return item.mediaType === 'music';
}

export function durationSeconds(item: MediaItem): number {
  return Math.max(0, item.durationMs) / 1000;
}

export function resolutionLabel(item: MediaItem): string | null {
  if (item.resolution) return item.resolution;
  if (item.width && item.height) return `${item.width}x${item.height}`;
  return null;
}
