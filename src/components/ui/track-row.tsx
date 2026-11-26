import { Check, HeartSolid, MoreHoriz, MusicDoubleNote as MusicIcon } from 'iconoir-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Track } from '@/lib/db/schema';

import { IconButton } from './icon-button';
import { MediaArtwork } from './media-artwork';
import { PressableScale } from './pressable-scale';
import { ThemedIcon } from './themed-icon';

type TrackRowProps = {
  track: Track;
  index?: number;
  active?: boolean;
  selected?: boolean;
  selectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  /** Opens the shared track options sheet. */
  onMorePress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Compact library track row with artwork, metadata and a track-options button. */
export function TrackRow({
  track,
  index,
  active = false,
  selected = false,
  selectionMode = false,
  onPress,
  onLongPress,
  onMorePress,
  style,
}: TrackRowProps) {
  const theme = useTheme();
  const subtitle = [track.artist || 'Unknown artist', track.album].filter(Boolean).join(' • ');

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: selected ? theme.backgroundSelected : active ? theme.backgroundElement : 'transparent',
          borderRadius: Spacing.three,
        },
        style,
      ]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={selectionMode ? `Select ${track.title}` : `Play ${track.title}`}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.main}>
        {selectionMode ? (
          <View
            style={[
              styles.checkbox,
              {
                borderColor: selected ? theme.tint : theme.border,
                backgroundColor: selected ? theme.tint : 'transparent',
              },
            ]}>
            {selected ? <ThemedIcon icon={Check} size={14} color={theme.background} /> : null}
          </View>
        ) : (
          <MediaArtwork uri={track.artworkUri} size={44} radius={Spacing.two} fallbackIcon={MusicIcon} />
        )}
        <View style={styles.copy}>
          <View style={styles.titleLine}>
            <ThemedText type="label" numberOfLines={1} themeColor={active ? 'tint' : 'text'} style={styles.title}>
              {index != null ? `${index + 1}. ` : ''}
              {track.title || track.uri}
            </ThemedText>
            {track.favorite ? (
              <ThemedIcon icon={HeartSolid} size={12} color="tint" fill="tint" />
            ) : null}
          </View>
          <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        </View>
      </PressableScale>
      {!selectionMode && onMorePress ? (
        <IconButton
          icon={MoreHoriz}
          accessibilityLabel="Track options"
          size={36}
          iconSize={18}
          variant="plain"
          onPress={onMorePress}
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
    borderCurve: 'continuous',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: Spacing.half,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    flexShrink: 1,
  },
});
