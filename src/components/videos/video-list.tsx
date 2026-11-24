import { FlashList } from '@shopify/flash-list';
import { Heart, MediaVideo, Play } from 'iconoir-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton, MediaArtwork } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { Track } from '@/lib/db/schema';
import { formatTime } from '@/utils/format';

type VideoListProps = {
  videos: Track[];
  positions: Record<string, number>;
  onPress: (track: Track) => void;
  onFavorite?: (track: Track) => void;
};

/** Shared video row list used by the Videos tab and video folders. */
export function VideoList({ videos, positions, onPress, onFavorite }: VideoListProps) {
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
  const duration = track.durationMs > 0 ? formatTime(track.durationMs / 1000) : '0:00';
  const subtitle = position > 10 ? `Resume ${formatTime(position)} · ${duration}` : duration;

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.content}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Play ${track.title}`}>
        <MediaArtwork uri={track.artworkUri} size={44} radius={Spacing.two} fallbackIcon={MediaVideo} />
        <View style={styles.copy}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {track.title || track.uri}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
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
