import { MediaVideo, Folder, MusicDoubleNote, Sparks } from 'iconoir-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import type { Folder as LibraryFolder } from '@/lib/db/schema';

import { InfoRow } from './info-row';
import type { AppIcon } from './themed-icon';

type FolderRowProps = {
  folder: LibraryFolder;
  /** Override the default "Music" / "Video" subtitle. */
  subtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Icon that represents a folder or generated smart list. */
export function folderIcon(folder: LibraryFolder): AppIcon {
  if (folder.smartlistType === 'series') return Sparks;
  if (folder.mediaType === 'video') return MediaVideo;
  return folder.kind === 'smartlist' ? MusicDoubleNote : Folder;
}

/** A library folder/smartlist row. */
export function FolderRow({ folder, subtitle, onPress, style }: FolderRowProps) {
  const isVideo = folder.mediaType === 'video';

  return (
    <InfoRow
      label={folder.name}
      subtitle={subtitle ?? (isVideo ? 'Video' : 'Music')}
      value={folder.kind === 'smartlist' ? 'Smartlist' : undefined}
      valueColor="textSecondary"
      icon={folderIcon(folder)}
      onPress={onPress}
      style={style}
    />
  );
}
