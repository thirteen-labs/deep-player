import { ChevronDown, ChevronUp, Minus, Music2, Pause, Play, Plus, SkipBack, SkipForward, Trash2, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { usePlayerStore } from '@/stores/player-store';

import { EmptyState } from './empty-state';
import { GlassView } from './glass-view';
import { IconButton } from './icon-button';
import { MediaArtwork } from './media-artwork';
import { Scrubber } from './scrubber';
import { SegmentedControl } from './segmented-control';
import { Spacing } from '@/constants/theme';
import { ToggleChip } from './toggle-chip';

const SPEEDS = [0.5, 1, 1.5, 2];

/** Full now-playing UI: artwork, transport, seek bar and player options. */
export function NowPlayingCard() {
  // Only this component re-renders on the player's 250 ms status updates.
  const player = usePlayerStore();
  const track = player.track;
  const repeatLabel =
    player.repeatMode === 'one' ? 'Repeat 1' : player.repeatMode === 'all' ? 'Repeat all' : 'Repeat';

  return (
    <GlassView style={styles.card}>
      {track ? (
        <View style={styles.body}>
          <MediaArtwork uri={track.artworkUri} size={160} radius={28} />
          <ThemedText type="smallBold" style={styles.tagline}>
            NOW PLAYING
          </ThemedText>
          <ThemedText type="subtitle" style={styles.title} numberOfLines={2}>
            {track.title || track.uri}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {track.artist || 'Unknown artist'}
          </ThemedText>

          <Scrubber
            currentTime={player.currentTime}
            duration={player.duration}
            onSeek={player.seekTo}
          />

          <View style={styles.controls}>
            <IconButton
              icon={SkipBack}
              accessibilityLabel="Previous track"
              onPress={player.previous}
            />
            <IconButton
              icon={player.isPlaying ? Pause : Play}
              accessibilityLabel={player.isPlaying ? 'Pause' : 'Play'}
              variant="primary"
              size={60}
              iconSize={28}
              onPress={player.togglePlay}
            />
            <IconButton
              icon={SkipForward}
              accessibilityLabel="Next track"
              onPress={player.next}
            />
          </View>

          <View style={styles.optionsRow}>
            <ToggleChip
              label={repeatLabel}
              active={player.repeatMode !== 'off'}
              onPress={player.toggleRepeat}
            />
            <ToggleChip
              label="Shuffle"
              active={player.shuffleMode === 'on'}
              onPress={player.toggleShuffle}
            />
          </View>

          <View style={styles.metaRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Speed
            </ThemedText>
            <SegmentedControl
              options={SPEEDS.map((speed) => ({ value: speed, label: `${speed}×` }))}
              value={player.speed}
              onValueChange={player.setSpeed}
            />
          </View>

          <View style={styles.metaRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Volume
            </ThemedText>
            <View style={styles.volumeRow}>
              <IconButton
                icon={Minus}
                accessibilityLabel="Decrease volume"
                size={32}
                iconSize={16}
                variant="secondary"
                onPress={() => player.setVolume(Math.max(0, player.volume - 0.1))}
              />
              <ThemedText type="small" themeColor="textSecondary" selectable>
                {Math.round(player.volume * 100)}%
              </ThemedText>
              <IconButton
                icon={Plus}
                accessibilityLabel="Increase volume"
                size={32}
                iconSize={16}
                variant="secondary"
                onPress={() => player.setVolume(Math.min(1, player.volume + 0.1))}
              />
            </View>
          </View>
          {player.queue.length > 0 ? (
            <View style={styles.queue}>
              <View style={styles.queueHeader}>
                <ThemedText type="smallBold" style={styles.queueTitle}>
                  Queue ({player.queue.length})
                </ThemedText>
                <IconButton
                  icon={X}
                  accessibilityLabel="Clear queue"
                  size={32}
                  iconSize={16}
                  variant="plain"
                  onPress={player.clearQueue}
                />
              </View>
              {player.queue.map((queued, index) => (
                <View key={`${queued.id}-${index}`} style={styles.queueItem}>
                  <View style={styles.queueInfo}>
                    <ThemedText numberOfLines={1}>{queued.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {queued.artist || 'Unknown artist'}
                    </ThemedText>
                  </View>
                  <View style={styles.queueActions}>
                    <IconButton
                      icon={ChevronUp}
                      accessibilityLabel="Move up"
                      size={32}
                      iconSize={16}
                      variant="plain"
                      disabled={index === 0}
                      onPress={() => player.moveQueueItem(index, index - 1)}
                    />
                    <IconButton
                      icon={ChevronDown}
                      accessibilityLabel="Move down"
                      size={32}
                      iconSize={16}
                      variant="plain"
                      disabled={index === player.queue.length - 1}
                      onPress={() => player.moveQueueItem(index, index + 1)}
                    />
                    <IconButton
                      icon={Trash2}
                      accessibilityLabel="Remove from queue"
                      size={32}
                      iconSize={16}
                      variant="plain"
                      onPress={() => player.removeFromQueue(index)}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : (
        <EmptyState
          icon={Music2}
          message="Nothing playing"
          description="Select a track from the library to start playing."
        />
      )}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: 28,
  },
  body: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  tagline: {
    letterSpacing: 2,
    marginTop: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    marginTop: Spacing.one,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.two,
    alignSelf: 'stretch',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginTop: Spacing.two,
    alignSelf: 'stretch',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  queue: {
    marginTop: Spacing.three,
    gap: Spacing.two,
    alignSelf: 'stretch',
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueTitle: {
    textTransform: 'uppercase',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  queueInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  queueActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
