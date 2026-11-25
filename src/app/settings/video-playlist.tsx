import { useMemo } from 'react';

import { VideoLibraryList } from '@/components/settings/video-library-list';
import { useDbStore } from '@/lib/db/store';

export default function VideoPlaylistScreen() {
  const tracks = useDbStore((s) => s.tracks);
  const videos = useMemo(() => tracks.filter((track) => track.mediaType === 'video'), [tracks]);

  return <VideoLibraryList title="Video Playlist" videos={videos} emptyMessage="No videos yet" />;
}
