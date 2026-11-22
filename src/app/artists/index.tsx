import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { InfoRow, Screen, SectionCard } from '@/components/ui';
import { useDbStore } from '@/lib/db/store';

export default function ArtistsListScreen() {
  const artists = useDbStore((s) => s.artists);

  return (
    <Screen title="Artists" description="Browse your library by artist">
      <SectionCard>
        {artists.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No artists in your library yet.
          </ThemedText>
        ) : (
          <FlashList
            data={artists}
            renderItem={({ item }) => (
              <InfoRow label={item} onPress={() => router.push(`/artists/${encodeURIComponent(item)}`)} />
            )}
          />
        )}
      </SectionCard>
    </Screen>
  );
}
