import { router } from 'expo-router';

import { SettingInfo, SettingsHeader } from '@/components/settings';
import { Screen, TopBar } from '@/components/ui';

export default function ChangelogScreen() {
  return (
    <Screen
      header={
        <TopBar
          title="Changelog"
          showBack
          showSearch
          onSearchPress={() => router.push('/settings/search' as never)}
        />
      }>
      <SettingsHeader title="Changelog" subtitle="Release history" />
      <SettingInfo title="v1.0" message="Modular settings system with offline search, local backup/import, capability-aware controls and reactive themes." />
    </Screen>
  );
}
