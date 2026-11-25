import { router } from 'expo-router';
import { Sort, Bell, NavArrowLeft, Search, Sparks } from 'iconoir-react-native';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import { AppLogo } from './app-logo';
import { IconButton } from './icon-button';
import { SortMenuButton } from './sort-menu-button';

type TopBarProps = {
  title?: string;
  showUniversalSort?: boolean;
  showSmartSort?: boolean;
  /** Show the universal search action. Enabled everywhere by default. */
  showSearch?: boolean;
  /** Override the default navigation to the search page. */
  onSearchPress?: () => void;
  showNotifications?: boolean;
  /** Show a back button instead of relying on the navigator header. */
  showBack?: boolean;
};

/** Shared top bar: app logo at the far start, title, then sort/utility actions. */
export function TopBar({
  title,
  showUniversalSort = false,
  showSmartSort = false,
  showSearch = true,
  onSearchPress,
  showNotifications = false,
  showBack = false,
}: TopBarProps) {
  const { width } = useWindowDimensions();
  const compact = width < 560;

  return (
    <View style={styles.bar}>
      {showBack ? (
        <IconButton
          icon={NavArrowLeft}
          accessibilityLabel="Back"
          size={36}
          iconSize={18}
          onPress={() => router.back()}
        />
      ) : (
        <AppLogo compact={compact} onPress={() => router.push('/folders')} />
      )}

      {title && (!compact || showBack) ? (
        <ThemedText type="label" style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        {showUniversalSort ? (
          <SortMenuButton label={compact ? 'Sort' : 'Sort by'} icon={Sort} kind="universal" />
        ) : null}
        {showSmartSort ? (
          <SortMenuButton label={compact ? 'Lists' : 'Smart lists'} icon={Sparks} kind="smart" />
        ) : null}
        {showSearch ? (
          <IconButton
            icon={Search}
            accessibilityLabel="Search"
            size={36}
            iconSize={18}
            onPress={onSearchPress ?? (() => router.push('/search'))}
          />
        ) : null}
        {showNotifications ? (
          <IconButton
            icon={Bell}
            accessibilityLabel="Notifications"
            size={36}
            iconSize={18}
            onPress={() => router.push('/user')}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'transparent',
  },
  title: {
    flexShrink: 1,
  },
  actions: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    flexShrink: 0,
  },
});
