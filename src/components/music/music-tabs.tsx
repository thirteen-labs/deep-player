import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type MusicSection = 'songs' | 'playlists' | 'albums' | 'artists' | 'favorites';

const SECTIONS: { value: MusicSection; label: string }[] = [
  { value: 'songs', label: 'Songs' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'albums', label: 'Albums' },
  { value: 'artists', label: 'Artists' },
  { value: 'favorites', label: 'Favorites' },
];

type MusicTabsProps = {
  value: MusicSection;
  onValueChange: (section: MusicSection) => void;
};

/** Inner top bar for switching the library view without extra routes. */
export function MusicTabs({ value, onValueChange }: MusicTabsProps) {
  const theme = useTheme();

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
        {SECTIONS.map((section) => {
          const active = section.value === value;
          return (
            <PressableScale
              key={section.value}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={section.label}
              onPress={() => onValueChange(section.value)}
              style={[styles.tab, active && { backgroundColor: theme.tint }]}>
              <ThemedText type="smallBold" themeColor={active ? 'background' : 'textSecondary'}>
                {section.label}
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
  tab: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
});
