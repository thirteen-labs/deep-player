import { ChevronUp, Music2, Pause, Play, SkipForward } from 'lucide-react-native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemeOverrideProvider } from '@/components/theme-override';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useArtworkPalette } from '@/hooks/use-artwork-palette';
import { useTheme } from '@/hooks/use-theme';
import { usePlayerStore } from '@/stores/player-store';

import { EmptyState } from './empty-state';
import { GlassView } from './glass-view';
import { IconButton } from './icon-button';
import { MediaArtwork } from './media-artwork';
import { PressableScale } from './pressable-scale';

/**
 * Compact now-playing bar. The full transport lives in `/player` so browsing
 * the library never has to scroll past a giant player card.
 */
export function NowPlayingCard() {
  const track = usePlayerStore((s) => s.track);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const theme = useTheme();
  const artworkPalette = useArtworkPalette(track?.artworkUri);
  const cardTheme = artworkPalette ?? theme;

  if (!track) {
    return (
      <ThemeOverrideProvider theme={cardTheme}>
        <GlassView style={styles.card}>
          <EmptyState
            icon={Music2}
            message="Nothing playing"
            description="Select a track from the library to start playing."
          />
        </GlassView>
      </ThemeOverrideProvider>
    );
  }

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <ThemeOverrideProvider theme={cardTheme}>
      <GlassView style={styles.card}>
        <View style={styles.row}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Open full player"
            onPress={() => router.push('/player')}
            style={styles.info}
          >
            <MediaArtwork uri={track.artworkUri} size={54} radius={Spacing.two} />
            <View style={styles.copy}>
              <ThemedText type="smallBold" numberOfLines={1}>
                {track.title || track.uri}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {track.artist || 'Unknown artist'}
              </ThemedText>
            </View>
            <ChevronUp size={18} color={cardTheme.textSecondary} />
          </PressableScale>
          <IconButton
            icon={isPlaying ? Pause : Play}
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            variant="secondary"
            size={40}
            iconSize={18}
            onPress={togglePlay}
          />
          <IconButton
            icon={SkipForward}
            accessibilityLabel="Next track"
            size={40}
            iconSize={18}
            onPress={next}
          />
        </View>
        <View style={[styles.progressTrack, { backgroundColor: cardTheme.backgroundSelected }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: cardTheme.tint },
            ]}
          />
        </View>
      </GlassView>
    </ThemeOverrideProvider>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.two,
    borderRadius: 22,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
  },
  copy: {
    flex: 1,
    gap: Spacing.half,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
