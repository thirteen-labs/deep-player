import { router } from 'expo-router';
import {
  Bell,
  EyeClosed,
  Folder,
  MusicDoubleNote,
  NavArrowRight,
  Refresh,
  Search,
  Settings,
  ShieldCheck,
} from 'iconoir-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  AppButton,
  InfoRow,
  PermissionRow,
  Screen,
  SectionCard,
  ThemedIcon,
  TopBar,
} from '@/components/ui';
import { IconSize } from '@/constants/typography';
import { useLibraryScan } from '@/hooks/use-library-scan';
import { useSettingsPermissions } from '@/hooks/use-settings-permissions';
import { useDbStore } from '@/lib/db/store';
import { isNotificationSupported } from '@/lib/notifications';
import { openAppSettings } from '@/lib/permissions';

export default function MusicSettingsScreen() {
  const tracks = useDbStore((s) => s.tracks);
  const hiddenCount = useDbStore((s) => s.hiddenTracks.length);
  const { isScanning, scan, refresh } = useLibraryScan();
  const {
    mediaPermission,
    notificationPermission,
    pickedFilesCount,
    requestMedia,
    requestNotifications,
    pickFiles,
  } = useSettingsPermissions();

  const musicCount = tracks.filter((track) => track.mediaType !== 'video').length;

  return (
    <Screen header={<TopBar title="Music" showBack />}>
      <SectionCard title="Music library" subtitle={`${musicCount} tracks`} icon={MusicDoubleNote} iconSize={20}>
        <AppButton
          label={isScanning ? 'Scanning…' : 'Scan media library'}
          icon={Search}
          variant="ghost"
          size="small"
          disabled={isScanning}
          onPress={() => void scan('music')}
        />
        <AppButton
          label="Refresh library"
          icon={Refresh}
          variant="ghost"
          size="small"
          disabled={isScanning}
          onPress={() => void refresh()}
        />
        <InfoRow
          label="Hidden tracks"
          icon={EyeClosed}
          iconSize={22}
          subtitle="Blacklisted tracks kept out of library lists"
          value={
            <View style={styles.value}>
              <ThemedText type="body" themeColor="textSecondary">
                {hiddenCount}
              </ThemedText>
              <ThemedIcon icon={NavArrowRight} size={IconSize.md} color="textSecondary" />
            </View>
          }
          onPress={() => router.push('/settings/hidden')}
        />
      </SectionCard>

      <SectionCard title="Permissions" icon={ShieldCheck} iconSize={20}>
        <PermissionRow label="Media library" status={mediaPermission} onRequest={() => void requestMedia()} />
        <PermissionRow
          label="Notifications"
          status={notificationPermission}
          onRequest={() => void requestNotifications()}
          disabled={!isNotificationSupported()}
        />
        <InfoRow
          label="Files"
          icon={Folder}
          iconSize={22}
          value={pickedFilesCount ? `${pickedFilesCount} selected` : undefined}
          valueColor="textSecondary"
        />
        <AppButton
          label="Pick files"
          icon={Folder}
          variant="ghost"
          size="small"
          onPress={() => void pickFiles()}
        />
        <InfoRow label="Background playback" icon={Bell} iconSize={22} value="Enabled" valueColor="tint" />
        <AppButton
          label="System settings"
          icon={Settings}
          variant="ghost"
          size="small"
          onPress={() => void openAppSettings()}
        />
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
