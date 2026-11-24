import { MediaVideo } from 'iconoir-react-native';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';

import { EmptyState, Screen, SectionCard, TopBar } from '@/components/ui';
import { VideoList } from '@/components/videos/video-list';
import { useDbStore } from '@/lib/db/store';
import { scanVideos } from '@/lib/library/scan';
import { useSortStore } from '@/stores/sort-store';
import { sortTracks } from '@/utils/track-sorting';

/** Video library tab. */
export default function VideosScreen() {
  const tracks = useDbStore((s) => s.tracks);
  const load = useDbStore((s) => s.load);
  const positions = useDbStore((s) => s.playbackPositions);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);
  const universalSort = useSortStore((s) => s.universalSort);

  const videos = useMemo(
    () => sortTracks(tracks.filter((track) => track.mediaType === 'video'), universalSort),
    [tracks, universalSort],
  );

  const didScan = useRef(false);

  useEffect(() => {
    if (didScan.current) return;
    didScan.current = true;
    void (async () => {
      try {
        await scanVideos();
        await load();
      } catch (error) {
        didScan.current = false;
        console.warn('Video scan failed', error);
      }
    })();
  }, [load]);

  return (
    <Screen header={<TopBar title="Videos" showUniversalSort />}>
      <SectionCard>
        {videos.length === 0 ? (
          <EmptyState
            icon={MediaVideo}
            message="No videos yet"
            description="Your video library and player will show up here."
          />
        ) : (
          <VideoList
            videos={videos}
            positions={positions}
            onPress={(track) => router.push(`/videos/${encodeURIComponent(track.id)}`)}
            onFavorite={(track) => void toggleFavorite(track.id)}
          />
        )}
      </SectionCard>
    </Screen>
  );
}
