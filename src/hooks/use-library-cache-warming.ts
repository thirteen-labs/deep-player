import { useEffect, useRef } from 'react';

import { cacheArtwork, cacheTrack } from '@/lib/library/cache';
import { useDbStore, type Track } from '@/lib/db/store';
import { mapLimit } from '@/utils/async';

/**
 * Warms the offline cache in the background, once per track id.
 * Bounded concurrency and a cancellation flag prevent repeated download
 * storms when the library store updates (which used to re-trigger the effect).
 */
export function useLibraryCacheWarming(tracks: Track[]) {
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    const pending = tracks.filter((track) => !processedRef.current.has(track.id));
    for (const track of pending) processedRef.current.add(track.id);

    void mapLimit(
      pending,
      3,
      async (track) => {
        if (!active) return;
        const store = useDbStore.getState();

        if (!track.localUri) {
          const localUri = await cacheTrack(track);
          if (!active) return;
          if (localUri && localUri !== track.localUri) {
            await store.setTrackLocalUri(track.id, localUri);
          }
        }

        if (track.artworkUri && /^https?:\/\//.test(track.artworkUri)) {
          const artworkUri = await cacheArtwork(track);
          if (!active) return;
          if (artworkUri && artworkUri !== track.artworkUri) {
            await useDbStore.getState().setTrackArtworkUri(track.id, artworkUri);
          }
        }
      },
      () => active,
    );

    return () => {
      active = false;
    };
  }, [tracks]);
}
