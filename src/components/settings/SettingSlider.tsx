import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingSliderProps {
  title: string;
  description?: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  /** Commit on release; live value shown while dragging. */
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
  disabled?: boolean;
}

/** Continuous numeric settings. */
export function SettingSlider({
  title,
  description,
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  formatValue,
  disabled,
}: SettingSliderProps) {
  const theme = useTheme();
  const [dragging, setDragging] = useState<number | null>(null);
  const shown = dragging ?? value;
  const fmt = formatValue ?? ((v: number) => `${Math.round(v * 100) / 100}`);

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.value, { color: theme.textSecondary }]}>{fmt(shown)}</Text>
      </View>
      {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
      <Slider
        style={styles.slider}
        value={shown}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        disabled={disabled}
        minimumTrackTintColor={theme.accent}
        maximumTrackTintColor={theme.border}
        thumbTintColor={theme.accent}
        onValueChange={(v) => setDragging(v)}
        onSlidingComplete={(v) => {
          setDragging(null);
          onValueChange(v);
        }}
        accessibilityLabel={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.three, gap: Spacing.one },
  disabled: { opacity: 0.45 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '500', flex: 1 },
  value: { fontSize: 14, marginLeft: Spacing.two },
  description: { fontSize: 13, lineHeight: 18 },
  slider: { width: '100%', height: 40 },
});
