import { MediaVideo, Refresh, Search, Sparks } from 'iconoir-react-native';

import { AppButton, InfoRow, Screen, SectionCard, TopBar } from '@/components/ui';
import { useLibraryScan } from '@/hooks/use-library-scan';
import { useDbStore } from '@/lib/db/store';

export default function VideoSettingsScreen() {
  const tracks = useDbStore((s) => s.tracks);
  const folders = useDbStore((s) => s.folders);
  const { isScanning, scan, refresh } = useLibraryScan();

  const videoCount = tracks.filter((track) => track.mediaType === 'video').length;
  const smartListCount = folders.filter((folder) => folder.smartlistType === 'series').length;

  return (
    <Screen header={<TopBar title="Video settings" showBack />}>
      <SectionCard title="Video library" subtitle={`${videoCount} videos`} icon={MediaVideo} iconSize={20}>
        <AppButton
          label={isScanning ? 'Scanning…' : 'Scan videos'}
          icon={Search}
          variant="ghost"
          size="small"
          disabled={isScanning}
          onPress={() => void scan('video')}
        />
        <AppButton
          label="Refresh library"
          icon={Refresh}
          variant="ghost"
          size="small"
          disabled={isScanning}
          onPress={() => void refresh()}
        />
      </SectionCard>

      <SectionCard title="Smart lists" icon={Sparks} iconSize={20}>
        <InfoRow label="Active smart lists" value={smartListCount} icon={Sparks} iconSize={22} />
      </SectionCard>
    </Screen>
  );
}
