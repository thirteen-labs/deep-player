import { router } from 'expo-router';
import { Play } from 'iconoir-react-native';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useScreenBottomInset } from '@/hooks/use-screen-bottom-inset';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore } from '@/lib/db/store';
import { Spacing } from '@/constants/theme';
import { getContinueItems } from '@/utils/continue';

import { IconButton } from './ui';

/**
 * Bottom-right shortcut that resumes the most recent unfinished video.
 * Rendered once by the tab layout so it stays available on every main screen.
 */
export function ContinueWatchingFab() {
  const theme = useTheme();
  const bottomInset = useScreenBottomInset();
  const tracks = useDbStore((s) => s.tracks);
  const positions = useDbStore((s) => s.playbackPositions);
  const lastPlayedAt = useDbStore((s) => s.lastPlayedAt);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const load = useDbStore((s) => s.load);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const resumeItem = useMemo(
    () => getContinueItems(tracks, positions, lastPlayedAt, 'video', 1)[0],
    [tracks, positions, lastPlayedAt],
  );

  if (!resumeItem) return null;

  return (
    <View style={[styles.container, { bottom: bottomInset, right: Spacing.three }]} pointerEvents="box-none">
      <IconButton
        icon={Play}
        accessibilityLabel={`Continue watching ${resumeItem.track.title || 'video'}`}
        size={60}
        iconSize={26}
        variant="primary"
        style={[
          styles.button,
          {
            borderColor: theme.glassBorder,
            shadowColor: theme.tint,
          },
        ]}
        onPress={() => router.push(`/videos/${encodeURIComponent(resumeItem.track.id)}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  button: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
});
