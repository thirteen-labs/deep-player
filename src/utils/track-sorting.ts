import type { Track } from '@/lib/db/schema';

export type TrackSortKey =
  | 'title-asc'
  | 'title-desc'
  | 'artist-asc'
  | 'artist-desc'
  | 'album-asc'
  | 'recently-added'
  | 'duration-desc'
  | 'favorites-first';

export const TRACK_SORT_OPTIONS: { key: TrackSortKey; label: string }[] = [
  { key: 'title-asc', label: 'Title A-Z' },
  { key: 'title-desc', label: 'Title Z-A' },
  { key: 'artist-asc', label: 'Artist A-Z' },
  { key: 'artist-desc', label: 'Artist Z-A' },
  { key: 'album-asc', label: 'Album A-Z' },
  { key: 'recently-added', label: 'Recently added' },
  { key: 'duration-desc', label: 'Duration' },
  { key: 'favorites-first', label: 'Favorites first' },
];

export function sortTracks(tracks: Track[], sortKey: TrackSortKey): Track[] {
  const items = [...tracks];
  const byText = (a?: string | null, b?: string | null) =>
    (a || '').localeCompare(b || '', undefined, { sensitivity: 'base' });

  switch (sortKey) {
    case 'title-asc':
      return items.sort((a, b) => byText(a.title, b.title));
    case 'title-desc':
      return items.sort((a, b) => byText(b.title, a.title));
    case 'artist-asc':
      return items.sort((a, b) => byText(a.artist || a.albumArtist, b.artist || b.albumArtist) || byText(a.title, b.title));
    case 'artist-desc':
      return items.sort((a, b) => byText(b.artist || b.albumArtist, a.artist || a.albumArtist) || byText(a.title, b.title));
    case 'album-asc':
      return items.sort((a, b) => byText(a.album, b.album) || byText(a.title, b.title));
    case 'recently-added':
      return items.sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
    case 'duration-desc':
      return items.sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0));
    case 'favorites-first':
      return items.sort((a, b) => Number(b.favorite) - Number(a.favorite) || byText(a.title, b.title));
    default:
      return items;
  }
}