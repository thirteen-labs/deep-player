import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';

import { TrackBrowser } from '@/components/music/track-browser';
import { AppButton, EmptyState, LoadingState, Screen, TopBar } from '@/components/ui';
import { VideoBrowser } from '@/components/videos/video-browser';
import { Sparks } from 'iconoir-react-native';
import { MediaListStateView } from '@/features/media-lists/components';
import { useLibraryMediaContext } from '@/features/media-lists/hooks';
import { evaluateSmartList, findSmartList, getSystemSmartLists } from '@/features/media-lists/services';
import { useMediaListStore } from '@/features/media-lists/store';
import { useDbStore } from '@/lib/db/store';

/** Evaluates one saved smart-list query and presents its media. */
export default function SmartListScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = String(params.id ?? '');
  const customLists = useMediaListStore((s) => s.customSmartLists);

  const tracks = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const error = useDbStore((s) => s.error);
  const load = useDbStore((s) => s.load);
  const context = useLibraryMediaContext();

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const list = useMemo(
    () => findSmartList([...getSystemSmartLists(), ...customLists], id),
    [customLists, id],
  );

  const matched = useMemo(
    () => (list ? evaluateSmartList(tracks, list, context) : []),
    [context, list, tracks],
  );
  const audioItems = useMemo(() => matched.filter((item) => item.mediaType !== 'video'), [matched]);
  const videoItems = useMemo(() => matched.filter((item) => item.mediaType === 'video'), [matched]);

  return (
    <Screen
      fullWidth
      header={
        <TopBar
          title={list?.name ?? 'Smart list'}
          showLogo={false}
          showBack
          showSearch={false}
        />
      }>
      {!isLoaded ? (
        <LoadingState message="Evaluating smart list…" variant="block" />
      ) : error ? (
        <MediaListStateView
          kind={/permission|denied/i.test(error) ? 'permission' : 'error'}
          description={error}
          action={<AppButton label="Retry" variant="ghost" onPress={() => void load()} />}
        />
      ) : !list ? (
        <EmptyState icon={Sparks} message="Smart list not found" description="It may have been deleted." />
      ) : matched.length === 0 ? (
        <MediaListStateView
          kind="empty"
          message="This list is empty"
          description="Its rules do not match anything in your library yet."
        />
      ) : (
        <>
          {audioItems.length > 0 ? (
            <TrackBrowser title="Music" tracks={audioItems} listKey={`smart:${id}:music`} />
          ) : null}
          {videoItems.length > 0 ? (
            <VideoBrowser title="Videos" videos={videoItems} listKey={`smart:${id}:video`} />
          ) : null}
        </>
      )}
    </Screen>
  );
}
