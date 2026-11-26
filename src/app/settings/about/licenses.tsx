import { router } from 'expo-router';

import { SettingInfo, SettingsHeader } from '@/components/settings';
import { Screen, TopBar } from '@/components/ui';

export default function LicensesScreen() {
  return (
    <Screen
      header={
        <TopBar
          title="Licenses"
          showBack
          showSearch
          onSearchPress={() => router.push('/settings/search' as never)}
        />
      }>
      <SettingsHeader title="Licenses" subtitle="Open-source notices for Deep Player dependencies" />
      <SettingInfo message="Deep Player is built with Expo, React Native and the packages listed in its project manifest. Their licenses remain with their respective authors." />
      <SettingInfo message="See the dependency licenses shipped with the app build and the source repository for full notices." />
    </Screen>
  );
}
