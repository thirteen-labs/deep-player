import { Film, Music2, Play } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ContinueItem } from '@/utils/continue';
import { formatTime } from '@/utils/format';

import { GlassView } from './glass-view';
import { MediaArtwork } from './media-artwork';
import { PressableScale } from './pressable-scale';
import { ThemedIcon } from './themed-icon';

type ContinueCardProps = {
  item: ContinueItem;
  mediaType: 'music' | 'video';
  onPress: () => void;
};

/** Compact resume card used by the Home dashboard. */
export function ContinueCard({ item, mediaType, onPress }: ContinueCardProps) {
  const theme = useTheme();
  const isVideo = mediaType === 'video';
  const remaining = item.duration > 0 ? Math.max(0, item.duration - item.position) : 0;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Resume ${item.track.title || 'media'}`}
      onPress={onPress}
      style={styles.card}>
      <GlassView style={styles.glass}>
        <View style={styles.artworkWrap}>
          <MediaArtwork
            uri={item.track.artworkUri}
            size={144}
            radius={14}
            fallbackIcon={isVideo ? Film : Music2}
          />
          <View style={[styles.playBadge, { backgroundColor: theme.tint }]}>
            <ThemedIcon icon={Play} size={13} color="background" strokeWidth={2.5} />
          </View>
        </View>
        <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
          {item.track.title || 'Untitled'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.subtitle}>
          {remaining > 0 ? `${formatTime(remaining)} left` : `${formatTime(item.position)} in`}
        </ThemedText>
        <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.fill,
              { width: `${Math.max(4, item.progress * 100)}%`, backgroundColor: theme.tint },
            ]}
          />
        </View>
      </GlassView>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
  },
  glass: {
    borderRadius: 18,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  artworkWrap: {
    alignSelf: 'center',
    marginBottom: Spacing.one,
  },
  playBadge: {
    position: 'absolute',
    right: Spacing.two,
    bottom: Spacing.two,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: Spacing.half,
  },
  subtitle: {
    marginBottom: Spacing.one,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
