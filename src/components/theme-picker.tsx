import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing, THEME_NAMES, Themes } from '@/constants/theme';
import { ThemePreference, useResolvedTheme } from '@/hooks/use-theme-store';
import { GlassView } from '@/components/ui/glass-view';
import { ThemedText } from '@/components/themed-text';

export function ThemePicker() {
  const { preference, setPreference, theme } = useResolvedTheme();
  const options: { key: ThemePreference; label: string; color: string }[] = [
    { key: 'system', label: 'System', color: theme.textSecondary },
    ...THEME_NAMES.map((name) => ({
      key: name as ThemePreference,
      label: Themes[name].label,
      color: Themes[name].tint,
    })),
  ];

  return (
    <GlassView style={styles.container}>
      <ThemedText type="smallBold" style={styles.title}>
        Themes
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        Pick a look for your player
      </ThemedText>
      <View style={styles.grid}>
        {options.map((opt) => {
          const selected = preference === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => {
                if (process.env.EXPO_OS === 'ios') {
                  Haptics.selectionAsync();
                }
                setPreference(opt.key);
              }}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: opt.color,
                    borderColor: selected ? theme.text : theme.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}>
                {selected ? (
                  <View style={[styles.swatchDot, { backgroundColor: theme.background }]} />
                ) : null}
              </View>
              <ThemedText
                type="small"
                themeColor={selected ? 'text' : 'textSecondary'}
                numberOfLines={1}
                style={selected ? styles.selectedLabel : undefined}>
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: 20,
    gap: Spacing.one,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    marginBottom: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  option: {
    alignItems: 'center',
    gap: Spacing.two,
    width: 64,
  },
  pressed: {
    opacity: 0.75,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  selectedLabel: {
    fontWeight: '700',
  },
});