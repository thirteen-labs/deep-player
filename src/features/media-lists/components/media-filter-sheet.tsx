import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton, PressableScale } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { Radius, getTypographyStyles } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore } from '@/lib/db/store';
import { useFontScale } from '@/stores/font-size-store';

import type { MediaFilter, MediaType } from '../types';

const MB = 1024 * 1024;
const VIDEO_RESOLUTIONS = ['720p', '1080p', '4K'];
const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'music', label: 'Music' },
  { value: 'video', label: 'Video' },
];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a YYYY-MM-DD input into UTC milliseconds (whole day for "to"). */
function parseDate(value: string, endOfDay: boolean): number | undefined {
  if (!DATE_PATTERN.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = Date.UTC(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  );
  const date = new Date(parsed);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }
  return parsed;
}

function formatDate(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export interface MediaFilterSheetProps {
  initialFilter: MediaFilter;
  /** Media type of the enclosing list; used as the default type selection. */
  mediaType: MediaType;
  /** Types this list can show. Other types stay visible but cannot be selected. */
  availableMediaTypes?: MediaType[];
  onApply: (filter: MediaFilter) => void;
  onReset: () => void;
}

function FilterChip({
  label,
  selected,
  disabled = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.backgroundSelected : theme.background,
          opacity: disabled ? 0.4 : 1,
        },
      ]}>
      <ThemedText type="label" themeColor={selected ? 'tint' : 'textSecondary'}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

function TextField({
  label,
  value,
  placeholder,
  maxLength,
  autoCorrect = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  maxLength?: number;
  autoCorrect?: boolean;
  onChange: (value: string) => void;
}) {
  const theme = useTheme();
  const fontScale = useFontScale();
  return (
    <View style={styles.field}>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={autoCorrect}
        maxLength={maxLength}
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
  availableMediaTypes,
  onApply,
  onReset,
}: MediaFilterSheetProps) {
  const [draft, setDraft] = useStateFilter(initialFilter);
  const [dateFrom, setDateFrom] = useState(() => formatDate(initialFilter.dateAddedFrom));
  const [dateTo, setDateTo] = useState(() => formatDate(initialFilter.dateAddedTo));
  const folders = useDbStore((s) => s.folders);

  const allowedTypes = availableMediaTypes ?? MEDIA_TYPES.map((option) => option.value);
  // Only folders with real membership rows can be matched by the query engine.
  // Seeded smartlists (favorites/recent) and "All Music" are virtual folders.
  const filterableFolders = folders.filter(
    (folder) =>
      folder.kind === 'folder' &&
      folder.id !== 'folder:all' &&
      allowedTypes.includes(folder.mediaType),
  );

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

  const toggleMediaType = (value: MediaType) =>
    setDraft((current) => {
      const values = current.mediaTypes ?? [mediaType];
      const next = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];
      return { ...current, mediaTypes: next };
    });

  const toggleFolder = (id: string) =>
    setDraft((current) => {
      const values = current.folderIds ?? [];
      return {
        ...current,
        folderIds: values.includes(id)
          ? values.filter((item) => item !== id)
          : [...values, id],
      };
    });

  const updateDateFrom = (text: string) => {
    setDateFrom(text);
    setDraft((current) => ({ ...current, dateAddedFrom: parseDate(text, false) }));
  };

  const updateDateTo = (text: string) => {
    setDateTo(text);
    setDraft((current) => ({ ...current, dateAddedTo: parseDate(text, true) }));
  };

  const sanitize = (filter: MediaFilter): MediaFilter => {
    const next: MediaFilter = { ...filter };
    for (const key of [
      'minDuration',
      'maxDuration',
      'minSize',
      'maxSize',
      'dateAddedFrom',
      'dateAddedTo',
    ] as const) {
      if (next[key] != null && !Number.isFinite(next[key])) delete next[key];
    }
    for (const key of ['mediaTypes', 'folderIds', 'formats', 'resolutions'] as const) {
      if (next[key]?.length === 0) delete next[key];
    }
    return next;
  };

  const selectedTypes = draft.mediaTypes ?? [mediaType];

  return (
    <View style={styles.container}>
      <ThemedText type="footnote" themeColor="textSecondary">
        Media type
      </ThemedText>
      <View style={styles.row}>
        {MEDIA_TYPES.map(({ value, label }) => (
          <FilterChip
            key={value}
            label={label}
            selected={selectedTypes.includes(value)}
            disabled={!allowedTypes.includes(value)}
            onPress={() => toggleMediaType(value)}
          />
        ))}
      </View>
      {allowedTypes.length === 1 ? (
        <ThemedText type="caption" themeColor="textSecondary">
          This list only shows {allowedTypes[0] === 'video' ? 'videos' : 'music'}.
        </ThemedText>
      ) : null}

      <ThemedText type="footnote" themeColor="textSecondary">
        Folder
      </ThemedText>
      {filterableFolders.length ? (
        <View style={styles.row}>
          {filterableFolders.map((folder) => (
            <FilterChip
              key={folder.id}
              label={folder.name}
              selected={(draft.folderIds ?? []).includes(folder.id)}
              onPress={() => toggleFolder(folder.id)}
            />
          ))}
        </View>
      ) : (
        <ThemedText type="caption" themeColor="textSecondary">
          No folders available for this media type yet.
        </ThemedText>
      )}

      <ThemedText type="footnote" themeColor="textSecondary">
        Date added
      </ThemedText>
      <View style={styles.row}>
        <TextField
          label="From"
          value={dateFrom}
          placeholder="YYYY-MM-DD"
          maxLength={10}
          onChange={updateDateFrom}
        />
        <TextField
          label="To"
          value={dateTo}
          placeholder="YYYY-MM-DD"
          maxLength={10}
          onChange={updateDateTo}
        />
      </View>

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
        <TextField
          label="Minimum"
          value={draft.minDuration == null ? '' : String(draft.minDuration)}
          placeholder="Any"
          onChange={(text) => setNumber('minDuration', text.trim() === '' ? undefined : Number(text))}
        />
        <TextField
          label="Maximum"
          value={draft.maxDuration == null ? '' : String(draft.maxDuration)}
          placeholder="Any"
          onChange={(text) => setNumber('maxDuration', text.trim() === '' ? undefined : Number(text))}
        />
      </View>

      <ThemedText type="footnote" themeColor="textSecondary">
        File size (MB)
      </ThemedText>
      <View style={styles.row}>
        <TextField
          label="At least"
          value={draft.minSize == null ? '' : String(Math.round(draft.minSize / MB))}
          placeholder="Any"
          onChange={(text) => setSizeMb('minSize', text.trim() === '' ? undefined : Number(text))}
        />
        <TextField
          label="Up to"
          value={draft.maxSize == null ? '' : String(Math.round(draft.maxSize / MB))}
          placeholder="Any"
          onChange={(text) => setSizeMb('maxSize', text.trim() === '' ? undefined : Number(text))}
        />
      </View>

      <ThemedText type="footnote" themeColor="textSecondary">
        Format
      </ThemedText>
      <TextField
        label="Extensions"
        value={(draft.formats ?? []).join(', ')}
        placeholder="e.g. mp3, m4a"
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
});
