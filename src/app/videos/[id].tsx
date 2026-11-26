import { useEvent, useEventListener } from 'expo';
import {
  Check,
  NavArrowLeft,
  Maximize,
  Pause,
  MultiWindow,
  Play,
  Undo,
  Redo,
  SoundHigh,
  SoundOff,
} from 'iconoir-react-native';
import { NavigationBar } from 'expo-navigation-bar';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import {
  isPictureInPictureSupported,
  VideoView,
  useVideoPlayer,
  type VideoContentFit,
} from 'expo-video';

import { ThemeOverrideProvider } from '@/components/theme-override';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ThemedText } from '@/components/themed-text';
import { IconButton, PressableScale, Scrubber } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { isCapabilitySupported } from '@/features/settings/capabilities/capability.registry';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useArtworkPalette } from '@/hooks/use-artwork-palette';
import { useMediaShortcuts } from '@/hooks/use-media-shortcuts';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore } from '@/lib/db/store';
import { withAlpha } from '@/utils/color';

const SAVE_INTERVAL_SECONDS = 5;
const MIN_SAVE_SECONDS = 10;
const END_GUARD_SECONDS = 10;
const VIDEO_SPEEDS = [1, 1.25, 1.5, 2, 0.75, 0.5] as const;

/** Maps the settings zoom/aspect preferences onto expo-video's content fit. */
function resolveContentFit(
  zoomMode: 'fit' | 'fill' | 'zoom',
  aspectRatio: 'fit' | 'fill' | 'crop' | 'stretch',
): VideoContentFit {
  if (zoomMode === 'zoom' || aspectRatio === 'crop') return 'cover';
  if (zoomMode === 'fill' || aspectRatio === 'fill' || aspectRatio === 'stretch') return 'fill';
  return 'contain';
}

/** Converts the current physical orientation into a lock policy. */
function clampSpeed(value: number): number {
  return Math.min(4, Math.max(0.25, Number.isFinite(value) ? value : 1));
}

function lockForOrientation(
  orientation: ScreenOrientation.Orientation,
): ScreenOrientation.OrientationLock {
  const Lock = ScreenOrientation.OrientationLock;
  switch (orientation) {
    case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
      return Lock.LANDSCAPE_LEFT;
    case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
      return Lock.LANDSCAPE_RIGHT;
    case ScreenOrientation.Orientation.PORTRAIT_DOWN:
      return Lock.PORTRAIT_DOWN;
    case ScreenOrientation.Orientation.PORTRAIT_UP:
      return Lock.PORTRAIT_UP;
    default:
      return Lock.DEFAULT;
  }
}

/**
 * Immersive video player with an mpv-style overlay: tap for controls, seek in
 * configurable steps, cycle speed, PiP/fullscreen, and keyboard shortcuts on web.
 */
export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams();
  const baseTheme = useTheme();
  const trackId = String(id ?? '');
  const track = useDbStore((s) => s.tracks.find((t) => t.id === trackId));
  const artworkPalette = useArtworkPalette(track?.artworkUri);
  const theme = artworkPalette ?? baseTheme;
  const setPlaybackPosition = useDbStore((s) => s.setPlaybackPosition);
  const recordPlayback = useDbStore((s) => s.recordPlayback);
  const videoSettings = useSettingsStore((s) => s.settings.video);
  const playbackSettings = useSettingsStore((s) => s.settings.playback);
  const notificationSettings = useSettingsStore((s) => s.settings.notifications);

  // Captured once per route so periodic position writes never re-trigger resume.
  const [initialPosition] = useState(
    () => useDbStore.getState().playbackPositions[trackId] ?? 0,
  );
  // The configured default speed is applied once, at player creation.
  const [speed, setSpeed] = useState(() => {
    const { audio: audioPrefs, playback: playbackPrefs } = useSettingsStore.getState().settings;
    return clampSpeed(
      audioPrefs.defaultSpeed !== 1 ? audioPrefs.defaultSpeed : playbackPrefs.defaultSpeed,
    );
  });
  const videoUri = track?.uri ?? null;

  const lockScreenActive =
    playbackSettings.notificationControls && notificationSettings.lockScreenControls;
  const videoAudioMixingMode =
    playbackSettings.audioFocus === 'strict' || lockScreenActive
      ? 'doNotMix'
      : playbackSettings.duckOnInterruption
        ? 'duckOthers'
        : 'mixWithOthers';

  const player = useVideoPlayer(videoUri, (p) => {
    p.timeUpdateEventInterval = 0.25;
    p.staysActiveInBackground = playbackSettings.backgroundVideoAudio;
    p.showNowPlayingNotification = lockScreenActive && notificationSettings.playbackNotification;
    p.audioMixingMode = videoAudioMixingMode;
    p.preservesPitch = true;
    p.playbackRate = speed;
  }, {
    seekBackwardIncrement: videoSettings.doubleTapSeek,
    seekForwardIncrement: videoSettings.doubleTapSeek,
    videoChangeFrameRateStrategy:
      videoSettings.frameRateMode === 'original' ? 'off' : 'onlyIfSeamless',
  });

  // Native player properties are mutable; keep them in sync with live settings.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- mutating the native player is intentional.
    player.staysActiveInBackground = playbackSettings.backgroundVideoAudio;
    player.showNowPlayingNotification =
      lockScreenActive && notificationSettings.playbackNotification;
    player.audioMixingMode = videoAudioMixingMode;
  }, [
    player,
    playbackSettings.backgroundVideoAudio,
    playbackSettings.notificationControls,
    playbackSettings.audioFocus,
    playbackSettings.duckOnInterruption,
    notificationSettings.playbackNotification,
    notificationSettings.lockScreenControls,
    lockScreenActive,
    videoAudioMixingMode,
  ]);

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
  const autoFullscreenDone = useRef(false);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInPip, setIsInPip] = useState(false);
  const pipNativeSupported = useMemo(() => isPictureInPictureSupported(), []);
  const pipSupported =
    pipNativeSupported &&
    videoSettings.pipEnabled &&
    isCapabilitySupported('video.pictureInPicture');
  const controlsTimeoutMs = Math.min(15000, Math.max(1000, videoSettings.autoHideControls));

  // Per-video system chrome settings restore their previous state on exit.
  useEffect(() => {
    if (Platform.OS === 'web' || !isCapabilitySupported('system.statusBar')) return;
    StatusBar.setHidden(!videoSettings.showStatusBar, 'fade');
    return () => StatusBar.setHidden(false, 'fade');
  }, [videoSettings.showStatusBar]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !isCapabilitySupported('system.navigationBar')) return;
    NavigationBar.setHidden(!videoSettings.showNavigationBar);
    return () => NavigationBar.setHidden(false);
  }, [videoSettings.showNavigationBar]);

  useEffect(() => {
    if (Platform.OS === 'web' || !videoSettings.rotationLock) return;
    let cancelled = false;
    let previousLock: ScreenOrientation.OrientationLock | null = null;
    void (async () => {
      try {
        previousLock = await ScreenOrientation.getOrientationLockAsync();
        const orientation = await ScreenOrientation.getOrientationAsync();
        if (!cancelled) await ScreenOrientation.lockAsync(lockForOrientation(orientation));
      } catch (cause) {
        console.warn('Could not lock video orientation', cause);
      }
    })();
    return () => {
      cancelled = true;
      if (previousLock !== null) void ScreenOrientation.lockAsync(previousLock);
    };
  }, [videoSettings.rotationLock]);

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
      if (playbackSettings.playbackHistory) void recordPlayback(trackId);
    });
  }, [
    videoUri,
    player,
    trackId,
    track?.durationMs,
    initialPosition,
    recordPlayback,
    playbackSettings.playbackHistory,
  ]);

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
    hideTimer.current = setTimeout(() => setControlsVisible(false), controlsTimeoutMs);
  }, [isPlaying, controlsTimeoutMs]);

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

  // Settings can request fullscreen on playback once per video.
  useEffect(() => {
    if (!videoSettings.fullscreenOnPlay || !isPlaying || isFullscreen || autoFullscreenDone.current) {
      return;
    }
    autoFullscreenDone.current = true;
    void viewRef.current?.enterFullscreen().catch((cause: unknown) => {
      console.warn('Auto-fullscreen failed', cause);
    });
  }, [isPlaying, isFullscreen, videoSettings.fullscreenOnPlay]);

  // expo-video can select embedded/subtitle tracks; styling is engine-gated.
  useEffect(() => {
    const { enabled, autoLoad, preferredLanguage } = videoSettings.subtitles;
    if (!enabled || !autoLoad || status !== 'readyToPlay') {
      if (player.subtitleTrack) {
        // eslint-disable-next-line react-hooks/immutability -- mutating the native player is intentional.
        player.subtitleTrack = null;
      }
      return;
    }
    const tracks = player.availableSubtitleTracks ?? [];
    if (tracks.length === 0) return;
    const language = preferredLanguage.trim().toLowerCase();
    const match =
      (language
        ? tracks.find((track) => track.language?.toLowerCase().startsWith(language))
        : undefined) ??
      tracks.find((track) => track.isDefault) ??
      tracks[0];
    if (match && player.subtitleTrack !== match) {
      player.subtitleTrack = match;
    }
  }, [
    player,
    status,
    videoSettings.subtitles,
    videoSettings.subtitles.enabled,
    videoSettings.subtitles.autoLoad,
    videoSettings.subtitles.preferredLanguage,
  ]);

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

  const glassStyle = {
    backgroundColor: withAlpha(theme.text, 0.12),
    borderColor: theme.glassBorder,
    borderWidth: 1,
  };

  return (
    <ThemeOverrideProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.stage, { backgroundColor: theme.background }]}>
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
          contentFit={resolveContentFit(videoSettings.zoomMode, videoSettings.aspectRatio)}
          nativeControls={false}
          allowsPictureInPicture={pipSupported}
          fullscreenOptions={{
            enable: true,
            orientation:
              videoSettings.orientation === 'auto' ? 'default' : videoSettings.orientation,
          }}
          onFullscreenEnter={() => setIsFullscreen(true)}
          onFullscreenExit={() => setIsFullscreen(false)}
          onPictureInPictureStart={() => setIsInPip(true)}
          onPictureInPictureStop={() => setIsInPip(false)}
          pointerEvents="none"
        />

        {statusMessage ? (
          <View
            style={[styles.statusBadge, { backgroundColor: withAlpha(theme.background, 0.78) }]}
            pointerEvents="none">
            <ThemedText type="bodySmall" style={{ color: theme.text }}>
              {statusMessage}
            </ThemedText>
          </View>
        ) : null}

        {!isPlaying && !statusMessage ? (
          <View
            style={[styles.centerBadge, { backgroundColor: withAlpha(theme.background, 0.68) }]}
            pointerEvents="none">
            <ThemedIcon icon={Play} size={34} color="text" />
          </View>
        ) : null}

        {controlsShown ? (
          <View style={styles.overlay} pointerEvents="box-none">
            <View
              style={[styles.topBar, { backgroundColor: withAlpha(theme.background, 0.72) }]}>
              <IconButton
                icon={NavArrowLeft}
                accessibilityLabel="Back to videos"
                style={[styles.glassButton, glassStyle]}
                onPress={() => router.back()}
              />
              <View style={styles.titleCopy}>
                <ThemedText type="label" numberOfLines={1} style={{ color: theme.text }}>
                  {track?.title || 'Video'}
                </ThemedText>
                <ThemedText type="bodySmall" numberOfLines={1} style={{ color: theme.textSecondary }}>
                  {track?.artist || ''}
                </ThemedText>
              </View>
              {pipSupported ? (
                <IconButton
                  icon={MultiWindow}
                  accessibilityLabel={isInPip ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}
                  active={isInPip}
                  style={[styles.glassButton, glassStyle]}
                  onPress={() => void togglePictureInPicture()}
                />
              ) : null}
            </View>

            <View
              style={[styles.bottomBar, { backgroundColor: withAlpha(theme.background, 0.8) }]}>
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
                  icon={Undo}
                  accessibilityLabel={`Back ${videoSettings.doubleTapSeek} seconds`}
                  size={42}
                  iconSize={20}
                  style={[styles.glassButton, glassStyle]}
                  onPress={() => seekBy(-videoSettings.doubleTapSeek)}
                />
                <IconButton
                  icon={Redo}
                  accessibilityLabel={`Forward ${videoSettings.doubleTapSeek} seconds`}
                  size={42}
                  iconSize={20}
                  style={[styles.glassButton, glassStyle]}
                  onPress={() => seekBy(videoSettings.doubleTapSeek)}
                />
                <IconButton
                  icon={isMuted ? SoundOff : SoundHigh}
                  accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
                  size={42}
                  iconSize={20}
                  style={[styles.glassButton, glassStyle]}
                  onPress={toggleMute}
                />
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`Playback speed ${speed}×`}
                  onPress={cycleSpeed}
                  style={[styles.speedButton, glassStyle]}>
                  <ThemedText type="label" style={{ color: theme.text }}>
                    {speed}×
                  </ThemedText>
                </PressableScale>
                <IconButton
                  icon={isFullscreen ? Check : Maximize}
                  accessibilityLabel={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  size={42}
                  iconSize={20}
                  style={[styles.glassButton, glassStyle]}
                  onPress={() => void toggleFullscreen()}
                />
              </View>
            </View>
          </View>
          ) : null}
        </View>
      </View>
    </ThemeOverrideProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stage: {
    flex: 1,
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
  },
  titleCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  bottomBar: {
    gap: Spacing.two,
    padding: Spacing.two,
    paddingBottom: Spacing.three,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.half,
  },
  glassButton: {},
  speedButton: {
    minWidth: 46,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    borderCurve: 'continuous',
  },
  statusBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 16,
    borderCurve: 'continuous',
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
  },
});
