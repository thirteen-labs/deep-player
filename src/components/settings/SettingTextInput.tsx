import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SettingTextInputProps {
  title: string;
  description?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

/** Free-text setting (subtitle language, theme id, etc.). */
export function SettingTextInput({
  title,
  description,
  value,
  onValueChange,
  placeholder,
  disabled,
  maxLength,
}: SettingTextInputProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
      <TextInput
        value={value}
        editable={!disabled}
        onChangeText={onValueChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        maxLength={maxLength}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
        accessibilityLabel={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.three, gap: Spacing.two },
  disabled: { opacity: 0.45 },
  title: { fontSize: 16, fontWeight: '500' },
  description: { fontSize: 13, lineHeight: 18 },
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 15 },
});
