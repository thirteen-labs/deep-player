import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlassView } from '@/components/ui/glass-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing, THEME_CONFIG, THEME_NAMES, Themes } from '@/constants/theme';
import { useResolvedTheme } from '@/hooks/use-theme-store';

export function ThemePicker() {
  const { preference, setPreference, theme } = useResolvedTheme();

  if (!THEME_CONFIG.settings.allowThemeSwitching) return null;

  const options = THEME_NAMES.map((name) => ({
    key: name,
    label: Themes[name].label,
    color: Themes[name].primary,
    background: Themes[name].background,
  }));

  return (
    <GlassView style={styles.container}>
      <ThemedText type="callout">Themes</ThemedText>
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
                    backgroundColor: opt.background,
                    borderColor: selected ? theme.primary : theme.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}>
                <View style={[styles.swatchAccent, { backgroundColor: opt.color }]} />
              </View>
              <ThemedText
                type={selected ? 'label' : 'bodySmall'}
                themeColor={selected ? 'text' : 'textSecondary'}
                numberOfLines={1}>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  option: {
    alignItems: 'center',
    gap: Spacing.two,
    width: 88,
  },
  pressed: {
    opacity: 0.75,
  },
  swatch: {
    width: 88,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchAccent: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
});
