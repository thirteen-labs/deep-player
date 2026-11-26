import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { FolderIcon } from '@solar-icons/react-native/linear/folder';
import { MusicNoteIcon } from '@solar-icons/react-native/linear/music-note';
import { UserIcon } from '@solar-icons/react-native/linear/user';
import { VideoLibraryIcon } from '@solar-icons/react-native/linear/video-library';
import { type Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassView } from '@/components/ui/glass-view';
import { ThemedIcon, type AppIcon } from '@/components/ui/themed-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

const TABS = [
  { name: 'folders', href: '/folders', label: 'Folders', icon: FolderIcon },
  { name: 'music', href: '/music', label: 'Music', icon: MusicNoteIcon },
  { name: 'videos', href: '/videos', label: 'Videos', icon: VideoLibraryIcon },
  { name: 'user', href: '/user', label: 'Settings', icon: UserIcon },
] as const;

/** Custom tab navigator with a floating, frosted, fully rounded tab bar. */
export default function FloatingTabs() {
  return (
    <Tabs style={styles.root}>
      {/* Keep visited screens attached: detaching them on every tab change
          reattaches large list views and makes switching feel slow. */}
      <TabSlot style={styles.slot} detachInactiveScreens={false} />
      <TabList asChild>
        <FloatingTabList>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton label={tab.label} icon={tab.icon} />
            </TabTrigger>
          ))}
        </FloatingTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { label: string; icon: AppIcon };

function TabButton({ label, icon: Icon, isFocused, ref, ...props }: TabButtonProps) {
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

function FloatingTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      {...props}
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
        {props.children}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
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
