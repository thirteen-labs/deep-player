import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

export type PermissionState = 'undetermined' | 'granted' | 'denied' | 'limited' | 'unavailable';

export type AppPermission = {
  id: 'mediaLibrary' | 'notifications' | 'files';
  label: string;
  description: string;
  required: boolean;
};

export const REQUIRED_PERMISSIONS: AppPermission[] = [
  {
    id: 'mediaLibrary',
    label: 'Media library',
    description: 'Read audio and video files from your device library.',
    required: true,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Show playback and library notifications.',
    required: false,
  },
  {
    id: 'files',
    label: 'Files access',
    description: 'Pick audio/video files from device storage.',
    required: true,
  },
];

function normalizeMedia(status: MediaLibrary.PermissionResponse | null): PermissionState {
  if (!status) return 'undetermined';
  if (status.granted) return status.accessPrivileges === 'limited' ? 'limited' : 'granted';
  return status.canAskAgain ? 'undetermined' : 'denied';
}

function normalizeNotifications(status: Notifications.PermissionResponse | null): PermissionState {
  if (!status) return 'undetermined';
  if (status.granted) return 'granted';
  return status.canAskAgain ? 'undetermined' : 'denied';
}

export async function getMediaLibraryPermission(): Promise<PermissionState> {
  try {
    const status = await MediaLibrary.getPermissionsAsync();
    return normalizeMedia(status);
  } catch {
    return 'unavailable';
  }
}

export async function requestMediaLibraryPermission(): Promise<PermissionState> {
  try {
    const status = await MediaLibrary.requestPermissionsAsync();
    return normalizeMedia(status);
  } catch {
    return 'unavailable';
  }
}

export async function getNotificationPermission(): Promise<PermissionState> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const status = await Notifications.getPermissionsAsync();
    return normalizeNotifications(status);
  } catch {
    return 'unavailable';
  }
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const status = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return normalizeNotifications(status);
  } catch {
    return 'unavailable';
  }
}

export async function pickMediaFiles(): Promise<DocumentPicker.DocumentPickerAsset[]> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: ['audio/*', 'video/*'],
    });
    if (result.canceled) return [];
    return result.assets;
  } catch {
    return [];
  }
}

export async function openAppSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    // no-op: settings not available on this platform
  }
}