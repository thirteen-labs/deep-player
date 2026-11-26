import { FlashList } from '@shopify/flash-list';
import { CheckCircle, MusicDoubleNote, Plus, SkipNext, Trash, Xmark } from 'iconoir-react-native';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TrackRow } from '@/components/track-row';
import { AppButton, EmptyState, LoadingState, SectionCard } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getTypographyStyles, Radius } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore, type Track } from '@/lib/db/store';
import { useFontScale } from '@/stores/font-size-store';
import { usePlayerStore } from '@/stores/player-store';
import { useSortStore } from '@/stores/sort-store';
import { openTrackSheet } from '@/stores/track-sheet-store';
import { sortTracks, type TrackSortKey } from '@/utils/track-sorting';

type TrackBrowserProps = {
  title: string;
  tracks: Track[];
  isLoading?: boolean;
  showSearch?: boolean;
  /** Overrides the universal sort key (e.g. the Music tab's own sort). */
  sortKey?: TrackSortKey;
};

/** Searchable, sortable track list with multi-select queue and delete actions. */
export function TrackBrowser({
  title,
  tracks,
  isLoading = false,
  showSearch = true,
  sortKey: sortKeyProp,
}: TrackBrowserProps) {
  const theme = useTheme();
  const fontScale = useFontScale();
  const universalSort = useSortStore((s) => s.universalSort);
  const sortKey = sortKeyProp ?? universalSort;
  const play = usePlayerStore((s) => s.play);
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const activeTrackId = usePlayerStore((s) => s.track?.id);
  const deleteTracks = useDbStore((s) => s.deleteTracks);

  const [query, setQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const visibleTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? tracks
      : tracks.filter(
          (track) =>
            track.title.toLowerCase().includes(q) ||
            track.artist.toLowerCase().includes(q) ||
            track.album.toLowerCase().includes(q),
        );
    return sortTracks(filtered, sortKey);
  }, [tracks, query, sortKey]);

  const selectedTracks = useMemo(
    () => tracks.filter((track) => selectedIds.has(track.id)),
    [tracks, selectedIds],
  );

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const confirmDelete = (ids: string[]) => {
    Alert.alert('Delete track(s)?', `Delete ${ids.length} selected track(s) from library?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTracks(ids);
          clearSelection();
        },
      },
    ]);
  };

  const toggleSelect = (trackId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const onRowPress = (track: Track) => {
    if (selectionMode) {
      toggleSelect(track.id);
      return;
    }
    play(track);
  };

  const onRowLongPress = (track: Track) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds(new Set([track.id]));
      return;
    }
    toggleSelect(track.id);
  };

  const queueSelected = (mode: 'next' | 'queue') => {
    selectedTracks.forEach((track) => (mode === 'next' ? playNext(track) : addToQueue(track)));
    clearSelection();
  };

  return (
    <SectionCard
      title={title}
      flush
      padding={Spacing.half}
      gap={Spacing.half}
      action={
        <AppButton
          label={selectionMode ? 'Cancel' : 'Select'}
          icon={selectionMode ? Xmark : CheckCircle}
          variant="ghost"
          size="small"
          onPress={selectionMode ? clearSelection : () => setSelectionMode(true)}
        />
      }>
      {showSearch ? (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={`Search ${title.toLowerCase()}…`}
          placeholderTextColor={theme.textSecondary}
          style={[
            getTypographyStyles(fontScale).body,
            styles.search,
            {
              backgroundColor: theme.backgroundElement,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          clearButtonMode="while-editing"
        />
      ) : null}

      {selectionMode ? (
        <View style={styles.selectionBar}>
          <ThemedText type="bodySmall" themeColor="textSecondary">
            {selectedIds.size} selected
          </ThemedText>
          <View style={styles.selectionActions}>
            <AppButton
              label="Play next"
              icon={SkipNext}
              variant="ghost"
              size="small"
              disabled={selectedIds.size === 0}
              onPress={() => queueSelected('next')}
            />
            <AppButton
              label="Queue"
              icon={Plus}
              variant="ghost"
              size="small"
              disabled={selectedIds.size === 0}
              onPress={() => queueSelected('queue')}
            />
            <AppButton
              label="Delete"
              icon={Trash}
              variant="ghost"
              size="small"
              disabled={selectedIds.size === 0}
              onPress={() => confirmDelete([...selectedIds])}
            />
          </View>
        </View>
      ) : null}

      {isLoading ? (
        <LoadingState message="Loading tracks…" variant="block" />
      ) : visibleTracks.length === 0 ? (
        <EmptyState
          icon={MusicDoubleNote}
          message={showSearch && query ? 'No tracks match your search.' : `No ${title.toLowerCase()} yet.`}
          description={showSearch && query ? 'Try a different search term.' : undefined}
        />
      ) : (
        <View style={styles.list}>
          <FlashList
            data={visibleTracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TrackRow
                track={item}
                index={index}
                active={activeTrackId === item.id}
                selected={selectedIds.has(item.id)}
                selectionMode={selectionMode}
                onPress={() => onRowPress(item)}
                onLongPress={() => onRowLongPress(item)}
                onMorePress={() => openTrackSheet(item)}
              />
            )}
            extraData={{ selectedIds, selectionMode, activeTrackId }}
          />
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  search: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.huge,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  list: {
    minHeight: 200,
  },
  selectionBar: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  selectionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
