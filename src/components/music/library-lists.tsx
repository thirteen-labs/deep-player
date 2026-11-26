import { router } from 'expo-router';
import { Album, Playlist, Plus, User } from 'iconoir-react-native';
import { useMemo, useState } from 'react';

import {
  AppButton,
  CollectionList,
  EmptyState,
  LoadingState,
  NamePromptModal,
  SectionCard,
} from '@/components/ui';
import type { CollectionItem } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useDbStore } from '@/lib/db/store';

type LibraryRow = CollectionItem;

type RowListProps = {
  rows: LibraryRow[];
  isLoading?: boolean;
  emptyMessage: string;
  emptyDescription?: string;
};

/** Shared list body for album / artist / playlist library sections. */
function LibraryRowList({ rows, isLoading, emptyMessage, emptyDescription }: RowListProps) {
  if (isLoading) return <LoadingState message="Loading library…" />;

  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} description={emptyDescription} />;
  }

  return <CollectionList items={rows} />;
}

/** Albums section of the Music page. */
export function AlbumList() {
  const albums = useDbStore((s) => s.albums);
  const isLoaded = useDbStore((s) => s.isLoaded);

  const rows = useMemo<LibraryRow[]>(
    () =>
      albums.map((album) => {
        const title = album.title || 'Untitled album';
        return {
          key: `${album.artist || '_'}/${title}`,
          label: title,
          subtitle: album.artist || undefined,
          icon: Album,
          onPress: () =>
            router.push(
              `/albums/${encodeURIComponent(album.artist || '_')}/${encodeURIComponent(title)}`,
            ),
        };
      }),
    [albums],
  );

  return (
    <SectionCard title="Albums" subtitle="Browse by release" flush padding={Spacing.half} gap={Spacing.half}>
      <LibraryRowList
        rows={rows}
        isLoading={!isLoaded}
        emptyMessage="No albums yet"
        emptyDescription="Albums appear here after your library is scanned."
      />
    </SectionCard>
  );
}

/** Artists section of the Music page. */
export function ArtistList() {
  const artists = useDbStore((s) => s.artists);
  const isLoaded = useDbStore((s) => s.isLoaded);

  const rows = useMemo<LibraryRow[]>(
    () =>
      artists.map((artist) => ({
        key: artist,
        label: artist,
        icon: User,
        onPress: () => router.push(`/artists/${encodeURIComponent(artist)}`),
      })),
    [artists],
  );

  return (
    <SectionCard title="Artists" subtitle="Browse by performer" flush padding={Spacing.half} gap={Spacing.half}>
      <LibraryRowList
        rows={rows}
        isLoading={!isLoaded}
        emptyMessage="No artists yet"
        emptyDescription="Artists appear here after your library is scanned."
      />
    </SectionCard>
  );
}

/** Playlists section of the Music page. */
export function PlaylistList() {
  const playlists = useDbStore((s) => s.playlists);
  const playlistTracks = useDbStore((s) => s.playlistTracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const createPlaylist = useDbStore((s) => s.createPlaylist);
  const [isNaming, setIsNaming] = useState(false);

  const trackCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of playlistTracks) {
      counts.set(row.playlistId, (counts.get(row.playlistId) ?? 0) + 1);
    }
    return counts;
  }, [playlistTracks]);

  const rows = useMemo<LibraryRow[]>(
    () =>
      playlists.map((playlist) => ({
        key: playlist.id,
        label: playlist.name,
        value: `${trackCounts.get(playlist.id) ?? 0} tracks`,
        icon: Playlist,
        onPress: () => router.push(`/playlists/${playlist.id}`),
      })),
    [playlists, trackCounts],
  );

  return (
    <>
      <SectionCard
        title="Playlists"
        subtitle="Your custom collections"
        flush
        padding={Spacing.half}
        gap={Spacing.half}
        action={
          <AppButton
            label="New"
            icon={Plus}
            variant="ghost"
            size="small"
            onPress={() => setIsNaming(true)}
          />
        }>
        <LibraryRowList
          rows={rows}
          isLoading={!isLoaded}
          emptyMessage="No playlists yet"
          emptyDescription="Create one to group your favorite tracks."
        />
      </SectionCard>

      <NamePromptModal
        key={isNaming ? 'playlist-prompt-open' : 'playlist-prompt-closed'}
        visible={isNaming}
        title="New playlist"
        description="Give your playlist a name."
        value="New playlist"
        confirmLabel="Create"
        onCancel={() => setIsNaming(false)}
        onConfirm={(name) => {
          setIsNaming(false);
          void createPlaylist(name);
        }}
      />
    </>
  );
}
