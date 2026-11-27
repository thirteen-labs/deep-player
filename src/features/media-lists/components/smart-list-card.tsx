import { Heart, MediaVideo, MusicDoubleNote, Sparks } from 'iconoir-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassView, MediaArtwork, PressableScale, ThemedIcon } from '@/components/ui';
import type { AppIcon } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { Radius } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

import { selectArtwork } from '../services';
import type { MediaItem, MediaListContext, SmartList } from '../types';

function iconForList(list: SmartList): AppIcon {
  if (list.id === 'favorites') return Heart;
  if (list.mediaTypes.includes('video') && !list.mediaTypes.includes('music')) return MediaVideo;
  if (list.mediaTypes.includes('music') && !list.mediaTypes.includes('video')) return MusicDoubleNote;
  return Sparks;
}

function countLabel(list: SmartList, count: number): string {
  const noun = list.mediaTypes.includes('video')
    ? list.mediaTypes.includes('music')
      ? 'items'
      : 'videos'
    : 'songs';
  return `${count} ${noun}`;
}

type SmartListCardProps = {
  list: SmartList;
  items: MediaItem[];
  context: MediaListContext;
  hidden?: boolean;
  onPress: () => void;
};

/** Visual card for a query-based collection. Never stores its own media rows. */
export function SmartListCard({ list, items, context, hidden = false, onPress }: SmartListCardProps) {
  const theme = useTheme();
  const artwork = selectArtwork(items, context, list.artworkUri, 4);
  const icon = iconForList(list);
  const showCollage = !artwork.primaryUri && artwork.collageUris.length > 1;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Open ${list.name}`}
      onPress={onPress}
      style={styles.press}>
      <GlassView style={styles.card}>
        <View style={styles.artwork}>
          {showCollage ? (
            <View style={styles.collage}>
              {artwork.collageUris.slice(0, 4).map((uri, index) => (
                <MediaArtwork
                  key={`${uri}-${index}`}
                  uri={uri}
                  size={48}
                  radius={0}
                  fallbackIcon={icon}
                  style={styles.collageTile}
                />
              ))}
            </View>
          ) : (
            <MediaArtwork
              uri={artwork.primaryUri}
              size={96}
              radius={Radius.md}
              fallbackIcon={icon}
              style={styles.primaryArtwork}
            />
          )}
          {list.isPinned ? (
            <View style={[styles.pinBadge, { backgroundColor: withAlpha(theme.tint, 0.9) }]}>
              <ThemedIcon icon={Sparks} size={14} color="background" />
            </View>
          ) : null}
          {!list.isSystem ? (
            <View style={[styles.customBadge, { backgroundColor: withAlpha(theme.background, 0.75) }]}>
              <ThemedText type="caption" themeColor="textSecondary">
                Custom
              </ThemedText>
            </View>
          ) : null}
        </View>

        <ThemedText type="label" numberOfLines={1} style={styles.name}>
          {list.name}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
          {countLabel(list, items.length)}
          {hidden ? ' · Hidden' : ''}
        </ThemedText>
      </GlassView>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  press: {
    flex: 1,
    minWidth: 0,
    padding: Spacing.half,
  },
  card: {
    padding: Spacing.two,
    borderRadius: Radius.lg,
    gap: Spacing.one,
  },
  artwork: {
    position: 'relative',
    width: '100%',
    height: 96,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  primaryArtwork: {
    width: '100%',
    height: 96,
  },
  collage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: 96,
  },
  collageTile: {
    width: '50%',
    height: '50%',
  },
  pinBadge: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBadge: {
    position: 'absolute',
    left: Spacing.one,
    bottom: Spacing.one,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.half,
    borderRadius: Radius.sm,
  },
  name: {
    marginTop: Spacing.half,
  },
});
