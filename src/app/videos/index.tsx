import { FlashList } from '@shopify/flash-list';
import { Film, Heart, Play } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { MediaArtwork } from '@/components/ui/media-artwork';
import { EmptyState, LoadingState, Screen, SectionCard, TopBar } from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { formatTime } from '@/utils/format';
import { Spacing } from '@/constants/theme';
import { useDbStore, type Track } from '@/lib/db/store';
import { useSortStore } from '@/stores/sort-store';
import { sortTracks } from '@/utils/track-sorting';
import { scanVideos } from '@/lib/library/scan';

export default function VideosScreen() {
  const tracks = useDbStore((s) => s.tracks);
  const universalSort = useSortStore((s) => s.universalSort);
  const videos = useMemo(
    () => sortTracks(tracks.filter((t) => t.mediaType === 'video'), universalSort),
    [tracks, universalSort],
  );
  const isLoaded = useDbStore((s) => s.isLoaded);
  const load = useDbStore((s) => s.load);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);
  const positions = useDbStore((s) => s.playbackPositions);

  useEffect(() => {
    if (isLoaded) return;
    void (async () => {
      try {
        await scanVideos();
        await load();
      } catch (error) {
        console.warn('Video scan failed', error);
      }
    })();
  }, [isLoaded, load]);

  return (
    <Screen header={<TopBar title="Videos" showUniversalSort />}>
      {!isLoaded ? <LoadingState message="Loading videos…" /> : null}
      <SectionCard>
        {videos.length === 0 ? (
          <EmptyState
            icon={Film}
            message="No videos yet"
            description="Your video library and player will show up here."
          />
        ) : (
          <FlashList
            data={videos}
            renderItem={({ item }) => (
              <VideoRow
                track={item}
                position={positions[item.id] ?? 0}
                onPlay={() => router.push(`/videos/${encodeURIComponent(item.id)}`)}
                onFavorite={() => void toggleFavorite(item.id)}
              />
            )}
          />
        )}
      </SectionCard>
    </Screen>
  );
}

function VideoRow({
  track,
  position,
  onPlay,
  onFavorite,
}: {
  track: Track;
  position: number;
  onPlay: () => void;
  onFavorite: () => void;
}) {
  const duration = track.durationMs > 0 ? formatTime(track.durationMs / 1000) : '0:00';
  const subtitle = position > 10 ? `Resume ${formatTime(position)} · ${duration}` : duration;
  return (
    <View style={styles.row}>
      <Pressable style={styles.content} onPress={onPlay} accessibilityRole="button" accessibilityLabel={`Play ${track.title}`}>
        <MediaArtwork uri={track.artworkUri} size={44} radius={Spacing.two} fallbackIcon={Film} />
        <View style={styles.copy}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {track.title || track.uri}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        </View>
      </Pressable>
      <IconButton icon={Play} accessibilityLabel={`Play ${track.title}`} size={36} iconSize={18} variant="plain" onPress={onPlay} />
      <IconButton icon={Heart} accessibilityLabel="Favorite" size={36} iconSize={18} variant="plain" active={track.favorite} onPress={onFavorite} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  copy: {
    flex: 1,
    gap: Spacing.half,
  },
});
