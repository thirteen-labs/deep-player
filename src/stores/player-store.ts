import { useEffect } from 'react';
import { create } from 'zustand';
import type { AudioPlayer, AudioStatus } from 'expo-audio';

import { useAppAudio } from '@/lib/audio/player';
import { useDbStore } from '@/lib/db/store';
import type { Track } from '@/lib/db/schema';

export type RepeatMode = 'off' | 'one' | 'all';
export type ShuffleMode = 'off' | 'on';

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

export type PlayerStore = {
  /** The track currently assigned to the shared player. */
  track: Track | null;
  isPlaying: boolean;
  /** Current position in seconds. */
  currentTime: number;
  /** Duration in seconds. */
  duration: number;
  volume: number;
  speed: number;
  repeatMode: RepeatMode;
  shuffleMode: ShuffleMode;
  /** Queue of tracks for auto-advance; empty until a queue is set. */
  queue: Track[];
  queueIndex: number;
  audioPlayer: AudioPlayer | null;
  /** Bumped when a `didJustFinish` auto-advance has been scheduled (guards double-fires). */
  finishSignal: number;
  setAudioPlayer: (player: AudioPlayer) => void;
  setSpeed: (rate: number) => void;
  setVolume: (volume: number) => void;
  setLockScreenMetadata: (track: Track | null) => void;
  play: (track: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
  setQueue: (tracks: Track[], index?: number) => void;
  playNext: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  syncStatus: (status: AudioStatus) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  track: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  speed: 1,
  repeatMode: 'off',
  shuffleMode: 'off',
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

  setVolume: (volume) => {
    set({ volume });
    const player = get().audioPlayer;
    if (player) player.volume = volume;
  },

  setLockScreenMetadata: (track) => {
    const { audioPlayer } = get();
    if (!track || !audioPlayer) return;
    audioPlayer.updateLockScreenMetadata({
      title: track.title || 'Track',
      artist: track.artist || 'Unknown artist',
      albumTitle: track.album || undefined,
      artworkUrl: track.artworkUri ?? undefined,
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

    // Advance to the next track when the current one finishes.
    if (status.didJustFinish && state.track && state.finishSignal === 0) {
      set({ finishSignal: 1 });
      get().next();
    } else if (!status.didJustFinish && state.finishSignal !== 0) {
      set({ finishSignal: 0 });
    }
  },

  play: (track) => {
    const { audioPlayer } = get();
    const durationSeconds = track.durationMs / 1000;
    const saved = useDbStore.getState().playbackPositions[track.id] ?? 0;
    const canResume = saved > 5 && (durationSeconds <= 0 || saved < durationSeconds - 10);
    const resumeAt = canResume ? saved : 0;
    lastPersisted = { trackId: track.id, seconds: resumeAt };
    resumeGuard = resumeAt > 0 ? { trackId: track.id, target: resumeAt } : null;

    set({ track, isPlaying: true, currentTime: resumeAt, duration: durationSeconds });
    audioPlayer?.setActiveForLockScreen(true, {
      title: track.title || 'Track',
      artist: track.artist || 'Unknown artist',
      albumTitle: track.album || undefined,
      artworkUrl: track.artworkUri ?? undefined,
    });
    audioPlayer?.replace(track.localUri ?? track.uri);
    if (resumeAt > 0) {
      void audioPlayer?.seekTo(resumeAt);
    }
    audioPlayer?.play();
    void useDbStore.getState().recordPlayback(track.id);
  },

  pause: () => {
    const { audioPlayer, track, currentTime } = get();
    persistProgress(track?.id, currentTime, true);
    set({ isPlaying: false });
    audioPlayer?.pause();
  },

  togglePlay: () => {
    const { audioPlayer, isPlaying, track, currentTime } = get();
    if (isPlaying) {
      persistProgress(track?.id, currentTime, true);
      set({ isPlaying: false });
      audioPlayer?.pause();
    } else {
      set({ isPlaying: true });
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
      audioPlayer?.setActiveForLockScreen(true, {
        title: target.title || 'Track',
        artist: target.artist || 'Unknown artist',
        albumTitle: target.album || undefined,
        artworkUrl: target.artworkUri ?? undefined,
      });
      audioPlayer?.replace(target.localUri ?? target.uri);
      audioPlayer?.play();
      void useDbStore.getState().recordPlayback(target.id);
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
      audioPlayer?.setActiveForLockScreen(true, {
        title: target.title || 'Track',
        artist: target.artist || 'Unknown artist',
        albumTitle: target.album || undefined,
        artworkUrl: target.artworkUri ?? undefined,
      });
      audioPlayer?.replace(target.localUri ?? target.uri);
      audioPlayer?.play();
      void useDbStore.getState().recordPlayback(target.id);
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

  setQueue: (tracks, index = 0) => set({ queue: tracks, queueIndex: index }),

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

  toggleShuffle: () => set((state) => ({ shuffleMode: state.shuffleMode === 'off' ? 'on' : 'off' })),
}));

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
