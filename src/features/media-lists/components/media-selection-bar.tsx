import { CheckCircle, Plus, SkipNext, Trash, Xmark } from 'iconoir-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui';
import { Spacing } from '@/constants/theme';

type MediaSelectionBarProps = {
  count: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onClear: () => void;
  onPlay: () => void;
  onPlayNext?: () => void;
  onQueue?: () => void;
  onDelete: () => void;
};

/** Shared multi-select action bar; callbacks stay in the list adapter. */
export function MediaSelectionBar({
  count,
  allSelected,
  onSelectAll,
  onClear,
  onPlay,
  onPlayNext,
  onQueue,
  onDelete,
}: MediaSelectionBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="label" themeColor="textSecondary">
          {count} selected
        </ThemedText>
        <AppButton
          label={allSelected ? 'Clear all' : 'Select all'}
          icon={allSelected ? Xmark : CheckCircle}
          variant="ghost"
          size="small"
          onPress={allSelected ? onClear : onSelectAll}
        />
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Play"
          icon={CheckCircle}
          variant="ghost"
          size="small"
          disabled={count === 0}
          onPress={onPlay}
        />
        {onPlayNext ? (
          <AppButton
            label="Play next"
            icon={SkipNext}
            variant="ghost"
            size="small"
            disabled={count === 0}
            onPress={onPlayNext}
          />
        ) : null}
        {onQueue ? (
          <AppButton
            label="Queue"
            icon={Plus}
            variant="ghost"
            size="small"
            disabled={count === 0}
            onPress={onQueue}
          />
        ) : null}
        <AppButton
          label="Delete"
          icon={Trash}
          variant="ghost"
          size="small"
          disabled={count === 0}
          onPress={onDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});
