/** Convert the existing SQLite store snapshot into engine context. */
import type { FolderTrackRow } from '@/lib/db/store';

import type { MediaListContext, MediaSection, MediaType } from '../types';

export interface LibraryContextInput {
  playbackPositions?: Record<string, number>;
  lastPlayedAt?: Record<string, number>;
  folderTracks?: FolderTrackRow[];
}

/** Build a detached context so the engine never mutates store state. */
export function buildMediaContext(input: LibraryContextInput = {}): MediaListContext {
  const folderIdsByTrack: Record<string, string[]> = {};
  for (const row of input.folderTracks ?? []) {
    const ids = folderIdsByTrack[row.trackId] ?? [];
    ids.push(row.folderId);
    folderIdsByTrack[row.trackId] = ids;
  }

  return {
    playbackPositions: input.playbackPositions ?? {},
    lastPlayedAt: input.lastPlayedAt ?? {},
    folderIdsByTrack,
  };
}

/** The Music tab treats unknown media types as audio, matching the old filter. */
export function sectionMediaTypes(section: MediaSection): MediaType[] {
  if (section === 'video') return ['video'];
  if (section === 'music') return ['music'];
  return ['music', 'video'];
}
