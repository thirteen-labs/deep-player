import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import {
  SettingDivider,
  SettingsCategoryCard,
  SettingInfo,
  SettingsHeader,
  SettingsResetDialog,
  SettingsSearchBar,
  SettingsSection,
} from '@/components/settings';
import { Screen, TopBar } from '@/components/ui';
import { QUICK_ACCESS_CARDS, SETTINGS_CATEGORIES } from '@/features/settings/ui/categories';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useTheme } from '@/hooks/use-theme';

/** Settings landing page (spec §3). */
export default function SettingsLandingScreen() {
  const theme = useTheme();
  const resetAll = useSettingsStore((s) => s.resetAll);
  const [resetVisible, setResetVisible] = useState(false);

  return (
    <Screen
      header={
        <TopBar
          title="Settings"
          showBack
          showSearch
          onSearchPress={() => router.push('/settings/search' as never)}
        />
      }>
      <SettingsHeader
        title="Settings"
        subtitle="Deep Player · v1.0 · Personalize your media experience"
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset all settings"
            onPress={() => setResetVisible(true)}
            style={styles.resetButton}>
            <Text style={[styles.resetLabel, { color: theme.accent }]}>Reset all</Text>
          </Pressable>
        }
      />

      <SettingsSearchBar onPress={() => router.push('/settings/search' as never)} />

      <SettingsSection title="Quick access">
        {QUICK_ACCESS_CARDS.map((item, index) => (
          <Fragment key={item.route}>
            {index > 0 ? <SettingDivider /> : null}
            <SettingsCategoryCard
              title={item.title}
              description={item.description}
              onPress={() => router.push(item.route as never)}
            />
          </Fragment>
        ))}
      </SettingsSection>

      <SettingsSection title="All settings">
        {SETTINGS_CATEGORIES.map((category, index) => (
          <Fragment key={category.id}>
            {index > 0 ? <SettingDivider /> : null}
            <SettingsCategoryCard
              title={category.title}
              description={category.description}
              onPress={() => router.push(category.route as never)}
            />
          </Fragment>
        ))}
      </SettingsSection>

      <SettingInfo
        tone="info"
        message="Changes save automatically. A global reset restores defaults without deleting media files."
      />

      <SettingsResetDialog
        visible={resetVisible}
        title="Reset all settings?"
        message="Every preference returns to its default value. Media files and library data are not deleted."
        confirmLabel="Reset all"
        onCancel={() => setResetVisible(false)}
        onConfirm={() => {
          resetAll();
          setResetVisible(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  resetButton: { paddingVertical: 6, paddingHorizontal: 10 },
  resetLabel: { fontSize: 14, fontWeight: '600' },
});
