import { useEffect } from 'react';

import { useLibraryCacheWarming } from '@/hooks/use-library-cache-warming';
import { useDbStore } from '@/lib/db/store';

/**
 * Keeps the offline cache warm for the whole library, not just the tab that
 * happens to be mounted. Music and video tracks are warmed through the same
 * bounded queue once the store has loaded.
 */
export function LibraryCacheWarmer() {
  const tracks = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const load = useDbStore((s) => s.load);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  useLibraryCacheWarming(tracks);
  return null;
}
