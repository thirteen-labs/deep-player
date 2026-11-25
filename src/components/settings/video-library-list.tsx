import { router } from 'expo-router';
import { MediaVideo } from 'iconoir-react-native';
import { useEffect } from 'react';

import { EmptyState, LoadingState, Screen, SectionCard, TopBar } from '@/components/ui';
import type { Track } from '@/lib/db/schema';
import { useDbStore } from '@/lib/db/store';
import { VideoList } from '@/components/videos/video-list';

type VideoLibraryListProps = {
  title: string;
  videos: Track[];
  emptyMessage: string;
};

/** Shared settings screen shell for lists of videos. */
export function VideoLibraryList({ title, videos, emptyMessage }: VideoLibraryListProps) {
  const load = useDbStore((s) => s.load);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const positions = useDbStore((s) => s.playbackPositions);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  return (
    <Screen header={<TopBar title={title} showBack />}>
      <SectionCard
        title={title}
        subtitle={isLoaded ? `${videos.length} videos` : undefined}
        icon={MediaVideo}>
        {!isLoaded ? (
          <LoadingState message="Loading videos…" />
        ) : videos.length === 0 ? (
          <EmptyState icon={MediaVideo} message={emptyMessage} />
        ) : (
          <VideoList
            videos={videos}
            positions={positions}
            onPress={(track) => router.push(`/videos/${encodeURIComponent(track.id)}`)}
          />
        )}
      </SectionCard>
    </Screen>
  );
}
