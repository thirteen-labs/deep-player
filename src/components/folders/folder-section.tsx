import { useMemo } from 'react';

import {
  CollectionList,
  EmptyState,
  folderIcon,
  LoadingState,
  SectionCard,
  SmartIndicator,
} from '@/components/ui';
import type { CollectionItem } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { Folder } from '@/lib/db/schema';

type FolderSectionProps = {
  title: string;
  subtitle?: string;
  folders: Folder[];
  counts: Map<string, number>;
  unit: 'tracks' | 'videos';
  emptyMessage: string;
  emptyDescription?: string;
  isLoading?: boolean;
  onOpen: (id: string) => void;
};

/** One titled group of folders/smartlists, shared by every folder category. */
export function FolderSection({
  title,
  subtitle,
  folders,
  counts,
  unit,
  emptyMessage,
  emptyDescription,
  isLoading = false,
  onOpen,
}: FolderSectionProps) {
  const items = useMemo<CollectionItem[]>(
    () =>
      folders.map((folder) => ({
        key: folder.id,
        label: folder.name,
        subtitle: `${counts.get(folder.id) ?? 0} ${unit}`,
        value: folder.smartlistType ? <SmartIndicator /> : undefined,
        icon: folderIcon(folder),
        onPress: () => onOpen(folder.id),
      })),
    [folders, counts, unit, onOpen],
  );

  return (
    <SectionCard title={title} subtitle={subtitle} flush padding={Spacing.half} gap={Spacing.half}>
      {isLoading ? <LoadingState message={`Loading ${title.toLowerCase()}…`} /> : null}
      {!isLoading && folders.length > 0 ? <CollectionList items={items} /> : null}
      {!isLoading && folders.length === 0 ? (
        <EmptyState message={emptyMessage} description={emptyDescription} />
      ) : null}
    </SectionCard>
  );
}
