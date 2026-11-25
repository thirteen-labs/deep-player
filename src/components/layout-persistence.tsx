import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

import { loadListLayout, saveListLayout } from '@/db/list-layout-preference';
import { useLayoutStore, type ListLayout } from '@/stores/layout-store';

/** Hydrates and persists the list layout preference. */
export function LayoutPersistence() {
  const db = useSQLiteContext();
  const listLayout = useLayoutStore((s) => s.listLayout);
  const hydrate = useLayoutStore((s) => s.hydrate);
  const loadedRef = useRef(false);
  const savedRef = useRef<ListLayout | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await loadListLayout(db);
        if (cancelled) return;
        const next = saved ?? useLayoutStore.getState().listLayout;
        savedRef.current = next;
        hydrate(next);
      } catch {
        if (!cancelled) {
          const next = useLayoutStore.getState().listLayout;
          savedRef.current = next;
          hydrate(next);
        }
      } finally {
        if (!cancelled) loadedRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, hydrate]);

  useEffect(() => {
    if (!loadedRef.current || listLayout === savedRef.current) return;
    savedRef.current = listLayout;
    saveListLayout(db, listLayout).catch(() => {
      // Persistence failures should not block layout changes.
    });
  }, [db, listLayout]);

  return null;
}
