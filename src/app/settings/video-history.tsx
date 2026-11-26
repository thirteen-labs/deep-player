import { useMemo } from 'react';

import { VideoLibraryList } from '@/components/settings/video-library-list';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useDbStore } from '@/lib/db/store';

export default function VideoHistoryScreen() {
  const recentlyPlayed = useDbStore((s) => s.recentlyPlayed);
  const hideRecent = useSettingsStore((s) => s.settings.privacy.hideRecentMedia);
  const videos = useMemo(
    () => (hideRecent ? [] : recentlyPlayed.filter((track) => track.mediaType === 'video')),
    [recentlyPlayed, hideRecent],
  );

  return (
    <VideoLibraryList
      title="Video History"
      videos={videos}
      emptyMessage={hideRecent ? 'Recent media is hidden in privacy settings' : 'Nothing watched yet'}
    />
  );
}
