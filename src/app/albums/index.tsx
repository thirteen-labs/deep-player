import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { InfoRow, Screen, SectionCard } from '@/components/ui';
import { useDbStore } from '@/lib/db/store';

export default function AlbumsListScreen() {
  const albums = useDbStore((s) => s.albums);

  return (
    <Screen title="Albums" description="Browse your library by album">
      <SectionCard>
        {albums.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No albums in your library yet.
          </ThemedText>
        ) : (
          <FlashList
            data={albums}
            renderItem={({ item }) => (
              <InfoRow
                label={item.title}
                subtitle={item.artist || undefined}
                onPress={() =>
                  router.push(`/albums/${encodeURIComponent(item.artist || '_')}/${encodeURIComponent(item.title)}`)
                }
              />
            )}
          />
        )}
      </SectionCard>
    </Screen>
  );
}
