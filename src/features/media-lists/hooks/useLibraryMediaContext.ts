import { useMemo } from 'react';

import { buildMediaContext } from '../adapters';
import { useDbStore } from '@/lib/db/store';

/** Media-list context backed by the canonical SQLite playback/folder state. */
export function useLibraryMediaContext() {
  const playbackPositions = useDbStore((s) => s.playbackPositions);
  const lastPlayedAt = useDbStore((s) => s.lastPlayedAt);
  const folderTracks = useDbStore((s) => s.folderTracks);

  return useMemo(
    () => buildMediaContext({ playbackPositions, lastPlayedAt, folderTracks }),
    [folderTracks, lastPlayedAt, playbackPositions],
  );
}
