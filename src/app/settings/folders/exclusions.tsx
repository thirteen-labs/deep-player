import { router } from 'expo-router';

import {
  SettingDivider,
  SettingInfo,
  SettingsCategoryCard,
  SettingsHeader,
  SettingsSection,
} from '@/components/settings';
import { Screen, TopBar } from '@/components/ui';

export default function FolderExclusionsScreen() {
  return (
    <Screen
      header={
        <TopBar
          title="Exclusions"
          showBack
          showSearch
          onSearchPress={() => router.push('/settings/search' as never)}
        />
      }>
      <SettingsHeader
        title="Exclusions"
        subtitle="Hidden media stays in the SQLite library but is omitted from lists."
      />
      <SettingsSection title="Manage">
        <SettingsCategoryCard
          title="Hidden tracks"
          description="Review and unhide blacklisted tracks"
          onPress={() => router.push('/settings/hidden' as never)}
        />
        <SettingDivider />
        <SettingsCategoryCard
          title="Library & permissions"
          description="Scan media and manage file access"
          onPress={() => router.push('/settings/legacy/music' as never)}
        />
      </SettingsSection>
      <SettingInfo message="Private folder paths are intentionally excluded from settings backups." />
    </Screen>
  );
}
