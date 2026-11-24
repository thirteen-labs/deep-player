import { EmptyState, FolderRow, LoadingState, SectionCard } from '@/components/ui';
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
  return (
    <SectionCard title={title} subtitle={subtitle}>
      {isLoading ? <LoadingState message={`Loading ${title.toLowerCase()}…`} /> : null}
      {folders.map((folder) => (
        <FolderRow
          key={folder.id}
          folder={folder}
          subtitle={`${counts.get(folder.id) ?? 0} ${unit}`}
          onPress={() => onOpen(folder.id)}
        />
      ))}
      {!isLoading && folders.length === 0 ? (
        <EmptyState message={emptyMessage} description={emptyDescription} />
      ) : null}
    </SectionCard>
  );
}
