import {
  ChevronDown,
  ChevronUp,
  Heart,
  ListMusic,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import {
  AppButton,
  EmptyState,
  IconButton,
  MediaArtwork,
  PressableScale,
  Scrubber,
  SegmentedControl,
  VolumeSlider,
} from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMediaShortcuts } from '@/hooks/use-media-shortcuts';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore } from '@/lib/db/store';
import { PLAYBACK_SPEEDS, usePlayerStore } from '@/stores/player-store';

/** Full-screen audio player: artwork, transport, queue and player options. */
export default function AudioPlayerScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [showQueue, setShowQueue] = useState(false);

  const track = usePlayerStore((s) => s.track);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const speed = usePlayerStore((s) => s.speed);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const shuffleMode = usePlayerStore((s) => s.shuffleMode);
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seekBy = usePlayerStore((s) => s.seekBy);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const playAt = usePlayerStore((s) => s.playAt);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const cycleSpeed = usePlayerStore((s) => s.cycleSpeed);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const moveQueueItem = usePlayerStore((s) => s.moveQueueItem);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);

  const toggleFavorite = useDbStore((s) => s.toggleFavorite);

  const shortcuts = useMemo(
    () => ({
      togglePlay,
      seekBy,
      next,
      previous,
      adjustVolume: (delta: number) => setVolume(volume + delta),
      toggleMute,
      cycleSpeed,
      close: () => router.back(),
    }),
    [togglePlay, seekBy, next, previous, setVolume, volume, toggleMute, cycleSpeed],
  );
  useMediaShortcuts(shortcuts);

  const artworkSize = Math.min(340, Math.max(220, width - Spacing.four * 3));
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  if (!track) {
    return (
      <ScreenBackground>
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.empty}>
          <EmptyState
            icon={Music2}
            message="Nothing playing"
            description="Open the music library to pick a track and it will show up here."
          />
          <AppButton label="Browse music" icon={Music2} onPress={() => router.push('/music')} />
        </ScrollView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconButton
            icon={ChevronDown}
            accessibilityLabel="Close player"
            onPress={() => router.back()}
          />
          <View style={styles.headerCopy}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              NOW PLAYING
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {track.album || 'Deep Player'}
            </ThemedText>
          </View>
          <IconButton
            icon={ListMusic}
            accessibilityLabel={showQueue ? 'Hide queue' : 'Show queue'}
            active={showQueue}
            onPress={() => setShowQueue((visible) => !visible)}
          />
        </View>

        <View style={styles.hero}>
          <MediaArtwork
            uri={track.artworkUri}
            size={artworkSize}
            radius={28}
            style={styles.artwork}
          />
          <View style={styles.trackInfo}>
            <View style={styles.trackCopy}>
              <ThemedText type="subtitle" style={styles.title} numberOfLines={2} selectable>
                {track.title || track.uri}
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary" numberOfLines={1} selectable>
                {track.artist || 'Unknown artist'}
              </ThemedText>
            </View>
            <IconButton
              icon={Heart}
              accessibilityLabel={track.favorite ? 'Remove from favorites' : 'Add to favorites'}
              active={track.favorite}
              onPress={() => toggleFavorite(track.id)}
            />
          </View>
        </View>

        <Scrubber currentTime={currentTime} duration={duration} onSeek={seekTo} />

        <View style={styles.transport}>
          <IconButton
            icon={Shuffle}
            accessibilityLabel="Shuffle"
            active={shuffleMode === 'on'}
            onPress={toggleShuffle}
          />
          <IconButton
            icon={SkipBack}
            accessibilityLabel="Previous track"
            size={54}
            iconSize={26}
            onPress={previous}
          />
          <IconButton
            icon={isPlaying ? Pause : Play}
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            variant="primary"
            size={72}
            iconSize={32}
            onPress={togglePlay}
          />
          <IconButton
            icon={SkipForward}
            accessibilityLabel="Next track"
            size={54}
            iconSize={26}
            onPress={next}
          />
          <IconButton
            icon={RepeatIcon}
            accessibilityLabel={
              repeatMode === 'one' ? 'Repeat one' : repeatMode === 'all' ? 'Repeat all' : 'Repeat off'
            }
            active={repeatMode !== 'off'}
            onPress={toggleRepeat}
          />
        </View>

        <View style={styles.settingRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Speed
          </ThemedText>
          <SegmentedControl
            options={PLAYBACK_SPEEDS.map((value) => ({ value, label: `${value}×` }))}
            value={speed}
            onValueChange={setSpeed}
          />
        </View>

        <View style={styles.settingRow}>
          <IconButton
            icon={isMuted || volume === 0 ? VolumeX : Volume2}
            accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
            size={36}
            iconSize={18}
            onPress={toggleMute}
          />
          <VolumeSlider volume={volume} muted={isMuted} onVolumeChange={setVolume} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.volumeValue}>
            {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
          </ThemedText>
        </View>

        {showQueue ? (
          <View style={styles.queue}>
            <View style={styles.queueHeader}>
              <ThemedText type="smallBold">Queue ({queue.length})</ThemedText>
              <IconButton
                icon={X}
                accessibilityLabel="Hide queue"
                size={32}
                iconSize={16}
                onPress={() => setShowQueue(false)}
              />
            </View>
            {queue.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                The queue is empty. Add tracks from any library list.
              </ThemedText>
            ) : (
              queue.map((item, index) => (
                <View
                  key={`${item.id}-${index}`}
                  style={[
                    styles.queueRow,
                    index === queueIndex && { backgroundColor: theme.backgroundSelected },
                  ]}>
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel={`Play ${item.title}`}
                    onPress={() => playAt(index)}
                    style={styles.queueInfo}>
                    <MediaArtwork uri={item.artworkUri} size={40} radius={Spacing.one} />
                    <View style={styles.queueCopy}>
                      <ThemedText type="smallBold" numberOfLines={1}>
                        {item.title || item.uri}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                        {item.artist || 'Unknown artist'}
                      </ThemedText>
                    </View>
                  </PressableScale>
                  <IconButton
                    icon={ChevronUp}
                    accessibilityLabel="Move up"
                    size={30}
                    iconSize={15}
                    variant="plain"
                    disabled={index === 0}
                    onPress={() => moveQueueItem(index, index - 1)}
                  />
                  <IconButton
                    icon={ChevronDown}
                    accessibilityLabel="Move down"
                    size={30}
                    iconSize={15}
                    variant="plain"
                    disabled={index === queue.length - 1}
                    onPress={() => moveQueueItem(index, index + 1)}
                  />
                  <IconButton
                    icon={Trash2}
                    accessibilityLabel="Remove from queue"
                    size={30}
                    iconSize={15}
                    variant="plain"
                    onPress={() => removeFromQueue(index)}
                  />
                </View>
              ))
            )}
          </View>
        ) : null}

        {Platform.OS === 'web' ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint} selectable>
            Shortcuts — Space/K play · ←/→ seek 10s · J/L seek · N/B tracks · 9/0 volume · M mute · S
            speed · Esc close
          </ThemedText>
        ) : null}

        <View style={{ height: Spacing.two }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
  },
  eyebrow: {
    letterSpacing: 2,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  artwork: {
    boxShadow: '0 18px 45px rgba(0,0,0,0.28)',
  },
  trackInfo: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  trackCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  volumeValue: {
    width: 52,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  queue: {
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.18)',
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  queueInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
    paddingVertical: Spacing.half,
  },
  queueCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  hint: {
    lineHeight: 18,
  },
});
