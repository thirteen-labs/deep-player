import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton, PressableScale } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { Radius, getTypographyStyles } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { useFontScale } from '@/stores/font-size-store';

import type { MediaFilter, MediaType } from '../types';

const MB = 1024 * 1024;
const VIDEO_RESOLUTIONS = ['720p', '1080p', '4K'];

export interface MediaFilterSheetProps {
  initialFilter: MediaFilter;
  mediaType: MediaType;
  onApply: (filter: MediaFilter) => void;
  onReset: () => void;
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? theme.backgroundSelected : theme.background },
      ]}>
      <ThemedText type="label" themeColor={selected ? 'tint' : 'textSecondary'}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const theme = useTheme();
  const fontScale = useFontScale();
  return (
    <View style={styles.field}>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        value={value == null ? '' : String(value)}
        onChangeText={(text) => onChange(text.trim() === '' ? undefined : Number(text))}
        placeholder="Any"
        placeholderTextColor={theme.textSecondary}
        keyboardType="number-pad"
        style={[
          getTypographyStyles(fontScale).bodySmall,
          styles.input,
          { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
        ]}
      />
    </View>
  );
}

/** Filter controls for one list. Parent owns the bottom sheet and visibility. */
export function MediaFilterSheet({
  initialFilter,
  mediaType,
  onApply,
  onReset,
}: MediaFilterSheetProps) {
  const [draft, setDraft] = useStateFilter(initialFilter);

  const setNumber = (key: 'minDuration' | 'maxDuration', value: number | undefined) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const setSizeMb = (key: 'minSize' | 'maxSize', value: number | undefined) =>
    setDraft((current) => ({
      ...current,
      [key]: value == null ? undefined : Math.max(0, value) * MB,
    }));

  const toggleResolution = (value: string) =>
    setDraft((current) => {
      const values = current.resolutions ?? [];
      return {
        ...current,
        resolutions: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });

  const sanitize = (filter: MediaFilter): MediaFilter => {
    const next: MediaFilter = { ...filter };
    if (next.minDuration != null && !Number.isFinite(next.minDuration)) delete next.minDuration;
    if (next.maxDuration != null && !Number.isFinite(next.maxDuration)) delete next.maxDuration;
    if (next.minSize != null && !Number.isFinite(next.minSize)) delete next.minSize;
    if (next.maxSize != null && !Number.isFinite(next.maxSize)) delete next.maxSize;
    return next;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <FilterChip
          label="Favorites only"
          selected={draft.favoritesOnly === true}
          onPress={() =>
            setDraft((current) => ({ ...current, favoritesOnly: current.favoritesOnly ? undefined : true }))
          }
        />
        {mediaType === 'video' ? (
          <FilterChip
            label="In progress"
            selected={draft.completed === false}
            onPress={() =>
              setDraft((current) => ({ ...current, completed: current.completed === false ? undefined : false }))
            }
          />
        ) : null}
      </View>

      <ThemedText type="footnote" themeColor="textSecondary">
        Duration (seconds)
      </ThemedText>
      <View style={styles.row}>
        <NumberField
          label="Minimum"
          value={draft.minDuration}
          onChange={(value) => setNumber('minDuration', value)}
        />
        <NumberField
          label="Maximum"
          value={draft.maxDuration}
          onChange={(value) => setNumber('maxDuration', value)}
        />
      </View>

      <ThemedText type="footnote" themeColor="textSecondary">
        File size (MB)
      </ThemedText>
      <View style={styles.row}>
        <NumberField
          label="At least"
          value={draft.minSize == null ? undefined : Math.round(draft.minSize / MB)}
          onChange={(value) => setSizeMb('minSize', value)}
        />
        <NumberField
          label="Up to"
          value={draft.maxSize == null ? undefined : Math.round(draft.maxSize / MB)}
          onChange={(value) => setSizeMb('maxSize', value)}
        />
      </View>

      <ThemedText type="footnote" themeColor="textSecondary">
        Format
      </ThemedText>
      <FormatInput
        value={(draft.formats ?? []).join(', ')}
        onChange={(text) =>
          setDraft((current) => ({
            ...current,
            formats: text
              .split(',')
              .map((value) => value.trim().toLowerCase())
              .filter(Boolean),
          }))
        }
      />

      {mediaType === 'video' ? (
        <>
          <ThemedText type="footnote" themeColor="textSecondary">
            Resolution
          </ThemedText>
          <View style={styles.row}>
            {VIDEO_RESOLUTIONS.map((value) => (
              <FilterChip
                key={value}
                label={value}
                selected={(draft.resolutions ?? []).includes(value)}
                onPress={() => toggleResolution(value)}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.actions}>
        <AppButton label="Reset" variant="ghost" onPress={onReset} />
        <AppButton label="Apply" variant="primary" onPress={() => onApply(sanitize(draft))} />
      </View>
    </View>
  );
}

/** Local draft state seeded once per sheet opening. */
function useStateFilter(initialFilter: MediaFilter) {
  const [draft, setDraft] = useState(() => ({ ...initialFilter }));
  return [draft, setDraft] as const;
}

function FormatInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const theme = useTheme();
  const fontScale = useFontScale();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={value ? undefined : 'e.g. mp3, m4a'}
      placeholderTextColor={theme.textSecondary}
      autoCapitalize="none"
      autoCorrect={false}
      style={[
        getTypographyStyles(fontScale).bodySmall,
        styles.input,
        styles.formatInput,
        { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderCurve: 'continuous',
  },
  field: {
    flex: 1,
    minWidth: 120,
    gap: Spacing.half,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    minHeight: 40,
  },
  formatInput: {
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
});
