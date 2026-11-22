import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

import { AppIconPicker } from '@/components/app-icon-picker';
import { ThemePicker } from '@/components/theme-picker';
import { AppButton, InfoRow, PermissionRow, Screen, SectionCard, TopBar } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { env } from '@/config/env';
import { useDbStore } from '@/lib/db/store';
import { isNotificationSupported } from '@/lib/notifications';
import {
  getMediaLibraryPermission,
  getNotificationPermission,
  openAppSettings,
  PermissionState,
  pickMediaFiles,
  requestMediaLibraryPermission,
  requestNotificationPermission,
} from '@/lib/permissions';

export default function UserScreen() {
  const load = useDbStore((s) => s.load);

  const [mediaPermission, setMediaPermission] = useState<PermissionState>('undetermined');
  const [notificationPermission, setNotificationPermission] = useState<PermissionState>('undetermined');
  const [pickedFilesCount, setPickedFilesCount] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      const [media, notif] = await Promise.all([getMediaLibraryPermission(), getNotificationPermission()]);
      setMediaPermission(media);
      setNotificationPermission(notif);
    })();
  }, []);

  const handleMediaRequest = async () => {
    setMediaPermission(await requestMediaLibraryPermission());
  };

  const handleNotificationRequest = async () => {
    setNotificationPermission(await requestNotificationPermission());
  };

  const handlePickFiles = async () => {
    const files = await pickMediaFiles();
    if (files.length > 0) setPickedFilesCount(files.length);
  };

  return (
    <Screen header={<TopBar title="User" />}>
      <SectionCard title="Profile" gap={Spacing.two}>
        <InfoRow label="Name" value="Deep Player" />
        <InfoRow label="App version" value={Constants.expoConfig?.version ?? '—'} valueColor="textSecondary" />
        <InfoRow label="Environment" value={env.appEnv} valueColor="textSecondary" />
      </SectionCard>

      <ThemePicker />

      <AppIconPicker />

      <SectionCard title="Permissions">
        <PermissionRow label="Media library" status={mediaPermission} onRequest={handleMediaRequest} />
        <PermissionRow
          label="Notifications"
          status={notificationPermission}
          onRequest={handleNotificationRequest}
          disabled={!isNotificationSupported()}
          disabledHint={!isNotificationSupported() ? 'Unavailable on this platform/config' : undefined}
        />
        <InfoRow
          label="Files access"
          value={pickedFilesCount ? `${pickedFilesCount} file(s) selected` : 'Pick audio/video files'}
          valueColor="textSecondary"
        />
        <AppButton label="Pick files" variant="ghost" size="small" onPress={() => void handlePickFiles()} />
        <InfoRow label="Background playback" value="Enabled" valueColor="tint" />
        <AppButton label="Open system settings" variant="ghost" size="small" onPress={() => void openAppSettings()} />
      </SectionCard>

      <SectionCard title="Library">
        <AppButton label="Refresh library" variant="ghost" size="small" onPress={() => void load()} />
      </SectionCard>
    </Screen>
  );
}
