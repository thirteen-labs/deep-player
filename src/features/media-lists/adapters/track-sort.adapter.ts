/** Bridge the existing Music sort bar to the unified sort model. */
import type { TrackSortKey } from '@/utils/track-sorting';

import type { SortConfig } from '../types';

export function trackSortKeyToConfig(key: TrackSortKey): SortConfig {
  switch (key) {
    case 'title-asc':
      return { field: 'title', direction: 'asc' };
    case 'title-desc':
      return { field: 'title', direction: 'desc' };
    case 'artist-asc':
      return { field: 'artist', direction: 'asc' };
    case 'artist-desc':
      return { field: 'artist', direction: 'desc' };
    case 'album-asc':
      return { field: 'album', direction: 'asc' };
    case 'recently-added':
      return { field: 'dateAdded', direction: 'desc' };
    case 'duration-desc':
      return { field: 'duration', direction: 'desc' };
    case 'size-desc':
      return { field: 'size', direction: 'desc' };
    case 'favorites-first':
      return { field: 'favoritesFirst', direction: 'asc' };
    default:
      return { field: 'title', direction: 'asc' };
  }
}

export function sortConfigToTrackSortKey(sort: SortConfig): TrackSortKey {
  if (sort.field === 'favoritesFirst') return 'favorites-first';

  const key = `${sort.field}-${sort.direction}` as TrackSortKey;
  const known: TrackSortKey[] = [
    'title-asc',
    'title-desc',
    'artist-asc',
    'artist-desc',
    'album-asc',
    'duration-desc',
    'size-desc',
  ];
  if (known.includes(key)) return key;
  if (sort.field === 'dateAdded' && sort.direction === 'desc') return 'recently-added';
  return 'title-asc';
}
