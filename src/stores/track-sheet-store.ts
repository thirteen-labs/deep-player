import { create } from 'zustand';

import type { Track } from '@/lib/db/schema';

/** Panels the track sheet can show. `menu` is the root list. */
export type TrackSheetView =
  | 'menu'
  | 'playlist'
  | 'edit'
  | 'speed'
  | 'sleep'
  | 'info'
  | 'equalizer';

/** Which mounted host owns the sheet (modal screens need their own copy). */
export type TrackSheetHostOwner = 'root' | 'player';

type TrackSheetStore = {
  track: Track | null;
  view: TrackSheetView;
  host: TrackSheetHostOwner;
  open: (track: Track, view?: TrackSheetView) => void;
  setView: (view: TrackSheetView) => void;
  setHost: (host: TrackSheetHostOwner) => void;
  close: () => void;
};

export const useTrackSheetStore = create<TrackSheetStore>((set) => ({
  track: null,
  view: 'menu',
  host: 'root',
  open: (track, view = 'menu') => set({ track, view }),
  setView: (view) => set({ view }),
  setHost: (host) => set({ host }),
  close: () => set({ track: null, view: 'menu' }),
}));

/** Opens the shared track options sheet from anywhere in the app. */
export function openTrackSheet(track: Track, view: TrackSheetView = 'menu') {
  useTrackSheetStore.getState().open(track, view);
}
