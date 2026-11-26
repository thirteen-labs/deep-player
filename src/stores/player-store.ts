import { useEffect } from 'react';
import { create } from 'zustand';
import { preload, type AudioPlayer, type AudioStatus } from 'expo-audio';

import { useAppAudio } from '@/lib/audio/player';
import { useDbStore } from '@/lib/db/store';
import type { Track } from '@/lib/db/schema';

export type RepeatMode = 'off' | 'one' | 'all';
export type ShuffleMode = 'off' | 'on';

/** Playback rates offered by both player UIs (Android caps expo-audio at 2x). */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** Durations (minutes) offered by the sleep timer. */
export const SLEEP_TIMER_MINUTES = [5, 10, 15, 30, 45, 60] as const;

export type SleepTimer =
  | { kind: 'duration'; minutes: number }
  /** Pauses when the current track finishes instead of advancing. */
  | { kind: 'track' };

/** Behavioral preferences supplied by the settings module (never persisted twice). */
export interface PlaybackPreferences {
  autoPlayNext: boolean;
  rememberPosition: boolean;
  resumeBehavior: 'always' | 'ask' | 'never';
  autoStopAfterCurrent: boolean;
  sleepTimerDefault: number;
  playbackHistory: boolean;
  preloadNextMedia: boolean;
  notificationControls: boolean;
  /** Remove the lock-screen notification when playback stops. */
  removeNotificationOnStop: boolean;
  notificationOptions: {
    showArtwork: boolean;
    showControls: boolean;
    showProgress: boolean;
  };
}

export const DEFAULT_PLAYBACK_PREFERENCES: PlaybackPreferences = {
  autoPlayNext: true,
  rememberPosition: true,
  resumeBehavior: 'always',
  autoStopAfterCurrent: false,
  sleepTimerDefault: 0,
  playbackHistory: true,
  preloadNextMedia: true,
  notificationControls: true,
  removeNotificationOnStop: true,
  notificationOptions: { showArtwork: true, showControls: true, showProgress: true },
};

/** Registered by the settings runtime so store code stays UI-independent. */
type ResumePromptHandler = (track: Track, seconds: number) => Promise<boolean>;
let resumePromptHandler: ResumePromptHandler | null = null;

export function registerResumePrompt(handler: ResumePromptHandler | null): void {
  resumePromptHandler = handler;
}

let sleepTimeout: ReturnType<typeof setTimeout> | null = null;

function clearSleepTimeout() {
  if (sleepTimeout) {
    clearTimeout(sleepTimeout);
    sleepTimeout = null;
  }
}

let lastTrackId: string | null = null;

/** Only write progress to SQLite every few seconds (plus explicit stop/switch events). */
const PERSIST_INTERVAL_SECONDS = 5;
let lastPersisted: { trackId: string; seconds: number } | null = null;
/** Ignores early status ticks while a resume/seek is still being applied. */
let resumeGuard: { trackId: string; target: number } | null = null;

function persistProgress(trackId: string | null | undefined, seconds: number, force = false) {
  if (!trackId) return;
  const value = Math.max(0, seconds);
  if (
    !force &&
    lastPersisted?.trackId === trackId &&
    Math.abs(value - lastPersisted.seconds) < PERSIST_INTERVAL_SECONDS
  ) {
    return;
  }
  lastPersisted = { trackId, seconds: value };
  void useDbStore.getState().setPlaybackPosition(trackId, value);
}

function clearPersistedProgress(trackId: string | null | undefined) {
  if (!trackId) return;
  lastPersisted = { trackId, seconds: 0 };
  void useDbStore.getState().setPlaybackPosition(trackId, 0);
}

/** Fisher-Yates copy so callers keep their original array untouched. */
function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type PlayerStore = {
  /** The track currently assigned to the shared player. */
  track: Track | null;
  isPlaying: boolean;
  /** Current position in seconds. */
  currentTime: number;
  /** Duration in seconds. */
  duration: number;
  volume: number;
  isMuted: boolean;
  speed: number;
  repeatMode: RepeatMode;
  shuffleMode: ShuffleMode;
  /** Active sleep timer, or null when playback should run normally. */
  sleepTimer: SleepTimer | null;
  /** Live preferences mirrored from the settings store. */
  preferences: PlaybackPreferences;
  /** Track waiting for a "resume where you left off?" decision. */
  pendingResume: { track: Track; seconds: number } | null;
  /** Queue of tracks for auto-advance; empty until a queue is set. */
  queue: Track[];
  queueIndex: number;
  audioPlayer: AudioPlayer | null;
  /** Bumped when a `didJustFinish` auto-advance has been scheduled (guards double-fires). */
  finishSignal: number;
  setAudioPlayer: (player: AudioPlayer) => void;
  setSpeed: (rate: number) => void;
  cycleSpeed: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setLockScreenMetadata: (track: Track | null) => void;
  play: (track: Track) => void;
  playAt: (index: number) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
  seekBy: (seconds: number) => void;
  setQueue: (tracks: Track[], index?: number) => void;
  playNext: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  /** Starts, replaces or clears the sleep timer. */
  setSleepTimer: (timer: SleepTimer | null) => void;
  /** Called by the settings bridge whenever a playback preference changes. */
  setPlaybackPreferences: (preferences: Partial<PlaybackPreferences>) => void;
  /** Resolves a pending resume prompt. */
  confirmResume: (resume: boolean) => void;
  syncStatus: (status: AudioStatus) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
  /** Applies notification preferences to the shared expo-audio player. */
  const activateLockScreen = (track: Track | null) => {
    const { audioPlayer, preferences } = get();
    if (!track || !audioPlayer || !preferences.notificationControls) return;
    const { showArtwork, showControls, showProgress } = preferences.notificationOptions;
    audioPlayer.setActiveForLockScreen(
      true,
      {
        title: track.title || 'Track',
        artist: track.artist || 'Unknown artist',
        albumTitle: track.album || undefined,
        artworkUrl: showArtwork ? (track.artworkUri ?? undefined) : undefined,
      },
      {
        showNextTrack: showControls,
        showPreviousTrack: showControls,
        showSeekBackward: showControls,
        showSeekForward: showControls,
        isLiveStream: !showProgress,
      },
    );
  };

  const deactivateLockScreenOnStop = () => {
    if (get().preferences.removeNotificationOnStop) {
      get().audioPlayer?.setActiveForLockScreen(false);
    }
  };

  const preloadUpcoming = () => {
    const state = get();
    if (!state.preferences.preloadNextMedia) return;
    const upcoming =
      state.queue[state.queueIndex + 1] ??
      (state.repeatMode === 'all' ? state.queue[0] : undefined);
    if (!upcoming) return;
    // The web implementation returns void; Promise.resolve covers both platforms.
    void Promise.resolve(preload(upcoming.localUri ?? upcoming.uri)).catch(() => undefined);
  };

  const recordHistory = (trackId: string) => {
    if (get().preferences.playbackHistory) {
      void useDbStore.getState().recordPlayback(trackId);
    }
  };

  return {
  track: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  speed: 1,
  repeatMode: 'off',
  shuffleMode: 'off',
  sleepTimer: null,
  preferences: { ...DEFAULT_PLAYBACK_PREFERENCES, notificationOptions: { ...DEFAULT_PLAYBACK_PREFERENCES.notificationOptions } },
  pendingResume: null,
  queue: [],
  queueIndex: -1,
  audioPlayer: null,
  finishSignal: 0,

  setAudioPlayer: (audioPlayer) => set({ audioPlayer }),

  setSpeed: (rate) => {
    set({ speed: rate });
    const player = get().audioPlayer;
    if (player) player.playbackRate = rate;
  },

  cycleSpeed: () => {
    const { speed, setSpeed } = get();
    const index = PLAYBACK_SPEEDS.findIndex((value) => Math.abs(value - speed) < 0.01);
    const next = PLAYBACK_SPEEDS[(index + 1) % PLAYBACK_SPEEDS.length] ?? 1;
    setSpeed(next);
  },

  setVolume: (volume) => {
    const clamped = Math.min(1, Math.max(0, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
    const player = get().audioPlayer;
    if (player) {
      player.volume = clamped;
      player.muted = clamped === 0;
    }
  },

  toggleMute: () => {
    const { audioPlayer, isMuted, volume } = get();
    const next = !isMuted;
    set({ isMuted: next });
    if (audioPlayer) audioPlayer.muted = next;
    // Restoring from a zero-volume mute needs an audible level.
    if (!next && volume === 0) get().setVolume(0.5);
  },

  setLockScreenMetadata: (track) => {
    const { audioPlayer } = get();
    if (!track || !audioPlayer || !get().preferences.notificationControls) return;
    const { showArtwork } = get().preferences.notificationOptions;
    audioPlayer.updateLockScreenMetadata({
      title: track.title || 'Track',
      artist: track.artist || 'Unknown artist',
      albumTitle: track.album || undefined,
      artworkUrl: showArtwork ? (track.artworkUri ?? undefined) : undefined,
    });
  },

  syncStatus: (status) => {
    const state = get();
    const update: Partial<PlayerStore> = {};
    if (state.isPlaying !== status.playing) update.isPlaying = status.playing;
    if (state.speed !== status.playbackRate) update.speed = status.playbackRate;
    if (status.duration > 0 && state.duration !== status.duration) update.duration = status.duration;

    const trackId = state.track?.id ?? null;
    if (status.didJustFinish) resumeGuard = null;
    const waitingForResume =
      !status.didJustFinish &&
      trackId != null &&
      resumeGuard?.trackId === trackId &&
      status.currentTime < resumeGuard.target - 2;
    if (!waitingForResume && state.currentTime !== status.currentTime) {
      update.currentTime = status.currentTime;
    }
    if (Object.keys(update).length > 0) set(update);

    // Keep a resumable position without hammering SQLite on every status tick.
    if (!waitingForResume) {
      if (resumeGuard?.trackId === trackId) resumeGuard = null;
      if (status.didJustFinish && state.track) {
        clearPersistedProgress(state.track.id);
      } else if (status.playing && state.track && status.duration > 0) {
        persistProgress(state.track.id, status.currentTime);
      }
    }

    // Refresh the lock-screen metadata when the playing track changes.
    if (trackId && trackId !== lastTrackId) {
      lastTrackId = trackId;
      state.setLockScreenMetadata(state.track);
    }

    // Advance when a track finishes; "repeat one" replays it instead of skipping.
    if (status.didJustFinish && state.track && state.finishSignal === 0) {
      if (
        state.sleepTimer?.kind === 'track' ||
        state.preferences.autoStopAfterCurrent ||
        !state.preferences.autoPlayNext
      ) {
        // Sleep timer / auto-stop / "autoplay next" off: stop at track end.
        set({ finishSignal: 1, isPlaying: false });
        if (state.sleepTimer?.kind === 'track') set({ sleepTimer: null });
        state.audioPlayer?.pause();
        deactivateLockScreenOnStop();
      } else if (state.repeatMode === 'one') {
        void state.audioPlayer?.seekTo(0);
        state.audioPlayer?.play();
        set({ currentTime: 0, isPlaying: true, finishSignal: 1 });
      } else {
        set({ finishSignal: 1 });
        get().next();
      }
    } else if (!status.didJustFinish && state.finishSignal !== 0) {
      set({ finishSignal: 0 });
    }
  },

  play: (track) => {
    const { audioPlayer, preferences } = get();
    const durationSeconds = track.durationMs / 1000;
    const saved = preferences.rememberPosition
      ? (useDbStore.getState().playbackPositions[track.id] ?? 0)
      : 0;
    const resumable = saved > 5 && (durationSeconds <= 0 || saved < durationSeconds - 10);
    const canResume = preferences.resumeBehavior !== 'never' && resumable;
    const askResume = canResume && preferences.resumeBehavior === 'ask';
    const resumeAt = canResume && !askResume ? saved : 0;

    lastPersisted = { trackId: track.id, seconds: resumeAt };
    resumeGuard = resumeAt > 0 ? { trackId: track.id, target: resumeAt } : null;

    set({
      track,
      isPlaying: !askResume,
      currentTime: resumeAt,
      duration: durationSeconds,
      pendingResume: askResume ? { track, seconds: saved } : null,
    });
    activateLockScreen(track);
    preloadUpcoming();
    audioPlayer?.replace(track.localUri ?? track.uri);
    if (resumeAt > 0) void audioPlayer?.seekTo(resumeAt);

    if (askResume) {
      // Wait for the registered prompt before starting playback.
      audioPlayer?.pause();
      const prompt = resumePromptHandler ?? (async () => true);
      void prompt(track, saved)
        .then((resume) => get().confirmResume(resume))
        .catch(() => get().confirmResume(true));
      return;
    }

    audioPlayer?.play();
    recordHistory(track.id);
  },

  confirmResume: (resume) => {
    const pending = get().pendingResume;
    if (!pending) return;
    const target = resume ? pending.seconds : 0;
    lastPersisted = { trackId: pending.track.id, seconds: target };
    if (resume) get().seekTo(target);
    else {
      resumeGuard = null;
      set({ currentTime: 0 });
      void get().audioPlayer?.seekTo(0);
    }
    set({ pendingResume: null, isPlaying: true });
    get().audioPlayer?.play();
    recordHistory(pending.track.id);
  },

  playAt: (index) => {
    const { queue, play: playTrack } = get();
    const target = queue[index];
    if (!target) return;
    set({ queueIndex: index });
    playTrack(target);
  },

  pause: () => {
    const { audioPlayer, track, currentTime } = get();
    persistProgress(track?.id, currentTime, true);
    set({ isPlaying: false });
    audioPlayer?.pause();
    deactivateLockScreenOnStop();
  },

  togglePlay: () => {
    const { audioPlayer, isPlaying, track, currentTime } = get();
    if (isPlaying) {
      persistProgress(track?.id, currentTime, true);
      set({ isPlaying: false });
      audioPlayer?.pause();
      deactivateLockScreenOnStop();
    } else {
      set({ isPlaying: true });
      activateLockScreen(track);
      audioPlayer?.play();
    }
  },

  next: () => {
    const { audioPlayer, queue, queueIndex, repeatMode, track: current, currentTime, finishSignal } = get();
    // A finished track is cleared by syncStatus; manual skips keep their position.
    if (finishSignal === 0) persistProgress(current?.id, currentTime, true);
    lastPersisted = null;
    resumeGuard = null;
    const nextIndex = queueIndex + 1;
    let target: Track | null = null;
    let targetIndex = nextIndex;
    if (nextIndex < queue.length) {
      target = queue[nextIndex];
    } else if (repeatMode === 'all' && queue.length > 0) {
      target = queue[0];
      targetIndex = 0;
    }
    if (target) {
      set({
        track: target,
        queueIndex: targetIndex,
        isPlaying: true,
        currentTime: 0,
        duration: target.durationMs / 1000,
      });
      activateLockScreen(target);
      preloadUpcoming();
      audioPlayer?.replace(target.localUri ?? target.uri);
      audioPlayer?.play();
      recordHistory(target.id);
    } else if (repeatMode === 'one') {
      audioPlayer?.seekTo(0);
      audioPlayer?.play();
      set({ isPlaying: true, currentTime: 0 });
    } else {
      set({ isPlaying: false });
      audioPlayer?.pause();
    }
  },

  previous: () => {
    const { audioPlayer, queue, queueIndex, currentTime, track: current } = get();
    if (currentTime > 3) {
      persistProgress(current?.id, 0, true);
      audioPlayer?.seekTo(0);
      set({ currentTime: 0 });
      return;
    }
    persistProgress(current?.id, currentTime, true);
    lastPersisted = null;
    resumeGuard = null;
    if (queueIndex > 0) {
      const target = queue[queueIndex - 1];
      set({
        track: target,
        queueIndex: queueIndex - 1,
        isPlaying: true,
        currentTime: 0,
        duration: target.durationMs / 1000,
      });
      activateLockScreen(target);
      preloadUpcoming();
      audioPlayer?.replace(target.localUri ?? target.uri);
      audioPlayer?.play();
      recordHistory(target.id);
    } else {
      audioPlayer?.seekTo(0);
      set({ currentTime: 0 });
    }
  },

  seekTo: (seconds) => {
    const { audioPlayer, track } = get();
    const target = Math.max(0, seconds);
    resumeGuard = track ? { trackId: track.id, target } : null;
    set({ currentTime: target });
    audioPlayer?.seekTo(target);
  },

  seekBy: (seconds) => get().seekTo(get().currentTime + seconds),

  setQueue: (tracks, index = 0) => {
    const { shuffleMode } = get();
    if (shuffleMode !== 'on' || tracks.length < 2) {
      set({ queue: tracks, queueIndex: index });
      preloadUpcoming();
      return;
    }
    // Keep the requested track first, shuffle everything after it.
    const selected = tracks[index] ?? tracks[0];
    const rest = shuffled(tracks.filter((_, i) => i !== index));
    set({ queue: [selected, ...rest], queueIndex: 0 });
    preloadUpcoming();
  },

  playNext: (track) => {
    const { queue, queueIndex, track: current } = get();
    if (!current) {
      set({ queue: [track], queueIndex: 0 });
      get().play(track);
      return;
    }
    const insertAt = Math.max(0, queueIndex + 1);
    set({ queue: [...queue.slice(0, insertAt), track, ...queue.slice(insertAt)] });
  },

  addToQueue: (track) => {
    const { queue, track: current } = get();
    if (!current) {
      set({ queue: [track], queueIndex: 0 });
      get().play(track);
      return;
    }
    set({ queue: [...queue, track] });
  },

  removeFromQueue: (index) => {
    const { audioPlayer, queue, queueIndex, isPlaying } = get();
    if (index < 0 || index >= queue.length) return;
    const wasCurrent = index === queueIndex;
    const nextTrack = queue[index + 1];
    set((s) => ({
      queue: s.queue.filter((_, i) => i !== index),
      queueIndex: s.queueIndex > index ? s.queueIndex - 1 : s.queueIndex,
    }));
    if (wasCurrent) {
      resumeGuard = null;
      if (nextTrack) {
        set({
          track: nextTrack,
          queueIndex: index,
          isPlaying,
          currentTime: 0,
          duration: nextTrack.durationMs / 1000,
        });
        audioPlayer?.replace(nextTrack.localUri ?? nextTrack.uri);
        if (isPlaying) audioPlayer?.play();
      } else {
        set({ track: null, queueIndex: -1, isPlaying: false, currentTime: 0, duration: 0 });
        audioPlayer?.pause();
      }
    }
  },

  moveQueueItem: (fromIndex, toIndex) => {
    const { queue, queueIndex } = get();
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= queue.length ||
      toIndex >= queue.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const nextQueue = [...queue];
    const [item] = nextQueue.splice(fromIndex, 1);
    nextQueue.splice(toIndex, 0, item);

    let nextIndex = queueIndex;
    if (queueIndex === fromIndex) nextIndex = toIndex;
    else if (fromIndex < queueIndex && toIndex >= queueIndex) nextIndex = queueIndex - 1;
    else if (fromIndex > queueIndex && toIndex <= queueIndex) nextIndex = queueIndex + 1;

    set({ queue: nextQueue, queueIndex: nextIndex });
  },

  clearQueue: () => {
    const { audioPlayer, track, currentTime } = get();
    persistProgress(track?.id, currentTime, true);
    resumeGuard = null;
    audioPlayer?.pause();
    set({ queue: [], queueIndex: -1, track: null, isPlaying: false, currentTime: 0, duration: 0 });
  },

  toggleRepeat: () =>
    set((state) => ({
      repeatMode: state.repeatMode === 'off' ? 'one' : state.repeatMode === 'one' ? 'all' : 'off',
    })),

  setSleepTimer: (timer) => {
    clearSleepTimeout();
    if (timer?.kind === 'duration') {
      sleepTimeout = setTimeout(
        () => {
          sleepTimeout = null;
          set({ sleepTimer: null });
          get().pause();
        },
        Math.max(0, timer.minutes) * 60_000,
      );
    }
    set({ sleepTimer: timer });
  },

  toggleShuffle: () => {
    const { shuffleMode, queue, queueIndex, track } = get();
    const next: ShuffleMode = shuffleMode === 'off' ? 'on' : 'off';
    if (next === 'off') {
      set({ shuffleMode: next });
      return;
    }
    const playing = track ?? queue[queueIndex] ?? null;
    const remaining = shuffled(
      queue.filter((item, i) => i !== queueIndex && (!playing || item.id !== playing.id)),
    );
    const reordered = playing ? [playing, ...remaining] : remaining;
    set({ shuffleMode: next, queue: reordered, queueIndex: playing ? 0 : -1 });
    preloadUpcoming();
  },

  setPlaybackPreferences: (preferences) => {
    const previous = get().preferences;
    const next: PlaybackPreferences = {
      ...previous,
      ...preferences,
      notificationOptions: {
        ...previous.notificationOptions,
        ...preferences.notificationOptions,
      },
    };
    set({ preferences: next });
    if (!previous.preloadNextMedia && next.preloadNextMedia) preloadUpcoming();
    if (!next.notificationControls) {
      get().audioPlayer?.setActiveForLockScreen(false);
    } else if (get().track) {
      activateLockScreen(get().track);
    }
  },
  };
});

/** The global player facade: zustand state + the shared `expo-audio` engine. */
export function usePlayer() {
  const { player, status } = useAppAudio();
  const setAudioPlayer = usePlayerStore((s) => s.setAudioPlayer);
  const syncStatus = usePlayerStore((s) => s.syncStatus);

  useEffect(() => {
    setAudioPlayer(player);
  }, [player, setAudioPlayer]);

  useEffect(() => {
    syncStatus(status);
  }, [status, syncStatus]);

  return usePlayerStore();
}
