import { router } from 'expo-router';
import { ArrowDownUp, Bell, Search, Sparkles, UserRound } from 'lucide-react-native';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import { AppLogo } from './app-logo';
import { GlassView } from './glass-view';
import { IconButton } from './icon-button';
import { SortMenuButton } from './sort-menu-button';

type TopBarProps = {
  title?: string;
  showUniversalSort?: boolean;
  showSmartSort?: boolean;
  showSearch?: boolean;
  onSearchPress?: () => void;
  showNotifications?: boolean;
  showProfile?: boolean;
};

/** Shared top bar: app logo at the far start, title, then sort/utility actions. */
export function TopBar({
  title,
  showUniversalSort = false,
  showSmartSort = false,
  showSearch = false,
  onSearchPress,
  showNotifications = true,
  showProfile = true,
}: TopBarProps) {
  const { width } = useWindowDimensions();
  const compact = width < 560;

  return (
    <GlassView style={styles.bar}>
      <AppLogo compact={compact} onPress={() => router.push('/home')} />

      {title && !compact ? (
        <ThemedText type="smallBold" style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        {showUniversalSort ? (
          <SortMenuButton label={compact ? 'Sort' : 'Sort by'} icon={ArrowDownUp} kind="universal" />
        ) : null}
        {showSmartSort ? (
          <SortMenuButton label={compact ? 'Lists' : 'Smart lists'} icon={Sparkles} kind="smart" />
        ) : null}
        {showSearch && onSearchPress ? (
          <IconButton icon={Search} accessibilityLabel="Search" size={36} iconSize={18} onPress={onSearchPress} />
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
        {showProfile ? (
          <IconButton
            icon={UserRound}
            accessibilityLabel="Profile"
            size={36}
            iconSize={18}
            onPress={() => router.push('/user')}
          />
        ) : null}
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
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
