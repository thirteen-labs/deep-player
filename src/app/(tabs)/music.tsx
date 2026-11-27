import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { AlbumList, ArtistList, PlaylistList } from '@/components/music/library-lists';
import { MusicTopBar } from '@/components/music/music-top-bar';
import type { MusicSection } from '@/components/music/music-tabs';
import { TrackBrowser } from '@/components/music/track-browser';
import { NowPlayingCard, Screen } from '@/components/ui';
import { useDbStore } from '@/lib/db/store';

const MUSIC_SECTIONS: MusicSection[] = [
  'songs',
  'playlists',
  'albums',
  'artists',
  'favorites',
];

function isMusicSection(value: string): value is MusicSection {
  return MUSIC_SECTIONS.some((section) => section === value);
}

/** Music library: one route with inner tabs instead of duplicate list screens. */
export default function MusicScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const requestedSection = String(params.section ?? '');
  const initialSection: MusicSection = isMusicSection(requestedSection)
    ? requestedSection
    : 'songs';
  const [tabState, setTabState] = useState({
    param: requestedSection,
    section: initialSection,
  });

  // Derive the active tab from the route param without mirroring it in an effect.
  const section =
    tabState.param === requestedSection
      ? tabState.section
      : isMusicSection(requestedSection)
        ? requestedSection
        : 'songs';
  const setSection = (next: MusicSection) =>
    setTabState({ param: requestedSection, section: next });

  const tracks = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const error = useDbStore((s) => s.error);
  const load = useDbStore((s) => s.load);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const libraryTracks = useMemo(() => tracks.filter((t) => t.mediaType !== 'video'), [tracks]);

  return (
    <Screen fullWidth header={<MusicTopBar value={section} onValueChange={setSection} listKey={`music:${section}`} />}>
      <NowPlayingCard />

      {section === 'songs' ? (
        <TrackBrowser
          title="Songs"
          tracks={libraryTracks}
          isLoading={!isLoaded}
          error={error}
          permissionDenied={/permission|denied/i.test(error ?? '')}
          onRetry={() => void load()}
          listKey="music:songs"
        />
      ) : null}
      {section === 'favorites' ? (
        <TrackBrowser
          title="Favorites"
          tracks={libraryTracks}
          isLoading={!isLoaded}
          error={error}
          permissionDenied={/permission|denied/i.test(error ?? '')}
          onRetry={() => void load()}
          listKey="music:favorites"
          lockedFilter={{ favoritesOnly: true }}
        />
      ) : null}
      {section === 'playlists' ? <PlaylistList /> : null}
      {section === 'albums' ? <AlbumList /> : null}
      {section === 'artists' ? <ArtistList /> : null}
    </Screen>
  );
}
