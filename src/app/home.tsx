import { router } from 'expo-router';
import { Film, Folder, ListMusic, Music2 } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton, InfoRow, Screen, SectionCard, TopBar } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useDbStore } from '@/lib/db/store';

export default function HomeScreen() {
  const tracks = useDbStore((s) => s.tracks);
  const folders = useDbStore((s) => s.folders);
  const playlists = useDbStore((s) => s.playlists);

  const musicCount = tracks.filter((t) => t.mediaType !== 'video').length;
  const videoCount = tracks.filter((t) => t.mediaType === 'video').length;

  return (
    <Screen header={<TopBar title="Home" showUniversalSort showSmartSort />}>
      <SectionCard title="Welcome to Deep Player">
        <ThemedText type="default" themeColor="textSecondary">
          Your music and video library, organized your way.
        </ThemedText>
      </SectionCard>

      <SectionCard title="Library at a glance" gap={Spacing.one}>
        <InfoRow label="Music tracks" value={musicCount} icon={Music2} onPress={() => router.push('/music')} />
        <InfoRow label="Videos" value={videoCount} icon={Film} onPress={() => router.push('/videos')} />
        <InfoRow label="Folders" value={folders.length} icon={Folder} onPress={() => router.push('/folders')} />
        <InfoRow label="Playlists" value={playlists.length} icon={ListMusic} onPress={() => router.push('/folders')} />
      </SectionCard>

      <SectionCard title="Quick actions" gap={Spacing.two}>
        <AppButton label="Open music library" icon={Music2} variant="primary" onPress={() => router.push('/music')} />
        <AppButton label="Browse folders" icon={Folder} variant="secondary" onPress={() => router.push('/folders')} />
        <AppButton label="Watch videos" icon={Film} variant="secondary" onPress={() => router.push('/videos')} />
      </SectionCard>
    </Screen>
  );
}
