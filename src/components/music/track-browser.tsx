import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { CheckCircle, Filter, MusicDoubleNote, Xmark } from 'iconoir-react-native';
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { TrackRow } from '@/components/track-row';
import { AppBottomSheet, AppButton, SectionCard } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useDbStore, type Track } from '@/lib/db/store';
import { usePlayerStore } from '@/stores/player-store';
import { openTrackSheet } from '@/stores/track-sheet-store';

import {
  MediaFilterSheet,
  MediaListStateView,
  MediaListToolbar,
  MediaSelectionBar,
} from '@/features/media-lists/components';
import {
  useLibraryMediaContext,
  useMediaFilter,
  useMediaListState,
  useMediaQuery,
  useMediaSelection,
  useMediaSort,
  useMissingMediaIds,
} from '@/features/media-lists/hooks';
import { deleteConfirmationMessage } from '@/features/media-lists/services';
import type { MediaFilter } from '@/features/media-lists/types';

type TrackBrowserProps = {
  title: string;
  tracks: Track[];
  isLoading?: boolean;
  error?: string | null;
  permissionDenied?: boolean;
  /** Re-runs the library load after an error. */
  onRetry?: () => void;
  /** Stable key used to remember this list's sort, filter and layout. */
  listKey?: string;
  showSearch?: boolean;
  /** Filters enforced by the enclosing list (for example Favorites). */
  lockedFilter?: MediaFilter;
};

/** Compact Music list backed by the shared media-list query engine. */
export function TrackBrowser({
  title,
  tracks,
  isLoading = false,
  error,
  permissionDenied = false,
  onRetry,
  listKey,
  showSearch = true,
  lockedFilter,
}: TrackBrowserProps) {
  const resolvedListKey = listKey ?? `music:${title.toLowerCase().replace(/\s+/g, '-')}`;
  const { sort } = useMediaSort(resolvedListKey, 'music');
  const { filter, setFilter, clearFilter } = useMediaFilter(resolvedListKey);
  const context = useLibraryMediaContext();
  const hideArtwork = useSettingsStore((s) => s.settings.privacy.hideSensitiveThumbnails);

  const [query, setQuery] = useState('');
  const [sheetVersion, setSheetVersion] = useState(0);
  const filterSheetRef = useRef<ComponentRef<typeof AppBottomSheet>>(null);

  const effectiveFilter = useMemo<MediaFilter>(
    () => ({ ...filter, mediaTypes: ['music'], ...lockedFilter }),
    [filter, lockedFilter],
  );

  const { items: visibleTracks, total } = useMediaQuery(tracks, {
    search: query,
    filter: effectiveFilter,
    sort,
    context,
  });

  const selection = useMediaSelection(visibleTracks);
  const missingIds = useMissingMediaIds(visibleTracks);
  const state = useMediaListState({
    isLoading,
    error,
    count: visibleTracks.length,
    search: query,
    permissionDenied,
    missingCount: missingIds.size,
  });
  const filterActive = Object.keys(filter).length > 0;

  const play = usePlayerStore((s) => s.play);
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const setQueue = usePlayerStore((s) => s.setQueue);
  const activeTrackId = usePlayerStore((s) => s.track?.id);
  const deleteTracks = useDbStore((s) => s.deleteTracks);

  const playSelected = () => {
    const [first, ...rest] = selection.selectedItems;
    if (!first) return;
    setQueue([first, ...rest], 0);
    play(first);
    selection.clear();
  };

  const queueSelected = (mode: 'next' | 'queue') => {
    selection.selectedItems.forEach((track) => (mode === 'next' ? playNext(track) : addToQueue(track)));
    selection.clear();
  };

  const confirmDelete = () => {
    const items = selection.selectedItems;
    if (items.length === 0) return;
    Alert.alert('Remove from library?', deleteConfirmationMessage(items), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteTracks(items.map((item) => item.id));
          selection.clear();
        },
      },
    ]);
  };

  const openFilters = () => {
    setSheetVersion((value) => value + 1);
    filterSheetRef.current?.expand();
  };

  return (
    <SectionCard
      title={title}
      flush
      padding={Spacing.half}
      gap={Spacing.half}
      action={
        <AppButton
          label={selection.selectionMode ? 'Cancel' : 'Select'}
          icon={selection.selectionMode ? Xmark : CheckCircle}
          variant="ghost"
          size="small"
          onPress={selection.selectionMode ? selection.clear : () => selection.enterSelection()}
        />
      }>
      <MediaListToolbar
        query={query}
        onQueryChange={setQuery}
        showSearch={showSearch}
        placeholder={`Search ${title.toLowerCase()}…`}
        onFilterPress={openFilters}
        onSearchAll={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
        filterActive={filterActive}
        resultCount={state ? undefined : total}
      />

      {selection.selectionMode ? (
        <MediaSelectionBar
          count={selection.count}
          allSelected={selection.count >= visibleTracks.length && visibleTracks.length > 0}
          onSelectAll={selection.selectAll}
          onClear={selection.clear}
          onPlay={playSelected}
          onPlayNext={() => queueSelected('next')}
          onQueue={() => queueSelected('queue')}
          onDelete={confirmDelete}
        />
      ) : null}

      {state ? (
        <MediaListStateView
          kind={state}
          message={state === 'empty' ? `No ${title.toLowerCase()} yet.` : undefined}
          description={
            state === 'error'
              ? error ?? undefined
              : state === 'search'
                ? 'Try a different search term or clear your filters.'
                : undefined
          }
          action={
            state === 'error' && onRetry ? (
              <AppButton label="Retry" variant="ghost" size="small" onPress={onRetry} />
            ) : state === 'search' || (state === 'empty' && (filterActive || query.length > 0)) ? (
              <AppButton
                label="Clear filters"
                variant="ghost"
                size="small"
                onPress={() => {
                  setQuery('');
                  clearFilter();
                }}
              />
            ) : undefined
          }
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
                selected={selection.selectedIds.has(item.id)}
                selectionMode={selection.selectionMode}
                onPress={() => selection.handlePress(item.id, () => play(item))}
                onLongPress={() => selection.handleLongPress(item.id)}
                onMorePress={() => openTrackSheet(item)}
                notice={
                  missingIds.has(item.id)
                    ? 'File unavailable'
                    : !hideArtwork && !item.artworkUri
                      ? 'No artwork'
                      : undefined
                }
              />
            )}
            extraData={{
              selectedIds: selection.selectedIds,
              selectionMode: selection.selectionMode,
              activeTrackId,
            }}
            ListEmptyComponent={
              <MediaListStateView
                kind="empty"
                icon={MusicDoubleNote}
                message={`No ${title.toLowerCase()} yet.`}
              />
            }
          />
        </View>
      )}

      <AppBottomSheet
        ref={filterSheetRef}
        title={`Filter ${title.toLowerCase()}`}
        icon={Filter}
        scrollable
        snapPoints={['85%']}>
        <MediaFilterSheet
          key={sheetVersion}
          initialFilter={filter}
          mediaType="music"
          availableMediaTypes={['music']}
          onApply={(next) => {
            setFilter(next);
            filterSheetRef.current?.close();
          }}
          onReset={() => {
            clearFilter();
            filterSheetRef.current?.close();
          }}
        />
      </AppBottomSheet>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  list: {
    minHeight: 200,
  },
});
