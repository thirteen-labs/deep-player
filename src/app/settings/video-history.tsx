import { useMemo } from 'react';

import { VideoLibraryList } from '@/components/settings/video-library-list';
import { useDbStore } from '@/lib/db/store';

export default function VideoHistoryScreen() {
  const recentlyPlayed = useDbStore((s) => s.recentlyPlayed);
  const videos = useMemo(
    () => recentlyPlayed.filter((track) => track.mediaType === 'video'),
    [recentlyPlayed],
  );

  return <VideoLibraryList title="Video History" videos={videos} emptyMessage="Nothing watched yet" />;
}
