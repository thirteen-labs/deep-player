import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MUSIC_SORT_OPTIONS, useSortStore } from '@/stores/sort-store';

import { sortConfigToTrackSortKey, trackSortKeyToConfig } from '@/features/media-lists/adapters';
import { useMediaSort } from '@/features/media-lists/hooks';

type MusicSortBarProps = {
  /** Per-list key used to remember the sort choice. */
  listKey?: string;
};

/** Music's compact sort bar, backed by the per-list persisted sort store. */
export function MusicSortBar({ listKey = 'music:songs' }: MusicSortBarProps) {
  const theme = useTheme();
  const { sort, setSortConfig } = useMediaSort(listKey, 'music');
  const setLegacySort = useSortStore((s) => s.setMusicSort);
  const value = sortConfigToTrackSortKey(sort);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {MUSIC_SORT_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <PressableScale
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Sort by ${option.label}`}
              onPress={() => {
                // Keep the legacy sort store in sync for any remaining consumers.
                setLegacySort(option.value);
                setSortConfig(trackSortKeyToConfig(option.value));
              }}
              style={[styles.option, active && { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText
                type="label"
                themeColor={active ? 'tint' : 'textSecondary'}
                style={styles.label}>
                {option.label}
              </ThemedText>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: Spacing.half,
  },
  content: {
    flexDirection: 'row',
    gap: Spacing.half,
  },
  option: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  label: {
    textAlign: 'center',
  },
});
