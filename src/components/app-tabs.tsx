import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const theme = useTheme();

  return (
    <NativeTabs
      blurEffect={theme.isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
      backgroundColor={theme.tabBarBackground}
      indicatorColor={theme.backgroundElement}
      labelStyle={{ selected: { color: theme.text } }}
      iconColor={{ default: theme.textSecondary, selected: theme.tint }}>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="folders">
        <NativeTabs.Trigger.Label>Folders</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="folder" md="folder" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="music">
        <NativeTabs.Trigger.Label>Music</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="music.note" md="library_music" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="videos">
        <NativeTabs.Trigger.Label>Videos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="video" md="videocam" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="user">
        <NativeTabs.Trigger.Label>User</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
