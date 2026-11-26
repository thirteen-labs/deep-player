import { useState } from 'react';
import { Alert } from 'react-native';

import { useDbStore } from '@/lib/db/store';
import { scanMedia, type ScanKind } from '@/lib/library/scan';

export type { ScanKind } from '@/lib/library/scan';

/** Shared rescan action for the music and video settings screens. */
export function useLibraryScan() {
  const load = useDbStore((s) => s.load);
  const [isScanning, setIsScanning] = useState(false);

  const scan = async (kind: ScanKind) => {
    setIsScanning(true);
    try {
      await scanMedia(kind);
      await load();
      const label = kind === 'video' ? 'Videos' : kind === 'music' ? 'Music' : 'Music and videos';
      Alert.alert('Library updated', `${label} have been rescanned.`);
    } catch (error) {
      console.warn('Media library scan failed', error);
      Alert.alert('Scan failed', 'Unable to scan your media library.');
    } finally {
      setIsScanning(false);
    }
  };

  const refresh = async () => {
    await load();
    Alert.alert('Library refreshed', 'Your library is up to date.');
  };

  return { isScanning, scan, refresh };
}
