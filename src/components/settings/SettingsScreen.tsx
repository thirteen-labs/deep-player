import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type ScrollViewInstance,
  type ViewInstance,
} from 'react-native';

import { settingsForRoute } from '@/features/settings/search/settings.search';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import type { SettingsSection as SettingsSectionId } from '@/features/settings/types/settings.types';
import { TopBar } from '@/components/ui';
import { Screen } from '@/components/ui/screen';
import { useTheme } from '@/hooks/use-theme';

import { SettingControl } from './SettingControl';
import { SettingDivider } from './SettingDivider';
import { SettingInfo } from './SettingInfo';
import { SettingsHeader } from './SettingsHeader';
import { SettingsLoading } from './SettingsLoading';
import { SettingsResetDialog } from './SettingsResetDialog';
import { SettingsSearchBar } from './SettingsSearchBar';
import { SettingsSection } from './SettingsSection';

export interface SettingsScreenProps {
  title: string;
  subtitle?: string;
  /** Registry route used to select which controls to render. */
  route: string;
  /** Section reset by the category reset action. */
  section: SettingsSectionId;
  /** Optional extra content rendered after the setting list. */
  children?: ReactNode;
}

/** Data-driven settings screen: registry controls + reset + global search entry. */
export function SettingsScreen({ title, subtitle, route, section, children }: SettingsScreenProps) {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const focus = typeof params.focus === 'string' ? params.focus : undefined;
  const hydrated = useSettingsStore((s) => s.hydrated);
  const resetCategory = useSettingsStore((s) => s.resetCategory);
  const [resetVisible, setResetVisible] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const focusedRowRef = useRef<ViewInstance>(null);
  const entries = useMemo(() => settingsForRoute(route), [route]);

  // Deep links from search include ?focus=<id>; scroll the highlighted row in.
  useEffect(() => {
    if (!hydrated || !focus || !focusedRowRef.current || !scrollRef.current) return;
    const timer = setTimeout(() => {
      const row = focusedRowRef.current;
      const scroll = scrollRef.current;
      if (!row || !scroll) return;
      row.measureLayout(
        scroll,
        (_x, y) => {
          scroll.scrollTo({ y: Math.max(0, y - 120), animated: true });
        },
        () => undefined,
      );
    }, 80);
    return () => clearTimeout(timer);
  }, [focus, hydrated, entries]);

  const header = (
    <TopBar
      title={title}
      showBack
      showSearch
      onSearchPress={() => router.push('/settings/search' as never)}
    />
  );

  if (!hydrated) {
    return (
      <Screen header={header} scrollRef={scrollRef}>
        <SettingsLoading />
      </Screen>
    );
  }

  const focusedEntry = focus ? entries.find((entry) => entry.id === focus) : undefined;

  return (
    <Screen header={header} scrollRef={scrollRef}>
      <SettingsHeader
        title={title}
        subtitle={subtitle}
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Reset ${title}`}
            onPress={() => setResetVisible(true)}
            style={styles.resetButton}>
            <Text style={[styles.resetLabel, { color: theme.accent }]}>Reset</Text>
          </Pressable>
        }
      />

      <SettingsSearchBar onPress={() => router.push('/settings/search' as never)} />

      {focusedEntry ? (
        <SettingInfo tone="info" message={`Jumped to “${focusedEntry.title}”.`} />
      ) : null}

      {entries.length ? (
        <SettingsSection title="Options">
          {entries.map((entry, index) => (
            <Fragment key={entry.id}>
              {index > 0 ? <SettingDivider /> : null}
              <SettingControl
                id={entry.id}
                focused={entry.id === focus}
                focusedRef={focusedRowRef}
              />
            </Fragment>
          ))}
        </SettingsSection>
      ) : null}

      {children}

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  resetButton: { paddingVertical: 6, paddingHorizontal: 10 },
  resetLabel: { fontSize: 14, fontWeight: '600' },
});
