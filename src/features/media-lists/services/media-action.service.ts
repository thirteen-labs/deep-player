/**
 * Capability-aware action descriptors shared by all list presentations.
 * Execution stays in presentation/store layers so navigation and confirmation
 * dialogs remain platform-appropriate.
 */
import { isAudioItem, type MediaItem } from '../types';

export type MediaActionId =
  | 'play'
  | 'playNext'
  | 'addToQueue'
  | 'favorite'
  | 'addToPlaylist'
  | 'addToFolder'
  | 'details'
  | 'share'
  | 'delete'
  | 'viewAlbum'
  | 'viewArtist'
  | 'editMetadata'
  | 'videoDetails'
  | 'moveToFolder'
  | 'rename';

export interface MediaAction {
  id: MediaActionId;
  label: string;
  destructive?: boolean;
  requiresConfirmation?: boolean;
}

const COMMON_ACTIONS: MediaAction[] = [
  { id: 'play', label: 'Play' },
  { id: 'playNext', label: 'Play Next' },
  { id: 'addToQueue', label: 'Add to Queue' },
  { id: 'favorite', label: 'Favorite' },
  { id: 'details', label: 'Details' },
  { id: 'share', label: 'Share' },
  { id: 'delete', label: 'Delete', destructive: true, requiresConfirmation: true },
];

const AUDIO_ACTIONS: MediaAction[] = [
  { id: 'viewArtist', label: 'View Artist' },
  { id: 'viewAlbum', label: 'View Album' },
  { id: 'addToPlaylist', label: 'Add to Playlist' },
  { id: 'editMetadata', label: 'Edit Metadata' },
];

const VIDEO_ACTIONS: MediaAction[] = [
  { id: 'moveToFolder', label: 'Move to Folder' },
  { id: 'addToFolder', label: 'Add to Folder' },
  { id: 'rename', label: 'Rename' },
  { id: 'videoDetails', label: 'Video Details' },
];

export function getMediaActions(item: MediaItem): MediaAction[] {
  return isAudioItem(item) ? [...COMMON_ACTIONS, ...AUDIO_ACTIONS] : [...COMMON_ACTIONS, ...VIDEO_ACTIONS];
}

export function deleteConfirmationMessage(items: MediaItem[]): string {
  const count = items.length;
  const noun = count === 1 ? 'item' : 'items';
  return `Remove ${count} ${noun} from the Deep Player library? Files on your device are not deleted.`;
}

export function deleteFileConfirmationMessage(items: MediaItem[]): string {
  const count = items.length;
  const noun = count === 1 ? 'item' : 'items';
  return `Permanently delete ${count} ${noun} from your device? This cannot be undone.`;
}
