import { useCallback, useMemo, useState } from 'react';

export interface MediaSelectionApi<T extends { id: string }> {
  selectedIds: Set<string>;
  selectedItems: T[];
  selectionMode: boolean;
  count: number;
  enterSelection: (id?: string) => void;
  toggle: (id: string) => void;
  selectAll: () => void;
  clear: () => void;
  handlePress: (id: string, onDefault: () => void) => void;
  handleLongPress: (id: string) => void;
}

/** Multi-selection state that survives scrolling because it stores IDs only. */
export function useMediaSelection<T extends { id: string }>(items: T[]): MediaSelectionApi<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const enterSelection = useCallback((id?: string) => {
    setSelectionMode(true);
    setSelectedIds(id ? new Set([id]) : new Set());
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
    setSelectionMode(true);
  }, [items]);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  }, []);

  const handlePress = useCallback(
    (id: string, onDefault: () => void) => {
      if (selectionMode) toggle(id);
      else onDefault();
    },
    [selectionMode, toggle],
  );

  const handleLongPress = useCallback(
    (id: string) => {
      if (!selectionMode) enterSelection(id);
      else toggle(id);
    },
    [enterSelection, selectionMode, toggle],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );

  return {
    selectedIds,
    selectedItems,
    selectionMode,
    count: selectedIds.size,
    enterSelection,
    toggle,
    selectAll,
    clear,
    handlePress,
    handleLongPress,
  };
}
