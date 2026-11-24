import { useState } from 'react';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type VolumeSliderProps = {
  /** Linear volume from 0 to 1. */
  volume: number;
  muted?: boolean;
  onVolumeChange: (volume: number) => void;
};

/** Compact tap-to-set volume bar used by the full-screen audio player. */
export function VolumeSlider({ volume, muted = false, onVolumeChange }: VolumeSliderProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const level = Math.min(1, Math.max(0, muted ? 0 : volume));

  const tap = useTapGesture({
    onFinalize: ({ x }) => {
      if (width > 0) onVolumeChange(Math.max(0, Math.min(1, x / width)));
    },
  });

  return (
    <GestureDetector gesture={tap}>
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel="Volume"
        accessibilityValue={{ now: Math.round(level * 100), min: 0, max: 100 }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={styles.hitArea}>
        <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
          <View style={[styles.fill, { width: `${level * 100}%`, backgroundColor: theme.tint }]} />
        </View>
      </Pressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    flex: 1,
    minWidth: 80,
    height: Spacing.four,
    justifyContent: 'center',
  },
  track: {
    height: 5,
    borderRadius: 3,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
