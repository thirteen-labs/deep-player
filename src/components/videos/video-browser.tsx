import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Check, MediaVideo, MoreHoriz, Play } from 'iconoir-react-native';
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet, AppButton, IconButton, MediaArtwork, PressableScale, ThemedIcon } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { Radius } from '@/constants/typography';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore, type Track } from '@/lib/db/store';
import { openTrackSheet } from '@/stores/track-sheet-store';
import { formatTime } from '@/utils/format';
import { withAlpha } from '@/utils/color';

import {
  MediaFilterSheet,
  MediaItemNotice,
  MediaListStateView,
  MediaListToolbar,
  MediaSelectionBar,
} from '@/features/media-lists/components';
import {
  useAdaptiveColumns,
  useLegacySortBridge,
  useLibraryMediaContext,
  useMediaFilter,
  useMediaLayout,
  useMediaListState,
  useMediaQuery,
  useMediaSelection,
  useMediaSort,
  useMissingMediaIds,
} from '@/features/media-lists/hooks';
import { deleteConfirmationMessage } from '@/features/media-lists/services';
import { resolutionLabel, type MediaFilter } from '@/features/media-lists/types';

type VideoBrowserProps = {
  title?: string;
  videos: Track[];
  isLoading?: boolean;
  error?: string | null;
  permissionDenied?: boolean;
  /** Re-runs the media scan after a failure. */
  onRetry?: () => void;
  listKey?: string;
  showSearch?: boolean;
};

/** Responsive video grid/list backed by the shared media-list engine. */
export function VideoBrowser({
  title = 'Videos',
  videos,
  isLoading = false,
  error,
  permissionDenied = false,
  onRetry,
  listKey = 'video:all',
  showSearch = true,
}: VideoBrowserProps) {
  const resolvedKey = `video:${listKey.replace(/^video:/, '')}`;
  useLegacySortBridge(resolvedKey, 'video');
  const { sort } = useMediaSort(resolvedKey, 'video');
  const { filter, setFilter, clearFilter } = useMediaFilter(resolvedKey);
  const { layout, setLayout, preference } = useMediaLayout(resolvedKey, 'video');
  const context = useLibraryMediaContext();
  const hideArtwork = useSettingsStore((s) => s.settings.privacy.hideSensitiveThumbnails);
  const columns = useAdaptiveColumns(preference.columns);

  const [query, setQuery] = useState('');
  const [sheetVersion, setSheetVersion] = useState(0);
  const filterSheetRef = useRef<ComponentRef<typeof AppBottomSheet>>(null);

  const effectiveFilter = useMemo<MediaFilter>(
    () => ({ ...filter, mediaTypes: ['video'] }),
    [filter],
  );
  const { items: visibleVideos, total } = useMediaQuery(videos, {
    search: query,
    filter: effectiveFilter,
    sort,
    context,
  });

  const selection = useMediaSelection(visibleVideos);
  const missingIds = useMissingMediaIds(visibleVideos);
  const state = useMediaListState({
    isLoading,
    error,
    count: visibleVideos.length,
    permissionDenied,
    search: query,
    missingCount: missingIds.size,
  });
  const filterActive = Object.keys(filter).length > 0;
  const deleteTracks = useDbStore((s) => s.deleteTracks);

  const openVideo = (track: Track) => router.push(`/videos/${encodeURIComponent(track.id)}`);

  const playSelected = () => {
    const first = selection.selectedItems[0];
    if (!first) return;
    openVideo(first);
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
    <View style={styles.container}>
      <MediaListToolbar
        query={query}
        onQueryChange={setQuery}
        showSearch={showSearch}
        placeholder={`Search ${title.toLowerCase()}…`}
        onFilterPress={openFilters}
        onSearchAll={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
        filterActive={filterActive}
        resultCount={state ? undefined : total}
        action={
          <AppButton
            label={layout === 'grid' ? 'List' : 'Grid'}
            variant="ghost"
            size="small"
            onPress={() => setLayout(layout === 'grid' ? 'list' : 'grid', preference.columns)}
          />
        }
      />

      {selection.selectionMode ? (
        <MediaSelectionBar
          count={selection.count}
          allSelected={selection.count >= visibleVideos.length && visibleVideos.length > 0}
          onSelectAll={selection.selectAll}
          onClear={selection.clear}
          onPlay={playSelected}
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
            data={visibleVideos}
            keyExtractor={(item) => item.id}
            numColumns={layout === 'grid' ? columns : 1}
            renderItem={({ item }) =>
              layout === 'grid' ? (
                <VideoTile
                  track={item}
                  position={context.playbackPositions?.[item.id] ?? 0}
                  selected={selection.selectedIds.has(item.id)}
                  selectionMode={selection.selectionMode}
                  onPress={() => selection.handlePress(item.id, () => openVideo(item))}
                  onLongPress={() => selection.handleLongPress(item.id)}
                  onMorePress={() => openTrackSheet(item)}
                  notice={
                    missingIds.has(item.id)
                      ? 'File unavailable'
                      : !hideArtwork && !item.artworkUri
                        ? 'No thumbnail'
                        : undefined
                  }
                />
              ) : (
                <VideoRow
                  track={item}
                  position={context.playbackPositions?.[item.id] ?? 0}
                  selected={selection.selectedIds.has(item.id)}
                  selectionMode={selection.selectionMode}
                  onPress={() => selection.handlePress(item.id, () => openVideo(item))}
                  onLongPress={() => selection.handleLongPress(item.id)}
                  onMorePress={() => openTrackSheet(item)}
                  notice={
                    missingIds.has(item.id)
                      ? 'File unavailable'
                      : !hideArtwork && !item.artworkUri
                        ? 'No thumbnail'
                        : undefined
                  }
                />
              )
            }
            extraData={{
              selectedIds: selection.selectedIds,
              selectionMode: selection.selectionMode,
              layout,
            }}
          />
        </View>
      )}

      <AppBottomSheet
        ref={filterSheetRef}
        title={`Filter ${title.toLowerCase()}`}
        icon={MediaVideo}
        scrollable
        snapPoints={['85%']}>
        <MediaFilterSheet
          key={sheetVersion}
          initialFilter={filter}
          mediaType="video"
          availableMediaTypes={['video']}
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
    </View>
  );
}

function videoSubtitle(track: Track, position: number) {
  const duration = track.durationMs > 0 ? formatTime(track.durationMs / 1000) : '0:00';
  const parts = [duration, resolutionLabel(track)].filter(Boolean);
  return position > 10 ? `Resume ${formatTime(position)} · ${parts.join(' · ')}` : parts.join(' · ');
}

function SelectionBadge({ selected }: { selected: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.selectionBadge,
        {
          backgroundColor: selected ? theme.tint : withAlpha(theme.background, 0.8),
          borderColor: selected ? theme.tint : theme.border,
        },
      ]}>
      {selected ? <ThemedIcon icon={Check} size={14} color={theme.background} /> : null}
    </View>
  );
}

function VideoTile({
  track,
  position,
  selected,
  selectionMode,
  onPress,
  onLongPress,
  onMorePress,
  notice,
}: {
  track: Track;
  position: number;
  selected: boolean;
  selectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onMorePress: () => void;
  notice?: string;
}) {
  const theme = useTheme();
  const ratio = track.durationMs > 0 ? Math.min(1, position / (track.durationMs / 1000)) : 0;

  return (
    <View style={styles.gridItem}>
      <View style={styles.tile}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${selectionMode ? 'Select' : 'Play'} ${track.title}`}
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.tileMain}>
          <View style={styles.artworkWrap}>
            <MediaArtwork
              uri={track.artworkUri}
              size={120}
              radius={Radius.md}
              fallbackIcon={MediaVideo}
              style={styles.tileArtwork}
            />
            {ratio > 0 ? (
              <View style={[styles.progressTrack, { backgroundColor: withAlpha(theme.background, 0.5) }]}>
                <View style={[styles.progressFill, { backgroundColor: theme.tint, width: `${ratio * 100}%` }]} />
              </View>
            ) : null}
          </View>
          <ThemedText type="label" numberOfLines={2} style={styles.tileTitle}>
            {track.title || track.uri}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {videoSubtitle(track, position)}
          </ThemedText>
          {notice ? <MediaItemNotice label={notice} /> : null}
        </PressableScale>

        {selectionMode ? <SelectionBadge selected={selected} /> : null}
        {!selectionMode ? (
          <IconButton
            icon={MoreHoriz}
            accessibilityLabel="Video options"
            size={32}
            iconSize={16}
            variant="plain"
            style={styles.tileMore}
            onPress={onMorePress}
          />
        ) : null}
      </View>
    </View>
  );
}

function VideoRow({
  track,
  position,
  selected,
  selectionMode,
  onPress,
  onLongPress,
  onMorePress,
  notice,
}: {
  track: Track;
  position: number;
  selected: boolean;
  selectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onMorePress: () => void;
  notice?: string;
}) {
  const theme = useTheme();
  const ratio = track.durationMs > 0 ? Math.min(1, position / (track.durationMs / 1000)) : 0;

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: selected ? theme.backgroundSelected : 'transparent', borderRadius: Radius.md },
      ]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${selectionMode ? 'Select' : 'Play'} ${track.title}`}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.rowMain}>
        {selectionMode ? (
          <SelectionBadge selected={selected} />
        ) : (
          <View style={styles.artworkWrap}>
            <MediaArtwork
              uri={track.artworkUri}
              size={48}
              radius={Spacing.two}
              fallbackIcon={MediaVideo}
            />
            {ratio > 0 ? (
              <View style={[styles.progressTrack, { backgroundColor: withAlpha(theme.background, 0.5) }]}>
                <View style={[styles.progressFill, { backgroundColor: theme.tint, width: `${ratio * 100}%` }]} />
              </View>
            ) : null}
          </View>
        )}
        <View style={styles.rowCopy}>
          <ThemedText type="label" numberOfLines={1}>
            {track.title || track.uri}
          </ThemedText>
          <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={1}>
            {videoSubtitle(track, position)}
          </ThemedText>
          {notice ? <MediaItemNotice label={notice} /> : null}
        </View>
      </PressableScale>
      {!selectionMode ? (
        <IconButton
          icon={Play}
          accessibilityLabel={`Play ${track.title}`}
          size={36}
          iconSize={18}
          variant="plain"
          onPress={onPress}
        />
      ) : null}
      {!selectionMode ? (
        <IconButton
          icon={MoreHoriz}
          accessibilityLabel="Video options"
          size={36}
          iconSize={18}
          variant="plain"
          onPress={onMorePress}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  list: {
    minHeight: 200,
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
    padding: Spacing.half,
  },
  tile: {
    borderRadius: Radius.md,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  tileMain: {
    gap: Spacing.one,
  },
  tileTitle: {
    marginTop: Spacing.half,
  },
  artworkWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  tileArtwork: {
    width: '100%',
    height: 110,
    alignSelf: 'stretch',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },
  progressFill: {
    height: '100%',
  },
  selectionBadge: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileMore: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.half,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowCopy: {
    flex: 1,
    gap: Spacing.half,
  },
});
