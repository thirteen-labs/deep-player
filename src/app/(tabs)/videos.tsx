import { useCallback, useEffect, useMemo, useState } from 'react';

import { Screen, TopBar } from '@/components/ui';
import { VideoBrowser } from '@/components/videos/video-browser';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useDbStore } from '@/lib/db/store';
import { scanMedia } from '@/lib/library/scan';

// Custom tabs can remount a screen when it is revisited. Keep the automatic
// scan at module scope so tab switches never start another media scan.
let didScanVideos = false;

/** Video library tab. */
export default function VideosScreen() {
  const tracks = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const error = useDbStore((s) => s.error);
  const load = useDbStore((s) => s.load);
  const autoScan = useSettingsStore((s) => s.settings.folders.autoScan);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const [scanError, setScanError] = useState<string | null>(null);

  const videos = useMemo(() => tracks.filter((track) => track.mediaType === 'video'), [tracks]);

  const runScan = useCallback(async () => {
    setScanError(null);
    try {
      await scanMedia('video');
      await load();
    } catch (scanError) {
      setScanError(String(scanError));
      console.warn('Video scan failed', scanError);
    }
  }, [load]);

  const retryScan = useCallback(() => {
    didScanVideos = false;
    return runScan();
  }, [runScan]);

  useEffect(() => {
    if (!settingsHydrated || !autoScan || didScanVideos) return;
    didScanVideos = true;
    void (async () => {
      await runScan();
    })();
  }, [autoScan, runScan, settingsHydrated]);

  return (
    <Screen
      fullWidth
      header={<TopBar title="Videos" showLogo={false} showUniversalSort showSearch />}>
      <VideoBrowser
        videos={videos}
        isLoading={!isLoaded}
        error={error ?? scanError}
        permissionDenied={/permission|denied/i.test(scanError ?? '')}
        onRetry={retryScan}
        listKey="video:all"
      />
    </Screen>
  );
}
