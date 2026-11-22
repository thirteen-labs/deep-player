import { create } from 'zustand';

export type SortSheetKind = 'universal' | 'smart' | null;

type SortSheetStore = {
  open: SortSheetKind;
  openSheet: (kind: Exclude<SortSheetKind, null>) => void;
  closeSheet: () => void;
};

/** Controls the single root-level sort sheet, so it is never clipped by a screen ScrollView. */
export const useSortSheetStore = create<SortSheetStore>((set) => ({
  open: null,
  openSheet: (open) => set({ open }),
  closeSheet: () => set({ open: null }),
}));
