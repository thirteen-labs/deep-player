import { Image } from 'expo-image';
import { MusicDoubleNote as MusicIcon } from 'iconoir-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Radius } from '@/constants/typography';
import { useSettingsStore } from '@/features/settings/store/settings.store';

import { ThemedIcon, type AppIcon } from './themed-icon';

type MediaArtworkProps = {
  uri?: string | null;
  size?: number;
  radius?: number;
  /** Shown when there is no artwork. Defaults to a music note. */
  fallbackIcon?: AppIcon;
  style?: StyleProp<ViewStyle>;
};

/** Square media artwork with a themed fallback when no image is available. */
export function MediaArtwork({
  uri,
  size = 160,
  radius = Radius.huge,
  fallbackIcon,
  style,
}: MediaArtworkProps) {
  const dimension = { width: size, height: size, borderRadius: radius };
  const hideSensitive = useSettingsStore((s) => s.settings.privacy.hideSensitiveThumbnails);
  const visibleUri = hideSensitive ? null : uri;

  return (
    <View style={[styles.artwork, dimension, style]}>
      {visibleUri ? (
        <Image source={{ uri: visibleUri }} style={styles.fill} contentFit="cover" transition={200} />
      ) : (
        <ThemedView type="backgroundSelected" style={[styles.fill, styles.fallback]}>
          <ThemedIcon
            icon={fallbackIcon ?? MusicIcon}
            size={Math.round(size * 0.4)}
            color="textSecondary"
          />
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  artwork: {
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
