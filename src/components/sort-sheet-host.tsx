import { useEffect, useRef, type ComponentRef } from 'react';

import { InfoRow } from '@/components/ui/info-row';
import {
  SMART_LIST_SORT_OPTIONS,
  UNIVERSAL_SORT_OPTIONS,
  useSortStore,
  type SmartListSort,
  type UniversalSort,
} from '@/stores/sort-store';
import { useSortSheetStore } from '@/stores/sort-sheet-store';

import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';

/**
 * Single root-level sheet for both sort modes. Mounted once in the root layout
 * so it is never clipped inside a screen's ScrollView.
 */
export function SortSheetHost() {
  const open = useSortSheetStore((s) => s.open);
  const closeSheet = useSortSheetStore((s) => s.closeSheet);

  const universalSort = useSortStore((s) => s.universalSort);
  const setUniversalSort = useSortStore((s) => s.setUniversalSort);
  const smartListSort = useSortStore((s) => s.smartListSort);
  const setSmartListSort = useSortStore((s) => s.setSmartListSort);

  const sheetRef = useRef<ComponentRef<typeof AppBottomSheet>>(null);
  const isUniversal = open === 'universal';
  const options = isUniversal ? UNIVERSAL_SORT_OPTIONS : SMART_LIST_SORT_OPTIONS;
  const value: string = isUniversal ? universalSort : smartListSort;

  useEffect(() => {
    if (open) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  const handleSelect = (selected: string) => {
    if (isUniversal) {
      setUniversalSort(selected as UniversalSort);
    } else {
      setSmartListSort(selected as SmartListSort);
    }
    closeSheet();
  };

  return (
    <AppBottomSheet
      ref={sheetRef}
      title={isUniversal ? 'Sort by' : 'Sort smart lists'}
      snapPoints={['45%', '80%']}
      index={-1}
      onClose={closeSheet}>
      {options.map((option) => (
        <InfoRow
          key={option.value}
          label={option.label}
          value={option.value === value ? '✓' : undefined}
          valueColor="tint"
          onPress={() => handleSelect(option.value)}
        />
      ))}
    </AppBottomSheet>
  );
}
