import { router } from 'expo-router';
import {
  Heart,
  InfoCircle,
  Link,
  MediaVideo,
  MessageText,
  MoreHoriz,
  MusicDoubleNote,
  NavArrowRight,
  Palette,
  Playlist,
  Safe,
  Settings,
  Sparks,
} from 'iconoir-react-native';
import { StyleSheet, View } from 'react-native';

import { SettingsTile } from '@/components/settings/settings-tile';
import {
  InfoRow,
  Screen,
  SectionCard,
  ThemedIcon,
  TopBar,
  type AppIcon,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { IconSize } from '@/constants/typography';

const QUICK_ACCESS: {
  label: string;
  icon: AppIcon;
  href:
    | '/settings/private-vault'
    | '/settings/video-playlist'
    | '/settings/stream-url'
    | '/settings/video-history';
}[] = [
  { label: 'Private Vault', icon: Safe, href: '/settings/private-vault' },
  { label: 'Video Playlist', icon: Playlist, href: '/settings/video-playlist' },
  { label: 'Stream URL', icon: Link, href: '/settings/stream-url' },
  { label: 'Video History', icon: MediaVideo, href: '/settings/video-history' },
];

function Chevron() {
  return <ThemedIcon icon={NavArrowRight} size={IconSize.md} color="textSecondary" />;
}

export default function UserScreen() {
  return (
    <Screen header={<TopBar title="Settings" showNotifications />}>
      <SectionCard
        title="Quick access"
        icon={Sparks}
        iconSize={IconSize.md}
        titleVariant="callout"
        headerDivider>
        <View style={styles.grid}>
          {[0, 2].map((start) => (
            <View style={styles.gridRow} key={start}>
              {QUICK_ACCESS.slice(start, start + 2).map((item) => (
                <SettingsTile
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  onPress={() => router.push(item.href)}
                />
              ))}
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="Preferences"
        icon={Settings}
        iconSize={IconSize.md}
        titleVariant="callout"
        headerDivider
        gap={Spacing.two + Spacing.one}>
        <InfoRow
          label="Appearance"
          icon={Palette}
          iconSize={IconSize.lg}
          value={<Chevron />}
          onPress={() => router.push('/settings/appearance')}
        />
        <InfoRow
          label="Music"
          icon={MusicDoubleNote}
          iconSize={IconSize.lg}
          value={<Chevron />}
          onPress={() => router.push('/settings/music')}
        />
        <InfoRow
          label="Video"
          icon={MediaVideo}
          iconSize={IconSize.lg}
          value={<Chevron />}
          onPress={() => router.push('/settings/video')}
        />
      </SectionCard>

      <SectionCard
        title="More"
        icon={MoreHoriz}
        iconSize={IconSize.md}
        titleVariant="callout"
        headerDivider
        gap={Spacing.two + Spacing.one}>
        <InfoRow
          label="Become a supporter"
          icon={Heart}
          iconSize={IconSize.lg}
          value={<Chevron />}
          onPress={() => router.push('/settings/become-supporter')}
        />
        <InfoRow
          label="Send feedback"
          icon={MessageText}
          iconSize={IconSize.lg}
          value={<Chevron />}
          onPress={() => router.push('/settings/send-feedback')}
        />
        <InfoRow
          label="About & more"
          icon={InfoCircle}
          iconSize={IconSize.lg}
          value={<Chevron />}
          onPress={() => router.push('/settings/about-more')}
        />
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.three,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.three,
  },
});
