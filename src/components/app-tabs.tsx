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
          src={{
            default: require('../../assets/tabs/home.png'),
            selected: require('../../assets/tabs/home-filled.png'),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="folders" accessibilityLabel="Folders">
        <NativeTabs.Trigger.Label hidden>Folders</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'folder', selected: 'folder.fill' }}
          src={{
            default: require('../../assets/tabs/folder.png'),
            selected: require('../../assets/tabs/folder-open.png'),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="music" accessibilityLabel="Music">
        <NativeTabs.Trigger.Label hidden>Music</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'music.note', selected: 'music.note.list' }}
          src={{
            default: require('../../assets/tabs/music.png'),
            selected: require('../../assets/tabs/music-filled.png'),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="videos" accessibilityLabel="Videos">
        <NativeTabs.Trigger.Label hidden>Videos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'video', selected: 'video.fill' }}
          src={{
            default: require('../../assets/tabs/videocam.png'),
            selected: require('../../assets/tabs/videocam-filled.png'),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="user" accessibilityLabel="Profile">
        <NativeTabs.Trigger.Label hidden>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          src={{
            default: require('../../assets/tabs/person.png'),
            selected: require('../../assets/tabs/person-filled.png'),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
