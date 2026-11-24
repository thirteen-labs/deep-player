import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { MediaVideo, Folder, Home, MusicDoubleNote, User } from 'iconoir-react-native';
import { type Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassView } from '@/components/ui/glass-view';
import { ThemedIcon, type AppIcon } from '@/components/ui/themed-icon';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TABS = [
  { name: 'home', href: '/home', label: 'Home', icon: Home },
  { name: 'folders', href: '/folders', label: 'Folders', icon: Folder },
  { name: 'music', href: '/music', label: 'Music', icon: MusicDoubleNote },
  { name: 'videos', href: '/videos', label: 'Videos', icon: MediaVideo },
  { name: 'user', href: '/user', label: 'Profile', icon: User },
] as const;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton label={tab.label} icon={tab.icon} />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { label: string; icon: AppIcon };

export function TabButton({ label, icon: Icon, isFocused, ref, ...props }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      {...props}
      ref={ref as Ref<React.ComponentRef<typeof Pressable>>}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(isFocused) }}
      style={({ pressed }) => [
        styles.tabButton,
        isFocused && { backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <ThemedIcon
        icon={Icon}
        size={22}
        color={isFocused ? 'tint' : 'textSecondary'}
        strokeWidth={isFocused ? 2.4 : 1.9}
        fill={isFocused ? theme.tint : 'none'}
      />
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      {...props}
      style={[styles.tabListContainer, { paddingBottom: Spacing.two + insets.bottom }]}>
      <GlassView style={[styles.innerContainer, { borderColor: theme.glassBorder }]}>
        {props.children}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: Spacing.one,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  tabButton: {
    width: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  pressed: {
    opacity: 0.7,
  },
});
