import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Film, Folder, House, Music2, UserRound, type LucideIcon } from 'lucide-react-native';
import { type Ref } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassView } from '@/components/ui/glass-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const TABS = [
  { name: 'home', href: '/home', label: 'Home', icon: House },
  { name: 'folders', href: '/folders', label: 'Folders', icon: Folder },
  { name: 'music', href: '/music', label: 'Music', icon: Music2 },
  { name: 'videos', href: '/videos', label: 'Videos', icon: Film },
  { name: 'user', href: '/user', label: 'User', icon: UserRound },
] as const;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon}>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, icon, isFocused, ref, ...props }: TabTriggerSlotProps & { icon: LucideIcon }) {
  return (
    <Pressable
      {...props}
      ref={ref as Ref<React.ComponentRef<typeof Pressable>>}
      accessibilityLabel={typeof children === 'string' ? children : undefined}
      style={({ pressed }) => pressed && styles.pressed}>
      <View style={styles.tabButton}>
        <ThemedIcon icon={icon} size={20} color={isFocused ? 'tint' : 'textSecondary'} />
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'} style={styles.label}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <GlassView style={styles.innerContainer}>
        {props.children}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexGrow: 1,
    gap: Spacing.half,
    maxWidth: MaxContentWidth,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
    minWidth: 64,
  },
  label: {
    fontSize: 11,
  },
  pressed: {
    opacity: 0.7,
  },
});
