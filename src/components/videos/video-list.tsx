import { FlashList } from '@shopify/flash-list';
import { Heart, MediaVideo, Play } from 'iconoir-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CollectionTile, IconButton, MediaArtwork } from '@/components/ui';
import type { CollectionItem } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useLayoutStore } from '@/stores/layout-store';
import type { Track } from '@/lib/db/schema';
import { formatTime } from '@/utils/format';

type VideoListProps = {
  videos: Track[];
  positions: Record<string, number>;
  onPress: (track: Track) => void;
  onFavorite?: (track: Track) => void;
};

/** Shared video list used by the Videos tab and video folders. */
export function VideoList({ videos, positions, onPress, onFavorite }: VideoListProps) {
  const isGrid = useLayoutStore((s) => s.listLayout) === 'grid';

  if (isGrid) {
    const items: CollectionItem[] = videos.map((track) => ({
      key: track.id,
      label: track.title || track.uri,
      subtitle: videoSubtitle(track, positions[track.id] ?? 0),
      icon: MediaVideo,
      artworkUri: track.artworkUri,
      onPress: () => onPress(track),
    }));

    return (
      <FlashList
        data={items}
        keyExtractor={(item) => item.key}
        numColumns={2}
        renderItem={({ item }) => <CollectionTile item={item} />}
      />
    );
  }

  return (
    <FlashList
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <VideoRow
          track={item}
          position={positions[item.id] ?? 0}
          onPress={() => onPress(item)}
          onFavorite={onFavorite ? () => onFavorite(item) : undefined}
        />
      )}
    />
  );
}

function videoSubtitle(track: Track, position: number) {
  const duration = track.durationMs > 0 ? formatTime(track.durationMs / 1000) : '0:00';
  return position > 10 ? `Resume ${formatTime(position)} · ${duration}` : duration;
}

function VideoRow({
  track,
  position,
  onPress,
  onFavorite,
}: {
  track: Track;
  position: number;
  onPress: () => void;
  onFavorite?: () => void;
}) {
  const subtitle = videoSubtitle(track, position);

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.content}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Play ${track.title}`}>
        <MediaArtwork uri={track.artworkUri} size={44} radius={Spacing.two} fallbackIcon={MediaVideo} />
        <View style={styles.copy}>
          <ThemedText type="label" numberOfLines={1}>
            {track.title || track.uri}
          </ThemedText>
          <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        </View>
      </Pressable>
      <IconButton
        icon={Play}
        accessibilityLabel={`Play ${track.title}`}
        size={36}
        iconSize={18}
        variant="plain"
        onPress={onPress}
      />
      {onFavorite ? (
        <IconButton
          icon={Heart}
          accessibilityLabel="Favorite"
          size={36}
          iconSize={18}
          variant="plain"
          active={track.favorite}
          onPress={onFavorite}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.half,
    marginBottom: Spacing.one,
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
