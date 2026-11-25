import { useEffect, useState } from 'react';

import {
  getMediaLibraryPermission,
  getNotificationPermission,
  pickMediaFiles,
  requestMediaLibraryPermission,
  requestNotificationPermission,
  type PermissionState,
} from '@/lib/permissions';

/** Permission state and actions shared by the settings sub-screens. */
export function useSettingsPermissions() {
  const [mediaPermission, setMediaPermission] = useState<PermissionState>('undetermined');
  const [notificationPermission, setNotificationPermission] = useState<PermissionState>('undetermined');
  const [pickedFilesCount, setPickedFilesCount] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      const [media, notifications] = await Promise.all([
        getMediaLibraryPermission(),
        getNotificationPermission(),
      ]);
      setMediaPermission(media);
      setNotificationPermission(notifications);
    })();
  }, []);

  const requestMedia = async () => setMediaPermission(await requestMediaLibraryPermission());
  const requestNotifications = async () =>
    setNotificationPermission(await requestNotificationPermission());
  const pickFiles = async () => {
    const files = await pickMediaFiles();
    if (files.length > 0) setPickedFilesCount(files.length);
  };

  return {
    mediaPermission,
    notificationPermission,
    pickedFilesCount,
    requestMedia,
    requestNotifications,
    pickFiles,
  };
}
