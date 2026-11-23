import { Pause, Play } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { Scrubber } from '@/components/ui/scrubber';
import { Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useDbStore } from '@/lib/db/store';

const SAVE_INTERVAL_SECONDS = 5;
const MIN_SAVE_SECONDS = 10;
const END_GUARD_SECONDS = 10;

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams();
  const trackId = String(id ?? '');
  const track = useDbStore((s) => s.tracks.find((t) => t.id === trackId));
  const savedPosition = useDbStore((s) => s.playbackPositions[trackId] ?? 0);
  const setPlaybackPosition = useDbStore((s) => s.setPlaybackPosition);
  const recordPlayback = useDbStore((s) => s.recordPlayback);

  const videoUri = track?.uri;
  const player = useVideoPlayer(videoUri ?? null, (p) => {
    p.timeUpdateEventInterval = 0.25;
  });

  const [isPlaying, setIsPlaying] = useState(player.playing);
  const [currentTime, setCurrentTime] = useState(player.currentTime);
  const latestTime = useRef(savedPosition);
  const lastSaved = useRef(savedPosition);
  const resumeAt = useRef(savedPosition);
  const completed = useRef(false);

  useEffect(() => {
    resumeAt.current = savedPosition;
    latestTime.current = savedPosition;
    lastSaved.current = savedPosition;
  }, [savedPosition]);

  useEffect(() => {
    if (!videoUri || !trackId) return;
    completed.current = false;
    void player.replaceAsync(videoUri).then(() => {
      const duration = track?.durationMs ? track.durationMs / 1000 : player.duration;
      const position = resumeAt.current;
      if (position > MIN_SAVE_SECONDS && (duration <= 0 || position < duration - END_GUARD_SECONDS)) {
        player.currentTime = position;
      }
      void recordPlayback(trackId);
    });
  }, [videoUri, player, trackId, track?.durationMs, recordPlayback]);

  useEffect(() => {
    const playingSub = player.addListener('playingChange', ({ isPlaying: playing }) => setIsPlaying(playing));
    const timeSub = player.addListener('timeUpdate', ({ currentTime: time }) => {
      setCurrentTime(time);
      latestTime.current = time;
      if (time - lastSaved.current >= SAVE_INTERVAL_SECONDS) {
        lastSaved.current = time;
        void setPlaybackPosition(trackId, time);
      }
    });
    const endSub = player.addListener('playToEnd', () => {
      completed.current = true;
      latestTime.current = 0;
      void setPlaybackPosition(trackId, 0);
    });

    return () => {
      playingSub.remove();
      timeSub.remove();
      endSub.remove();
      const duration = player.duration;
      const time = latestTime.current;
      const worthSaving =
        !completed.current &&
        time >= MIN_SAVE_SECONDS &&
        (duration <= 0 || time < duration - END_GUARD_SECONDS);
      void setPlaybackPosition(trackId, worthSaving ? time : 0);
    };
  }, [player, trackId, setPlaybackPosition]);

  const togglePlay = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const seekTo = useCallback(
    // eslint-disable-next-line react-hooks/immutability -- seeking is an imperative player command.
    (seconds: number) => {
      // eslint-disable-next-line react-hooks/immutability -- seeking is an imperative player command.
      player.currentTime = seconds;
      latestTime.current = seconds;
      lastSaved.current = seconds;
    },
    [player],
  );

  return (
    <Screen title={track?.title || 'Video'} description={track?.artist || undefined}>
      <VideoView player={player} style={styles.video} contentFit="contain" />
      <Scrubber
        currentTime={currentTime}
        duration={player.duration}
        onSeek={seekTo}
      />
      <View style={styles.controls}>
        <IconButton icon={isPlaying ? Pause : Play} accessibilityLabel={isPlaying ? 'Pause' : 'Play'} onPress={togglePlay} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  controls: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});
