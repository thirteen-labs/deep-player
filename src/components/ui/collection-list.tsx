import { FlashList } from '@shopify/flash-list';
import { MusicDoubleNote } from 'iconoir-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLayoutStore } from '@/stores/layout-store';
import { withAlpha } from '@/utils/color';

import { GlassView } from './glass-view';
import { InfoRow } from './info-row';
import { MediaArtwork } from './media-artwork';
import { PressableScale } from './pressable-scale';
import { ThemedIcon, type AppIcon } from './themed-icon';

export type CollectionItem = {
  key: string;
  label: string;
  subtitle?: string;
  /** Right-aligned detail used by flex rows. */
  value?: ReactNode;
  icon?: AppIcon;
  artworkUri?: string | null;
  onPress: () => void;
};

type CollectionListProps = {
  items: CollectionItem[];
};

/** Library collection list that follows the Appearance → List layout setting. */
export function CollectionList({ items }: CollectionListProps) {
  const isGrid = useLayoutStore((s) => s.listLayout) === 'grid';

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => item.key}
      numColumns={isGrid ? 2 : 1}
      renderItem={({ item }) =>
        isGrid ? (
          <CollectionTile item={item} />
        ) : (
          <InfoRow
            label={item.label}
            subtitle={item.subtitle}
            value={item.value}
            valueColor="textSecondary"
            icon={item.icon}
            onPress={item.onPress}
          />
        )
      }
    />
  );
}

/** Two-column tile used when the user picks the grid layout. */
export function CollectionTile({ item }: { item: CollectionItem }) {
  const theme = useTheme();
  const detail =
    item.subtitle ??
    (typeof item.value === 'string' || typeof item.value === 'number'
      ? String(item.value)
      : undefined);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={item.onPress}
      style={styles.press}>
      <GlassView style={styles.tile}>
        {item.artworkUri || item.icon ? (
          item.artworkUri ? (
            <MediaArtwork
              uri={item.artworkUri}
              size={72}
              radius={16}
              fallbackIcon={item.icon ?? MusicDoubleNote}
              style={styles.artwork}
            />
          ) : (
            <View style={[styles.iconBadge, { backgroundColor: withAlpha(theme.tint, 0.14) }]}>
              <ThemedIcon icon={item.icon!} size={24} color="tint" />
            </View>
          )
        ) : null}
        <ThemedText type="label" numberOfLines={2}>
          {item.label}
        </ThemedText>
        {detail ? (
          <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={1}>
            {detail}
          </ThemedText>
        ) : null}
      </GlassView>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  press: {
    flex: 1,
    minWidth: 0,
    margin: Spacing.one,
  },
  tile: {
    minHeight: 138,
    padding: Spacing.two,
    borderRadius: 18,
    gap: Spacing.two,
  },
  artwork: {
    alignSelf: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
