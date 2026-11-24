import { useEvent, useEventListener } from 'expo';
import {
  Check,
  ChevronLeft,
  Maximize2,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { isPictureInPictureSupported, VideoView, useVideoPlayer } from 'expo-video';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { ThemedText } from '@/components/themed-text';
import { IconButton, PressableScale, Scrubber } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useMediaShortcuts } from '@/hooks/use-media-shortcuts';
import { useDbStore } from '@/lib/db/store';

const SAVE_INTERVAL_SECONDS = 5;
const MIN_SAVE_SECONDS = 10;
const END_GUARD_SECONDS = 10;
const CONTROLS_TIMEOUT_MS = 3500;
const VIDEO_SPEEDS = [1, 1.25, 1.5, 2, 0.75, 0.5] as const;

/**
 * Immersive video player with an mpv-style overlay: tap for controls, seek in
 * 10s steps, cycle speed, PiP/fullscreen, and keyboard shortcuts on web.
 */
export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams();
  const trackId = String(id ?? '');
  const track = useDbStore((s) => s.tracks.find((t) => t.id === trackId));
  const setPlaybackPosition = useDbStore((s) => s.setPlaybackPosition);
  const recordPlayback = useDbStore((s) => s.recordPlayback);

  // Captured once per route so periodic position writes never re-trigger resume.
  const [initialPosition] = useState(
    () => useDbStore.getState().playbackPositions[trackId] ?? 0,
  );
  const videoUri = track?.uri ?? null;

  const player = useVideoPlayer(videoUri, (p) => {
    p.timeUpdateEventInterval = 0.25;
    p.staysActiveInBackground = true;
    p.showNowPlayingNotification = true;
    p.audioMixingMode = 'doNotMix';
    p.preservesPitch = true;
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { currentTime } = useEvent(player, 'timeUpdate', {
    currentTime: player.currentTime,
    currentLiveTimestamp: player.currentLiveTimestamp,
    currentOffsetFromLive: player.currentOffsetFromLive,
    bufferedPosition: player.bufferedPosition,
  });
  const { status, error } = useEvent(player, 'statusChange', {
    status: player.status,
    error: undefined,
  });

  const viewRef = useRef<VideoView>(null);
  const latestTime = useRef(initialPosition);
  const lastSaved = useRef(initialPosition);
  const completed = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInPip, setIsInPip] = useState(false);
  const pipSupported = useMemo(() => isPictureInPictureSupported(), []);

  useEffect(() => {
    if (!videoUri || !trackId) return;
    // Read again at load time in case the library finished loading after mount.
    const resumeAt = useDbStore.getState().playbackPositions[trackId] ?? initialPosition;
    completed.current = false;
    latestTime.current = resumeAt;
    lastSaved.current = resumeAt;
    void player.replaceAsync(videoUri).then(() => {
      const duration = track?.durationMs ? track.durationMs / 1000 : player.duration;
      if (
        resumeAt > MIN_SAVE_SECONDS &&
        (duration <= 0 || resumeAt < duration - END_GUARD_SECONDS)
      ) {
        player.currentTime = resumeAt;
      }
      void recordPlayback(trackId);
    });
  }, [videoUri, player, trackId, track?.durationMs, initialPosition, recordPlayback]);

  useEventListener(player, 'timeUpdate', ({ currentTime: time }) => {
    latestTime.current = time;
    if (time - lastSaved.current >= SAVE_INTERVAL_SECONDS) {
      lastSaved.current = time;
      void setPlaybackPosition(trackId, time);
    }
  });

  useEventListener(player, 'playToEnd', () => {
    completed.current = true;
    latestTime.current = 0;
    void setPlaybackPosition(trackId, 0);
  });

  useEffect(
    () => () => {
      const time = latestTime.current;
      const duration = player.duration;
      const worthSaving =
        !completed.current &&
        time >= MIN_SAVE_SECONDS &&
        (duration <= 0 || time < duration - END_GUARD_SECONDS);
      void setPlaybackPosition(trackId, worthSaving ? time : 0);
    },
    [player, trackId, setPlaybackPosition],
  );

  const togglePlay = useCallback(() => {
    if (player.playing) player.pause();
    else player.play();
  }, [player]);

  const seekBy = useCallback(
    (seconds: number) => {
      player.seekBy(seconds);
      latestTime.current = Math.max(0, latestTime.current + seconds);
      lastSaved.current = latestTime.current;
    },
    [player],
  );

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

  const toggleMute = useCallback(() => {
    const next = !player.muted;
    // eslint-disable-next-line react-hooks/immutability -- mutating the native player is intentional.
    player.muted = next;
    setIsMuted(next);
  }, [player]);

  const adjustVolume = useCallback(
    (delta: number) => {
      const next = Math.min(1, Math.max(0, player.volume + delta));
      // eslint-disable-next-line react-hooks/immutability -- mutating the native player is intentional.
      player.volume = next;
      if (next > 0 && player.muted) {
        player.muted = false;
        setIsMuted(false);
      }
    },
    [player],
  );

  const cycleSpeed = useCallback(() => {
    const index = VIDEO_SPEEDS.indexOf(speed as (typeof VIDEO_SPEEDS)[number]);
    const next = VIDEO_SPEEDS[(index + 1) % VIDEO_SPEEDS.length] ?? 1;
    // eslint-disable-next-line react-hooks/immutability -- mutating the native player is intentional.
    player.playbackRate = next;
    setSpeed(next);
  }, [player, speed]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (isFullscreen) await viewRef.current?.exitFullscreen();
      else await viewRef.current?.enterFullscreen();
    } catch (cause) {
      console.warn('Fullscreen toggle failed', cause);
    }
  }, [isFullscreen]);

  const togglePictureInPicture = useCallback(async () => {
    try {
      if (isInPip) await viewRef.current?.stopPictureInPicture();
      else await viewRef.current?.startPictureInPicture();
    } catch (cause) {
      console.warn('Picture-in-Picture toggle failed', cause);
    }
  }, [isInPip]);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!isPlaying) return;
    hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_TIMEOUT_MS);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    scheduleHide();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isPlaying, scheduleHide]);

  const toggleControls = useCallback(() => {
    const next = !controlsVisible;
    setControlsVisible(next);
    if (next) scheduleHide();
  }, [controlsVisible, scheduleHide]);

  const shortcuts = useMemo(
    () => ({
      togglePlay,
      seekBy,
      toggleMute,
      adjustVolume,
      cycleSpeed,
      toggleFullscreen: () => void toggleFullscreen(),
      togglePictureInPicture: pipSupported ? () => void togglePictureInPicture() : undefined,
      toggleControls,
      close: () => router.back(),
    }),
    [
      togglePlay,
      seekBy,
      toggleMute,
      adjustVolume,
      cycleSpeed,
      toggleFullscreen,
      togglePictureInPicture,
      pipSupported,
      toggleControls,
    ],
  );
  useMediaShortcuts(shortcuts);

  // Keep controls pinned while paused; auto-hide only applies during playback.
  const controlsShown = controlsVisible || !isPlaying;

  const statusMessage = error
    ? 'This video could not be loaded.'
    : status === 'loading'
      ? 'Loading video…'
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle player controls"
          onPress={toggleControls}
          style={StyleSheet.absoluteFill}
        />
        <VideoView
          ref={viewRef}
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          nativeControls={false}
          allowsPictureInPicture
          fullscreenOptions={{ enable: true }}
          onFullscreenEnter={() => setIsFullscreen(true)}
          onFullscreenExit={() => setIsFullscreen(false)}
          onPictureInPictureStart={() => setIsInPip(true)}
          onPictureInPictureStop={() => setIsInPip(false)}
          pointerEvents="none"
        />

        {statusMessage ? (
          <View style={styles.statusBadge} pointerEvents="none">
            <ThemedText type="small" style={styles.brightText}>
              {statusMessage}
            </ThemedText>
          </View>
        ) : null}

        {!isPlaying && !statusMessage ? (
          <View style={styles.centerBadge} pointerEvents="none">
            <ThemedIcon icon={Play} size={34} color="background" />
          </View>
        ) : null}

        {controlsShown ? (
          <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.topBar}>
              <IconButton
                icon={ChevronLeft}
                accessibilityLabel="Back to videos"
                style={styles.glassButton}
                onPress={() => router.back()}
              />
              <View style={styles.titleCopy}>
                <ThemedText type="smallBold" numberOfLines={1} style={styles.brightText}>
                  {track?.title || 'Video'}
                </ThemedText>
                <ThemedText type="small" numberOfLines={1} style={styles.mutedText}>
                  {track?.artist || ''}
                </ThemedText>
              </View>
              {pipSupported ? (
                <IconButton
                  icon={PictureInPicture2}
                  accessibilityLabel={isInPip ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}
                  active={isInPip}
                  style={styles.glassButton}
                  onPress={() => void togglePictureInPicture()}
                />
              ) : null}
            </View>

            <View style={styles.bottomBar}>
              <Scrubber
                currentTime={currentTime}
                duration={player.duration}
                onSeek={seekTo}
                variant="overlay"
              />
              <View style={styles.transport}>
                <IconButton
                  icon={isPlaying ? Pause : Play}
                  accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
                  variant="primary"
                  size={54}
                  iconSize={24}
                  onPress={togglePlay}
                />
                <IconButton
                  icon={RotateCcw}
                  accessibilityLabel="Back 10 seconds"
                  size={42}
                  iconSize={20}
                  style={styles.glassButton}
                  onPress={() => seekBy(-10)}
                />
                <IconButton
                  icon={RotateCw}
                  accessibilityLabel="Forward 10 seconds"
                  size={42}
                  iconSize={20}
                  style={styles.glassButton}
                  onPress={() => seekBy(10)}
                />
                <IconButton
                  icon={isMuted ? VolumeX : Volume2}
                  accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
                  size={42}
                  iconSize={20}
                  style={styles.glassButton}
                  onPress={toggleMute}
                />
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`Playback speed ${speed}×`}
                  onPress={cycleSpeed}
                  style={styles.speedButton}>
                  <ThemedText type="smallBold" style={styles.brightText}>
                    {speed}×
                  </ThemedText>
                </PressableScale>
                <IconButton
                  icon={isFullscreen ? Check : Maximize2}
                  accessibilityLabel={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  size={42}
                  iconSize={20}
                  style={styles.glassButton}
                  onPress={() => void toggleFullscreen()}
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  stage: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  titleCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  bottomBar: {
    gap: Spacing.two,
    padding: Spacing.two,
    paddingBottom: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.half,
  },
  glassButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  speedButton: {
    minWidth: 46,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  brightText: {
    color: '#FFFFFF',
  },
  mutedText: {
    color: 'rgba(255,255,255,0.68)',
  },
  statusBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  centerBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
