import BottomSheet from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { MusicDoubleNote } from 'iconoir-react-native';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TrackRow } from '@/components/track-row';
import {
  AppBottomSheet,
  AppButton,
  EmptyState,
  LoadingState,
  SectionCard,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { Radius, Typography } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore, type Track } from '@/lib/db/store';
import { fetchTrackMetadata } from '@/lib/metadata';
import { usePlayerStore } from '@/stores/player-store';
import { useSortStore } from '@/stores/sort-store';
import { sortTracks } from '@/utils/track-sorting';

type TrackBrowserProps = {
  title: string;
  tracks: Track[];
  isLoading?: boolean;
  showSearch?: boolean;
};

/** Searchable, sortable track list with selection and metadata editing. */
export function TrackBrowser({
  title,
  tracks,
  isLoading = false,
  showSearch = true,
}: TrackBrowserProps) {
  const theme = useTheme();
  const sortKey = useSortStore((s) => s.universalSort);
  const play = usePlayerStore((s) => s.play);
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const activeTrackId = usePlayerStore((s) => s.track?.id);
  const updateTrack = useDbStore((s) => s.updateTrack);
  const deleteTracks = useDbStore((s) => s.deleteTracks);

  const [query, setQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const editSheetRef = useRef<ComponentRef<typeof BottomSheet>>(null);

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

  const closeEdit = () => editSheetRef.current?.close();

  const openEdit = (track: Track) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditArtist(track.artist);
    setEditAlbum(track.album);
    setEditGenre(track.genre);
    editSheetRef.current?.snapToIndex(0);
  };

  const saveEdit = async () => {
    if (!editingTrack) return;
    await updateTrack(editingTrack.id, {
      title: editTitle.trim() || editingTrack.title,
      artist: editArtist.trim(),
      album: editAlbum.trim(),
      genre: editGenre.trim(),
    });
    closeEdit();
  };

  const fetchMetadata = async () => {
    if (!editingTrack) return;
    try {
      const meta = await fetchTrackMetadata(editingTrack);
      if (meta.title) setEditTitle(meta.title);
      if (meta.artist !== undefined) setEditArtist(meta.artist ?? '');
      if (meta.album !== undefined) setEditAlbum(meta.album ?? '');
      if (meta.genre !== undefined) setEditGenre(meta.genre ?? '');
      if (Object.keys(meta).length === 0) {
        Alert.alert('No metadata found', 'Could not read embedded tags for this track.');
      }
    } catch (error) {
      console.warn('Metadata fetch failed', error);
      Alert.alert('Metadata fetch failed', 'Unable to read metadata from this file.');
    }
  };

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
          closeEdit();
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
    <>
      <SectionCard
        title={title}
        gap={Spacing.one}
        action={
          <AppButton
            label={selectionMode ? 'Cancel' : 'Select'}
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
                variant="ghost"
                size="small"
                disabled={selectedIds.size === 0}
                onPress={() => queueSelected('next')}
              />
              <AppButton
                label="Queue"
                variant="ghost"
                size="small"
                disabled={selectedIds.size === 0}
                onPress={() => queueSelected('queue')}
              />
              <AppButton
                label="Delete"
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
                  onEditPress={() => openEdit(item)}
                />
              )}
              extraData={{ selectedIds, selectionMode, activeTrackId }}
            />
          </View>
        )}
      </SectionCard>

      <AppBottomSheet ref={editSheetRef} title="Edit track" snapPoints={['65%']}>
        <ThemedText type="bodySmall" themeColor="textSecondary">
          Update track info, fetch metadata, or delete.
        </ThemedText>
        <LabeledInput label="Title" value={editTitle} onChangeText={setEditTitle} />
        <LabeledInput label="Artist" value={editArtist} onChangeText={setEditArtist} />
        <LabeledInput label="Album" value={editAlbum} onChangeText={setEditAlbum} />
        <LabeledInput label="Genre" value={editGenre} onChangeText={setEditGenre} />
        <View style={styles.sheetActions}>
          <AppButton label="Save" variant="primary" size="small" onPress={() => void saveEdit()} />
          <AppButton
            label="Fetch metadata"
            variant="ghost"
            size="small"
            onPress={() => void fetchMetadata()}
          />
          <AppButton
            label="Delete"
            variant="ghost"
            size="small"
            onPress={() => editingTrack && confirmDelete([editingTrack.id])}
          />
        </View>
        <View style={{ height: Spacing.four }} />
      </AppBottomSheet>
    </>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.inputWrap}>
      <ThemedText type="bodySmall" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
        placeholder={label}
        placeholderTextColor={theme.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    ...Typography.body,
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
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  inputWrap: {
    gap: Spacing.one,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
