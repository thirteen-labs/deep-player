import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const theme = useTheme();

  return (
    <NativeTabs
      blurEffect={theme.isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
      backgroundColor={theme.tabBarBackground}
      indicatorColor={theme.backgroundSelected}
      labelVisibilityMode="unlabeled"
      iconColor={{ default: theme.textSecondary, selected: theme.tint }}>
      <NativeTabs.Trigger name="home" accessibilityLabel="Home">
        <NativeTabs.Trigger.Label hidden>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home_filled' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="folders" accessibilityLabel="Folders">
        <NativeTabs.Trigger.Label hidden>Folders</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'folder', selected: 'folder.fill' }}
          md={{ default: 'folder', selected: 'folder_open' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="music" accessibilityLabel="Music">
        <NativeTabs.Trigger.Label hidden>Music</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'music.note', selected: 'music.note.list' }}
          md={{ default: 'music_note', selected: 'library_music' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="videos" accessibilityLabel="Videos">
        <NativeTabs.Trigger.Label hidden>Videos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'video', selected: 'video.fill' }}
          md={{ default: 'videocam', selected: 'video_library' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="user" accessibilityLabel="Profile">
        <NativeTabs.Trigger.Label hidden>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md={{ default: 'person_outline', selected: 'person' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
