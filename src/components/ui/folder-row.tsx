import { Film, Folder, Music2 } from 'lucide-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import type { Folder as LibraryFolder } from '@/lib/db/schema';

import { InfoRow } from './info-row';

type FolderRowProps = {
  folder: LibraryFolder;
  /** Override the default "Music" / "Video" subtitle. */
  subtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** A library folder/smartlist row. */
export function FolderRow({ folder, subtitle, onPress, style }: FolderRowProps) {
  const isVideo = folder.mediaType === 'video';

  return (
    <InfoRow
      label={folder.name}
      subtitle={subtitle ?? (isVideo ? 'Video' : 'Music')}
      value={folder.kind === 'smartlist' ? 'Smartlist' : undefined}
      valueColor="textSecondary"
      icon={isVideo ? Film : folder.kind === 'smartlist' ? Music2 : Folder}
      onPress={onPress}
      style={style}
    />
  );
}
