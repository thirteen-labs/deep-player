import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingsSearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  placeholder?: string;
  editable?: boolean;
}

export function SettingsSearchBar({
  value,
  onChangeText,
  onPress,
  placeholder = 'Search settings…',
  editable = true,
}: SettingsSearchBarProps) {
  const theme = useTheme();
  const inner = (
    <View style={[styles.bar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Text style={[styles.icon, { color: theme.textSecondary }]}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }]}
        returnKeyType="search"
        accessibilityLabel="Search settings"
      />
      {value ? (
        <Pressable accessibilityLabel="Clear search" onPress={() => onChangeText?.('')} hitSlop={8}>
          <Text style={{ color: theme.textSecondary }}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
  },
  icon: { fontSize: 18 },
  input: { flex: 1, fontSize: 15, padding: 0 },
});
