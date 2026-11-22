import type { LucideIcon } from 'lucide-react-native';

import { useSortSheetStore, type SortSheetKind } from '@/stores/sort-sheet-store';

import { AppButton } from './app-button';

type SortMenuButtonProps = {
  label: string;
  icon: LucideIcon;
  kind: Exclude<SortSheetKind, null>;
};

/** Small trigger that opens the root-level sort sheet. */
export function SortMenuButton({ label, icon, kind }: SortMenuButtonProps) {
  const openSheet = useSortSheetStore((s) => s.openSheet);

  return (
    <AppButton
      label={label}
      icon={icon}
      variant="ghost"
      size="small"
      onPress={() => openSheet(kind)}
    />
  );
}
