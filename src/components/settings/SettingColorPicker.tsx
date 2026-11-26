import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingColorPickerProps {
  title: string;
  description?: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Optional preset swatches. */
  presets?: string[];
  disabled?: boolean;
}

const HEX = /^#([0-9a-fA-F]{6})$/;

/** Accent / subtitle color. Simple hex input + swatches (production can mount a native color sheet). */
export function SettingColorPicker({
  title,
  description,
  value,
  onValueChange,
  presets = [],
  disabled,
}: SettingColorPickerProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState(value);

  const commit = (text: string) => {
    const t = text.trim();
    if (HEX.test(t)) onValueChange(t);
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.header}>
        <View style={styles.labels}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
        </View>
        <View style={[styles.swatch, { backgroundColor: HEX.test(draft) ? draft : value, borderColor: theme.border }]} />
      </View>
      <TextInput
        value={draft}
        editable={!disabled}
        onChangeText={(t) => {
          setDraft(t);
          commit(t);
        }}
        placeholder="#RRGGBB"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        accessibilityLabel={`${title} hex color`}
      />
      {presets.length ? (
        <View style={styles.presets}>
          {presets.map((c) => (
            <Pressable
              key={c}
              disabled={disabled}
              onPress={() => {
                setDraft(c);
                onValueChange(c);
              }}
              accessibilityLabel={`Color ${c}`}
              style={[styles.preset, { backgroundColor: c, borderColor: theme.border }]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.three, gap: Spacing.two },
  disabled: { opacity: 0.45 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labels: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '500' },
  description: { fontSize: 13, lineHeight: 18 },
  swatch: { width: 32, height: 32, borderRadius: 8, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 15 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  preset: { width: 28, height: 28, borderRadius: 6, borderWidth: 1 },
});
