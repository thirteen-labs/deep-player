import { Search, Xmark } from 'iconoir-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton, PressableScale } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { Radius, getTypographyStyles } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { useFontScale } from '@/stores/font-size-store';

type MediaListToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  showSearch?: boolean;
  placeholder?: string;
  onFilterPress?: () => void;
  /** Hands the current term to the global search screen. */
  onSearchAll?: () => void;
  filterActive?: boolean;
  resultCount?: number;
  action?: ReactNode;
};

/** Shared contextual search + filter row for media lists. */
export function MediaListToolbar({
  query,
  onQueryChange,
  showSearch = true,
  placeholder = 'Search this list…',
  onFilterPress,
  onSearchAll,
  filterActive = false,
  resultCount,
  action,
}: MediaListToolbarProps) {
  const theme = useTheme();
  const fontScale = useFontScale();

  return (
    <View style={styles.container}>
      {showSearch ? (
        <View
          style={[
            styles.search,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: filterActive ? theme.tint : theme.border,
            },
          ]}>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder={placeholder}
            placeholderTextColor={theme.textSecondary}
            style={[
              getTypographyStyles(fontScale).body,
              styles.input,
              { color: theme.text },
            ]}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          {query ? (
            <IconButton
              icon={Xmark}
              accessibilityLabel="Clear search"
              size={32}
              iconSize={16}
              variant="plain"
              onPress={() => onQueryChange('')}
            />
          ) : null}
        </View>
      ) : null}

      {onSearchAll && query.trim() ? (
        <IconButton
          icon={Search}
          accessibilityLabel="Search all media"
          size={40}
          iconSize={18}
          variant="plain"
          onPress={onSearchAll}
        />
      ) : null}

      {onFilterPress ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={filterActive ? 'Edit filters' : 'Filter this list'}
          accessibilityState={{ selected: filterActive }}
          onPress={onFilterPress}
          style={[
            styles.filterButton,
            {
              backgroundColor: filterActive ? theme.backgroundSelected : theme.backgroundElement,
            },
          ]}>
          <ThemedText type="label" themeColor={filterActive ? 'tint' : 'textSecondary'}>
            Filter
          </ThemedText>
        </PressableScale>
      ) : null}

      {action}
      {resultCount != null ? (
        <ThemedText type="caption" themeColor="textSecondary" style={styles.count}>
          {resultCount}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.huge,
    borderCurve: 'continuous',
    borderWidth: 1,
    minHeight: 40,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  filterButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderCurve: 'continuous',
  },
  count: {
    minWidth: 24,
    textAlign: 'right',
  },
});
