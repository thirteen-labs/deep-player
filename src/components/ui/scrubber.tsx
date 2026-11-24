import { useState } from 'react';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatTime } from '@/utils/format';
import { withAlpha } from '@/utils/color';

type ScrubberProps = {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  /** Show current / total time labels below the track. Defaults to true. */
  showTimes?: boolean;
  /** Use high-contrast colors for overlays on top of video. */
  variant?: 'default' | 'overlay';
};

/** Tap-to-seek progress bar with time labels. */
export function Scrubber({
  currentTime,
  duration,
  onSeek,
  showTimes = true,
  variant = 'default',
}: ScrubberProps) {
  const overlay = variant === 'overlay';
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const percent = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  const tap = useTapGesture({
    onFinalize: ({ x }) => {
      if (width > 0 && duration > 0) {
        onSeek((Math.max(0, x) / width) * duration);
      }
    },
  });

  return (
    <GestureDetector gesture={tap}>
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel="Playback position"
        accessibilityValue={{ now: Math.round(currentTime), max: Math.round(duration) }}
        style={styles.track}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <View
          style={[
            styles.bar,
            {
              backgroundColor: overlay
                ? withAlpha(theme.text, 0.28)
                : theme.backgroundSelected,
            },
          ]}>
          <View
            style={[
              styles.fill,
              { width: `${percent * 100}%`, backgroundColor: overlay ? theme.accent : theme.tint },
            ]}
          />
          <View
            style={[
              styles.thumb,
              {
                left: `${Math.max(0, percent * 100 - 2)}%`,
                backgroundColor: overlay ? theme.accent : theme.tint,
              },
            ]}
          />
        </View>
        {showTimes ? (
          <View style={styles.times}>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={overlay && { color: theme.text }}
              selectable>
              {formatTime(currentTime)}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={overlay && { color: theme.text }}
              selectable>
              {duration > 0 ? formatTime(duration) : '—'}
            </ThemedText>
          </View>
        ) : null}
      </Pressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
  },
  bar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.two,
  },
});
