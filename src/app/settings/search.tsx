import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  SettingDivider,
  SettingsEmptyState,
  SettingsHeader,
  SettingsSearchBar,
  SettingsSearchResult,
  SettingsSection,
} from '@/components/settings';
import { Screen, TopBar } from '@/components/ui';
import { formatSettingValue } from '@/features/settings/ui/control-config';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
} from '@/features/settings/search/recent-searches';
import { searchSettings } from '@/features/settings/search/settings.search';
import { getSettingById, useSettingsStore } from '@/features/settings/store/settings.store';
import { useTheme } from '@/hooks/use-theme';

/** Global offline settings search (spec §8). */
export default function SettingsSearchScreen() {
  const theme = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(() => getRecentSearches());

  const results = useMemo(() => searchSettings(query), [query]);

  const openResult = (route: string, id: string, title: string) => {
    addRecentSearch(title);
    setRecent(getRecentSearches());
    router.push(`${route}?focus=${encodeURIComponent(id)}` as never);
  };

  return (
    <Screen
      header={
        <TopBar
          title="Search settings"
          showBack
          showSearch={false}
        />
      }>
      <SettingsHeader title="Search" subtitle="Find any setting across Deep Player — works offline." />

      <SettingsSearchBar value={query} onChangeText={setQuery} placeholder="Search settings…" />

      {!query.trim() && recent.length ? (
        <SettingsSection title="Recent searches">
          <View style={styles.chips}>
            {recent.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => setQuery(item)}
                style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
                <Text style={{ color: theme.text }}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={() => {
            clearRecentSearches();
            setRecent([]);
          }}>
            <Text style={[styles.clear, { color: theme.accent }]}>Clear recent</Text>
          </Pressable>
        </SettingsSection>
      ) : null}

      {query.trim() ? (
        results.length ? (
          <SettingsSection title={`${results.length} result${results.length === 1 ? '' : 's'}`}>
            {results.map((entry, index) => (
              <View key={entry.id}>
                {index > 0 ? <SettingDivider /> : null}
                <SettingsSearchResult
                  entry={entry}
                  valueLabel={formatSettingValue(entry.id, getSettingById(settings, entry.id))}
                  onPress={() => openResult(entry.route, entry.id, entry.title)}
                />
              </View>
            ))}
          </SettingsSection>
        ) : (
          <SettingsEmptyState title="No matches" message={`Nothing found for “${query}”.`} />
        )
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  clear: { paddingHorizontal: 16, marginTop: 8, fontSize: 14, fontWeight: '600' },
});
