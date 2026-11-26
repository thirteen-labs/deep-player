import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSettingHaptics } from '@/features/settings/hooks/use-setting-haptics';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingSelectorOption {
  value: string;
  label: string;
}

export interface SettingSelectorProps {
  title: string;
  description?: string;
  value: string;
  options: SettingSelectorOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

/** Single-choice mutually-exclusive options rendered inline. */
export function SettingSelector({
  title,
  description,
  value,
  options,
  onValueChange,
  disabled,
}: SettingSelectorProps) {
  const theme = useTheme();
  const haptic = useSettingHaptics();
  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
      <View style={styles.options} accessibilityRole="radiogroup">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => {
                haptic();
                onValueChange(opt.value);
              }}
              style={[
                styles.option,
                { borderColor: selected ? theme.accent : theme.border, backgroundColor: selected ? theme.accent : 'transparent' },
              ]}>
              <Text style={[styles.optionLabel, { color: selected ? theme.background : theme.text }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.three, gap: Spacing.two },
  disabled: { opacity: 0.45 },
  title: { fontSize: 16, fontWeight: '500' },
  description: { fontSize: 13, lineHeight: 18 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  option: { borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 },
  optionLabel: { fontSize: 14, fontWeight: '500' },
});
