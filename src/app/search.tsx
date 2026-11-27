import { router, useLocalSearchParams } from 'expo-router';
import {
  Album,
  Folder,
  MediaVideo,
  MusicDoubleNote,
  Playlist,
  Search,
  Sparks,
  User,
} from 'iconoir-react-native';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TrackRow } from '@/components/track-row';
import {
  EmptyState,
  InfoRow,
  LoadingState,
  Screen,
  SectionCard,
  ThemedIcon,
  TopBar,
  type AppIcon,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getSystemSmartLists } from '@/features/media-lists/services';
import { useMediaListStore } from '@/features/media-lists/store';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore, type Track } from '@/lib/db/store';
import { usePlayerStore } from '@/stores/player-store';
import { openTrackSheet } from '@/stores/track-sheet-store';
import { formatTime } from '@/utils/format';
import { hasSearchResults, SEARCH_RESULT_LIMIT, searchLibrary } from '@/utils/search';

/** Universal search across songs, videos, artists, albums, playlists and folders. */
export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(() => String(params.q ?? ''));
  const theme = useTheme();

  const tracks = useDbStore((s) => s.tracks);
  const artists = useDbStore((s) => s.artists);
  const albums = useDbStore((s) => s.albums);
  const playlists = useDbStore((s) => s.playlists);
  const folders = useDbStore((s) => s.folders);
  const positions = useDbStore((s) => s.playbackPositions);
  const customSmartLists = useMediaListStore((s) => s.customSmartLists);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const load = useDbStore((s) => s.load);
  const play = usePlayerStore((s) => s.play);
  const activeTrackId = usePlayerStore((s) => s.track?.id);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const results = useMemo(
    () =>
      searchLibrary(query, {
        tracks,
        artists,
        albums,
        playlists,
        folders,
        smartLists: [...getSystemSmartLists(), ...customSmartLists],
      }),
    [albums, artists, customSmartLists, folders, playlists, query, tracks],
  );
  const hasQuery = query.trim().length > 0;
  const found = hasSearchResults(results);

  return (
    <Screen header={<TopBar title="Search" showBack showSearch={false} />}>
      <View
        style={[
          styles.field,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <ThemedIcon icon={Search} size={18} color="textSecondary" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs, videos, lists, artists…"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          accessibilityLabel="Search your library"
          autoFocus
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {!isLoaded ? (
        <LoadingState message="Loading library…" />
      ) : !hasQuery ? (
        <SectionCard title="Search everything" icon={Search} iconSize={20}>
          <ThemedText type="bodySmall" themeColor="textSecondary">
            Find songs, videos, smart lists, artists, albums, playlists and folders in one place.
          </ThemedText>
        </SectionCard>
      ) : !found ? (
        <EmptyState
          icon={Search}
          message="No results found"
          description="Try a different title, artist, album, list or folder name."
        />
      ) : (
        <>
          {results.songs.length > 0 ? (
            <ResultSection title="Songs" icon={MusicDoubleNote} count={results.songs.length}>
              {results.songs.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  active={activeTrackId === track.id}
                  onPress={() => play(track)}
                  onLongPress={() => openTrackSheet(track)}
                />
              ))}
            </ResultSection>
          ) : null}

          {results.videos.length > 0 ? (
            <ResultSection title="Videos" icon={MediaVideo} count={results.videos.length}>
              {results.videos.map((track) => (
                <InfoRow
                  key={track.id}
                  label={track.title || track.uri}
                  subtitle={videoSubtitle(track, positions[track.id] ?? 0)}
                  icon={MediaVideo}
                  value="Play"
                  valueColor="textSecondary"
                  onPress={() => router.push(`/videos/${encodeURIComponent(track.id)}`)}
                  onLongPress={() => openTrackSheet(track)}
                />
              ))}
            </ResultSection>
          ) : null}

          {results.artists.length > 0 ? (
            <ResultSection title="Artists" icon={User} count={results.artists.length}>
              {results.artists.map((artist) => (
                <InfoRow
                  key={artist}
                  label={artist}
                  icon={User}
                  onPress={() => router.push(`/artists/${encodeURIComponent(artist)}`)}
                />
              ))}
            </ResultSection>
          ) : null}

          {results.albums.length > 0 ? (
            <ResultSection title="Albums" icon={Album} count={results.albums.length}>
              {results.albums.map((album) => (
                <InfoRow
                  key={`${album.artist}/${album.title}`}
                  label={album.title || 'Untitled album'}
                  subtitle={album.artist || undefined}
                  icon={Album}
                  onPress={() =>
                    router.push(
                      `/albums/${encodeURIComponent(album.artist || '_')}/${encodeURIComponent(album.title)}`,
                    )
                  }
                />
              ))}
            </ResultSection>
          ) : null}

          {results.playlists.length > 0 ? (
            <ResultSection title="Playlists" icon={Playlist} count={results.playlists.length}>
              {results.playlists.map((playlist) => (
                <InfoRow
                  key={playlist.id}
                  label={playlist.name}
                  icon={Playlist}
                  onPress={() => router.push(`/playlists/${playlist.id}`)}
                />
              ))}
            </ResultSection>
          ) : null}

          {results.folders.length > 0 ? (
            <ResultSection title="Folders" icon={Folder} count={results.folders.length}>
              {results.folders.map((folder) => (
                <InfoRow
                  key={folder.id}
                  label={folder.name}
                  subtitle={folder.mediaType === 'video' ? 'Videos' : 'Music'}
                  icon={Folder}
                  onPress={() => router.push(`/folders/${encodeURIComponent(folder.id)}`)}
                />
              ))}
            </ResultSection>
          ) : null}

          {results.smartLists.length > 0 ? (
            <ResultSection title="Smart Lists" icon={Sparks} count={results.smartLists.length}>
              {results.smartLists.map((list) => (
                <InfoRow
                  key={list.id}
                  label={list.name}
                  subtitle={list.description || 'Saved search'}
                  icon={Sparks}
                  onPress={() => router.push(`/smart-lists/${encodeURIComponent(list.id)}`)}
                />
              ))}
            </ResultSection>
          ) : null}

          <ThemedText type="caption" themeColor="textSecondary">
            Showing up to {SEARCH_RESULT_LIMIT} results per category.
          </ThemedText>
        </>
      )}
    </Screen>
  );
}

function ResultSection({
  title,
  icon,
  count,
  children,
}: PropsWithChildren<{ title: string; icon: AppIcon; count: number }>) {
  return (
    <SectionCard
      title={title}
      subtitle={`${count} result${count === 1 ? '' : 's'}`}
      icon={icon}
      iconSize={18}
      gap={Spacing.one}>
      {children}
    </SectionCard>
  );
}

function videoSubtitle(track: Track, position: number): string {
  const duration = formatTime(track.durationMs / 1000);
  return position > 10 ? `Resume ${formatTime(position)} · ${duration}` : duration;
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: 28,
    borderCurve: 'continuous',
  },
  input: {
    flex: 1,
    minWidth: 0,
  },
});
