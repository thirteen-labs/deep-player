import { FolderIcon } from '@solar-icons/react-native/linear/folder';
import { MusicNoteIcon } from '@solar-icons/react-native/linear/music-note';
import { UserIcon } from '@solar-icons/react-native/linear/user';
import { VideoLibraryIcon } from '@solar-icons/react-native/linear/video-library';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlassView } from '@/components/ui/glass-view';
import { ThemedIcon, type AppIcon } from '@/components/ui/themed-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

const TABS = [
  { name: 'folders', label: 'Folders', icon: FolderIcon },
  { name: 'music', label: 'Music', icon: MusicNoteIcon },
  { name: 'videos', label: 'Videos', icon: VideoLibraryIcon },
  { name: 'user', label: 'Settings', icon: UserIcon },
] as const satisfies readonly {
  name: string;
  label: string;
  icon: AppIcon;
}[];

/**
 * Tab navigator with a floating, frosted tab pill on every platform.
 *
 * Uses Expo Router's JavaScript tabs (React Navigation bottom tabs) as the
 * navigator so the bar is always mounted, then replaces the default bar with
 * the custom pill. The headless `expo-router/ui` tabs are experimental and can
 * fail to render the TabList, which left the app without a bottom bar.
 */
export default function FloatingTabs() {
  return (
    <Tabs
      tabBar={FloatingTabBar}
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}

/**
 * `tabBar` is invoked as a plain function by the navigator, so it must not
 * call hooks itself. Render a real component instead.
 */
function FloatingTabBar(props: BottomTabBarProps) {
  return <FloatingTabBarContent {...props} />;
}

function FloatingTabBarContent({ state, navigateToTab, insets }: BottomTabBarProps) {
  const theme = useTheme();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.tabListContainer, { paddingBottom: insets.bottom + Spacing.two }]}>
      <GlassView
        style={[
          styles.innerContainer,
          {
            borderColor: theme.glassBorder,
            boxShadow: `0 8px 24px ${withAlpha(theme.text, 0.18)}`,
          },
        ]}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((item) => item.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;
          return (
            <TabButton
              key={route.key}
              label={tab.label}
              icon={tab.icon}
              focused={focused}
              onPress={() => navigateToTab(route.key)}
            />
          );
        })}
      </GlassView>
    </View>
  );
}

type TabButtonProps = {
  label: string;
  icon: AppIcon;
  focused: boolean;
  onPress: () => void;
};

function TabButton({ label, icon: Icon, focused, onPress }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        focused && { backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <ThemedIcon
        icon={Icon}
        size={22}
        color={focused ? 'tint' : 'textSecondary'}
        strokeWidth={focused ? 2.4 : 1.9}
        fill={focused ? theme.tint : 'none'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
    borderRadius: 999,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: Spacing.one,
    width: '100%',
    maxWidth: 420,
  },
  tabButton: {
    width: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.7,
  },
});
