import { MediaVideo } from 'iconoir-react-native';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';

import { EmptyState, Screen, SectionCard, TopBar } from '@/components/ui';
import { VideoList } from '@/components/videos/video-list';
import { Spacing } from '@/constants/theme';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useDbStore } from '@/lib/db/store';
import { scanMedia } from '@/lib/library/scan';
import { useSortStore } from '@/stores/sort-store';
import { sortTracks } from '@/utils/track-sorting';

// Custom tabs can remount a screen when it is revisited. Keep the automatic
// scan at module scope so tab switches never start another media scan.
let didScanVideos = false;

/** Video library tab. */
export default function VideosScreen() {
  const tracks = useDbStore((s) => s.tracks);
  const load = useDbStore((s) => s.load);
  const positions = useDbStore((s) => s.playbackPositions);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);
  const universalSort = useSortStore((s) => s.universalSort);
  const autoScan = useSettingsStore((s) => s.settings.folders.autoScan);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);

  const videos = useMemo(
    () => sortTracks(tracks.filter((track) => track.mediaType === 'video'), universalSort),
    [tracks, universalSort],
  );

  useEffect(() => {
    if (!settingsHydrated || !autoScan || didScanVideos) return;
    didScanVideos = true;
    void (async () => {
      try {
        await scanMedia('video');
        await load();
      } catch (error) {
        didScanVideos = false;
        console.warn('Video scan failed', error);
      }
    })();
  }, [load, autoScan, settingsHydrated]);

  return (
    <Screen
      fullWidth
      header={<TopBar title="Videos" showLogo={false} showUniversalSort showSearch />}>
      <SectionCard flush padding={Spacing.half} gap={Spacing.half}>
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
