import { router } from 'expo-router';
import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { SettingsCategoryLink } from '@/features/settings/ui/categories';
import type { SettingsSection } from '@/features/settings/types/settings.types';
import { settingsForRoute } from '@/features/settings/search/settings.search';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { TopBar } from '@/components/ui';
import { Screen } from '@/components/ui/screen';
import { useTheme } from '@/hooks/use-theme';

import { SettingControl } from './SettingControl';
import { SettingDivider } from './SettingDivider';
import { SettingsCategoryCard } from './SettingsCategoryCard';
import { SettingsHeader } from './SettingsHeader';
import { SettingsResetDialog } from './SettingsResetDialog';
import { SettingsSection as SettingsSectionGroup } from './SettingsSection';

export interface SettingsCategoryScreenProps {
  title: string;
  description?: string;
  cards: SettingsCategoryLink[];
  /** Enables a category-level reset with confirmation. */
  section?: SettingsSection;
  /** Registry route; settings registered here are rendered inline. */
  route?: string;
  children?: ReactNode;
}

/** Category landing page built from links, optional custom content, and reset. */
export function SettingsCategoryScreen({
  title,
  description,
  cards,
  section,
  route,
  children,
}: SettingsCategoryScreenProps) {
  const theme = useTheme();
  const resetCategory = useSettingsStore((s) => s.resetCategory);
  const [resetVisible, setResetVisible] = useState(false);
  const entries = useMemo(() => (route ? settingsForRoute(route) : []), [route]);

  return (
    <Screen
      header={
        <TopBar
          title={title}
          showBack
          showSearch
          onSearchPress={() => router.push('/settings/search' as never)}
        />
      }>
      <SettingsHeader
        title={title}
        subtitle={description}
        action={
          section ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Reset ${title}`}
              onPress={() => setResetVisible(true)}
              style={styles.resetButton}>
              <Text style={[styles.resetLabel, { color: theme.accent }]}>Reset</Text>
            </Pressable>
          ) : undefined
        }
      />
      {cards.length ? (
        <SettingsSectionGroup title="Sections">
          {cards.map((item, index) => (
            <Fragment key={item.route}>
              {index > 0 ? <SettingDivider /> : null}
              <SettingsCategoryCard
                title={item.title}
                description={item.description}
                onPress={() => router.push(item.route as never)}
              />
            </Fragment>
          ))}
        </SettingsSectionGroup>
      ) : null}
      {entries.length ? (
        <SettingsSectionGroup title="General">
          {entries.map((entry, index) => (
            <Fragment key={entry.id}>
              {index > 0 ? <SettingDivider /> : null}
              <SettingControl id={entry.id} />
            </Fragment>
          ))}
        </SettingsSectionGroup>
      ) : null}
      {children}
      {section ? (
        <SettingsResetDialog
          visible={resetVisible}
          title={`Reset ${title}?`}
          message="This restores the default values for this category. Media files are not deleted."
          onCancel={() => setResetVisible(false)}
          onConfirm={() => {
            resetCategory(section);
            setResetVisible(false);
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  resetButton: { paddingVertical: 6, paddingHorizontal: 10 },
  resetLabel: { fontSize: 14, fontWeight: '600' },
});
