import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassView } from '@/components/ui/glass-view';
import { APP_ICONS, DEFAULT_APP_ICON_SOURCE, type AppIconName } from '@/config/app-icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getActiveAppIcon, resetToDefaultAppIcon, setActiveAppIcon, supportsAlternateIcons } from '@/lib/app-icon';

const OPTIONS = [{ name: null, label: 'Default', source: DEFAULT_APP_ICON_SOURCE }, ...APP_ICONS] as const;

type BusyIcon = AppIconName | 'default' | null;

/** Native-only picker for the app icons registered by expo-alternate-app-icons. */
export function AppIconPicker() {
  const theme = useTheme();
  const [activeIcon, setActiveIcon] = useState<AppIconName | null>(() => {
    if (!supportsAlternateIcons) return null;
    try {
      return getActiveAppIcon();
    } catch {
      return null;
    }
  });
  const [busyIcon, setBusyIcon] = useState<BusyIcon>(null);
  const [error, setError] = useState<string | null>(null);

  if (!supportsAlternateIcons) return null;

  const selectIcon = async (name: AppIconName | null) => {
    const busyKey = name ?? 'default';
    if (busyIcon !== null || activeIcon === name) return;

    setBusyIcon(busyKey);
    setError(null);

    try {
      if (name === null) {
        await resetToDefaultAppIcon();
      } else {
        await setActiveAppIcon(name);
      }
      setActiveIcon(name);
      if (process.env.EXPO_OS === 'ios') void Haptics.selectionAsync();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to change the app icon.');
    } finally {
      setBusyIcon(null);
    }
  };

  return (
    <GlassView style={styles.container}>
      <ThemedText type="smallBold" style={styles.title}>
        App icon
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        Pick a home screen icon
      </ThemedText>

      <View style={styles.grid}>
        {OPTIONS.map((option) => {
          const selected = activeIcon === option.name;
          const busy = busyIcon === (option.name ?? 'default');

          return (
            <Pressable
              key={option.name ?? 'default'}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: busyIcon !== null }}
              accessibilityLabel={`${option.label} app icon`}
              disabled={busyIcon !== null}
              onPress={() => void selectIcon(option.name)}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <View
                style={[
                  styles.iconFrame,
                  {
                    borderColor: selected ? theme.tint : theme.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}>
                <Image source={option.source} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />
                {selected ? (
                  <View style={[styles.checkBadge, { backgroundColor: theme.tint }]}>
                    <Check size={12} color={theme.background} strokeWidth={3} />
                  </View>
                ) : null}
                {busy ? (
                  <View style={styles.busyOverlay}>
                    <ActivityIndicator size="small" color={theme.tint} />
                  </View>
                ) : null}
              </View>
              <ThemedText
                type="small"
                themeColor={selected ? 'text' : 'textSecondary'}
                numberOfLines={1}
                style={[styles.label, selected && styles.selectedLabel]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
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
    width: 68,
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
  iconFrame: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  checkBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busyOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  label: {
    width: '100%',
    textAlign: 'center',
  },
  selectedLabel: {
    fontWeight: '700',
  },
  error: {
    marginTop: Spacing.two,
  },
});
