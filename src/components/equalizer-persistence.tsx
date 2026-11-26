import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

import { loadEqualizerSettings, saveEqualizerSettings } from '@/db/equalizer-preference';
import { useEqualizerStore } from '@/stores/equalizer-store';

/** Loads the saved equalizer curve once, then persists every change. */
export function EqualizerPersistence() {
  const db = useSQLiteContext();
  const enabled = useEqualizerStore((s) => s.enabled);
  const presetId = useEqualizerStore((s) => s.presetId);
  const bands = useEqualizerStore((s) => s.bands);
  const preamp = useEqualizerStore((s) => s.preamp);
  const hydrate = useEqualizerStore((s) => s.hydrate);
  const hydrated = useEqualizerStore((s) => s.hydrated);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await loadEqualizerSettings(db);
        if (!cancelled) hydrate(saved);
      } catch {
        // A broken settings row should never block playback.
        if (!cancelled) hydrate(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, hydrate]);

  // Skip the render that hydration itself triggers.
  const savedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    const snapshot = JSON.stringify({ enabled, presetId, bands, preamp });
    if (savedRef.current === null) {
      savedRef.current = snapshot;
      return;
    }
    if (savedRef.current === snapshot) return;
    savedRef.current = snapshot;
    saveEqualizerSettings(db, { enabled, presetId, bands, preamp }).catch(() => {
      // Persistence failures should not break the equalizer UI.
    });
  }, [db, hydrated, enabled, presetId, bands, preamp]);

  return null;
}
