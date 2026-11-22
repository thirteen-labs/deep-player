import BottomSheet from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { Music2 } from 'lucide-react-native';
import { type ComponentRef } from 'react';
import { router } from 'expo-router';
import { fetchTrackMetadata } from '@/lib/metadata';
import { useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { TrackRow } from '@/components/track-row';
import { ThemedText } from '@/components/themed-text';
import {
  AppBottomSheet,
  AppButton,
  EmptyState,
  InfoRow,
  LoadingState,
  NowPlayingCard,
  Screen,
  SectionCard,
  TopBar,
  TrackList,
} from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useLibraryCacheWarming } from '@/hooks/use-library-cache-warming';
import { Spacing } from '@/constants/theme';
import { useDbStore, type Track } from '@/lib/db/store';
import { scanLibrary } from '@/lib/library/scan';
import { usePlayerStore } from '@/stores/player-store';
import { useSortStore } from '@/stores/sort-store';
import { sortTracks } from '@/utils/track-sorting';

export default function MusicScreen() {
  const activeTrackId = usePlayerStore((s) => s.track?.id);
  const play = usePlayerStore((s) => s.play);
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const tracks = useDbStore((s) => s.tracks);
  const artists = useDbStore((s) => s.artists);
  const albums = useDbStore((s) => s.albums);
  const recentlyPlayed = useDbStore((s) => s.recentlyPlayed);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const load = useDbStore((s) => s.load);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);
  const updateTrack = useDbStore((s) => s.updateTrack);
  const deleteTracks = useDbStore((s) => s.deleteTracks);

  const libraryTracks = useMemo(() => tracks.filter((t) => t.mediaType !== 'video'), [tracks]);
  const favoriteTracks = useMemo(() => libraryTracks.filter((t) => t.favorite), [libraryTracks]);

  const [query, setQuery] = useState('');
  const sortKey = useSortStore((s) => s.universalSort);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const editSheetRef = useRef<ComponentRef<typeof BottomSheet>>(null);

  const searchedTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? libraryTracks
      : libraryTracks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q) ||
            t.album.toLowerCase().includes(q)
        );
    return sortTracks(filtered, sortKey);
  }, [libraryTracks, query, sortKey]);

  useLibraryCacheWarming(tracks);

  const handleScan = async () => {
    try {
      await scanLibrary();
      await load();
    } catch (error) {
      console.warn('Library scan failed', error);
    }
  };

  const openEdit = (track: Track) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditArtist(track.artist);
    setEditAlbum(track.album);
    setEditGenre(track.genre);
    editSheetRef.current?.snapToIndex(0);
  };

  const closeEdit = () => {
    editSheetRef.current?.close();
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

  const confirmDelete = (ids: string[]) => {
    Alert.alert('Delete track(s)?', `Delete ${ids.length} selected track(s) from library?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTracks(ids);
          setSelectedIds(new Set());
          setSelectionMode(false);
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

  const selectedTracks = useMemo(() => tracks.filter((t) => selectedIds.has(t.id)), [tracks, selectedIds]);

  const bulkPlayNext = () => {
    selectedTracks.forEach((t) => playNext(t));
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const bulkAddToQueue = () => {
    selectedTracks.forEach((t) => addToQueue(t));
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  return (
    <Screen header={<TopBar title="Music" showUniversalSort />}>
      <NowPlayingCard />

      <SectionCard title="Library" gap={Spacing.one}>
        <InfoRow label="Tracks" value={libraryTracks.length} />
        <InfoRow label="Artists" value={artists.length} onPress={() => router.push('/artists')} />
        <InfoRow label="Albums" value={albums.length} onPress={() => router.push('/albums')} />
        <View style={styles.actions}>
          <AppButton label="Refresh library" variant="ghost" size="small" onPress={() => void load()} />
          <AppButton label="Scan library" variant="ghost" size="small" onPress={() => void handleScan()} />
        </View>
      </SectionCard>

      <SearchBox value={query} onChangeText={setQuery} />

      <SectionCard
        title="Tracks"
        gap={Spacing.one}
        action={
          <View style={styles.headerActions}>
            {selectionMode ? (
              <AppButton
                label="Cancel"
                variant="ghost"
                size="small"
                onPress={() => {
                  setSelectionMode(false);
                  setSelectedIds(new Set());
                }}
              />
            ) : (
              <AppButton label="Select" variant="ghost" size="small" onPress={() => setSelectionMode(true)} />
            )}
          </View>
        }>
        {selectionMode ? (
          <View style={styles.selectionBar}>
            <ThemedText type="small" themeColor="textSecondary">
              {selectedIds.size} selected
            </ThemedText>
            <View style={styles.selectionActions}>
              <AppButton label="Play next" variant="ghost" size="small" onPress={bulkPlayNext} disabled={selectedIds.size === 0} />
              <AppButton label="Queue" variant="ghost" size="small" onPress={bulkAddToQueue} disabled={selectedIds.size === 0} />
              <AppButton
                label="Delete"
                variant="ghost"
                size="small"
                onPress={() => confirmDelete([...selectedIds])}
                disabled={selectedIds.size === 0}
              />
            </View>
          </View>
        ) : null}

        {isLoaded ? (
          searchedTracks.length === 0 ? (
            <EmptyState icon={Music2} message="No tracks match your search." description="Try a different search term." />
          ) : (
            <View style={{ minHeight: 200 }}>
              <FlashList
                data={searchedTracks}
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
          )
        ) : (
          <LoadingState message="Loading tracks…" variant="block" />
        )}
      </SectionCard>

      {favoriteTracks.length > 0 ? (
        <SectionCard title="Favorites" gap={Spacing.one}>
          <TrackList
            tracks={favoriteTracks}
            activeTrackId={activeTrackId}
            selectedIds={selectedIds}
            selectionMode={selectionMode}
            onSelect={onRowPress}
            onLongPress={onRowLongPress}
            onFavoritePress={(t) => void toggleFavorite(t.id)}
            onPlayNextPress={(t) => playNext(t)}
            onAddToQueuePress={(t) => addToQueue(t)}
            onEditPress={openEdit}
            isLoading={!isLoaded}
          />
        </SectionCard>
      ) : null}

      {recentlyPlayed.length > 0 ? (
        <SectionCard title="Recently played" gap={Spacing.one}>
          <TrackList
            tracks={recentlyPlayed}
            activeTrackId={activeTrackId}
            selectedIds={selectedIds}
            selectionMode={selectionMode}
            onSelect={onRowPress}
            onLongPress={onRowLongPress}
            onFavoritePress={(t) => void toggleFavorite(t.id)}
            onPlayNextPress={(t) => playNext(t)}
            onAddToQueuePress={(t) => addToQueue(t)}
            onEditPress={openEdit}
            isLoading={!isLoaded}
          />
        </SectionCard>
      ) : null}

      <AppBottomSheet ref={editSheetRef} title="Edit track" snapPoints={['65%']}>
        <ThemedText type="small" themeColor="textSecondary">
          Update track info, fetch metadata, or delete.
        </ThemedText>
        <LabeledInput label="Title" value={editTitle} onChangeText={setEditTitle} />
        <LabeledInput label="Artist" value={editArtist} onChangeText={setEditArtist} />
        <LabeledInput label="Album" value={editAlbum} onChangeText={setEditAlbum} />
        <LabeledInput label="Genre" value={editGenre} onChangeText={setEditGenre} />
        <View style={styles.sheetActions}>
          <AppButton label="Save" variant="primary" size="small" onPress={() => void saveEdit()} />
          <AppButton label="Fetch metadata" variant="ghost" size="small" onPress={() => void fetchMetadata()} />
          <AppButton
            label="Delete"
            variant="ghost"
            size="small"
            onPress={() => editingTrack && confirmDelete([editingTrack.id])}
          />
        </View>
        <View style={{ height: Spacing.four }} />
      </AppBottomSheet>
    </Screen>
  );
}

function SearchBox({ value, onChangeText }: { value: string; onChangeText: (text: string) => void }) {
  const theme = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder="Search music…"
      placeholderTextColor={theme.textSecondary}
      style={[
        styles.search,
        { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
      ]}
      clearButtonMode="while-editing"
    />
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.inputWrap}>
      <ThemedText type="small" themeColor="textSecondary">
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  search: {
    marginVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.two,
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
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
});