import type { Folder } from '@/lib/db/schema';
import type { SmartListSort } from '@/stores/sort-store';

/** Sorts folders/smartlists for the folders screen. */
export function sortFolders(folders: Folder[], sort: SmartListSort): Folder[] {
  const result = [...folders];
  switch (sort) {
    case 'recent':
      return result.sort((a, b) => b.createdAt - a.createdAt);
    case 'type':
      return result.sort(
        (a, b) =>
          a.kind.localeCompare(b.kind) ||
          a.mediaType.localeCompare(b.mediaType) ||
          a.name.localeCompare(b.name),
      );
    case 'name':
    default:
      return result.sort((a, b) => a.name.localeCompare(b.name));
  }
}
