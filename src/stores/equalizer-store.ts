import { create } from 'zustand';

/** Five-band equalizer centre frequencies, in hertz. */
export const EQUALIZER_BANDS = [
  { hz: 60, label: '60' },
  { hz: 230, label: '230' },
  { hz: 910, label: '910' },
  { hz: 4000, label: '4k' },
  { hz: 14000, label: '14k' },
] as const;

export const EQUALIZER_MIN_DB = -12;
export const EQUALIZER_MAX_DB = 12;
export const EQUALIZER_STEP_DB = 1;

export type EqualizerPreset = {
  id: string;
  label: string;
  bands: number[];
  preamp: number;
};

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { id: 'flat', label: 'Flat', bands: [0, 0, 0, 0, 0], preamp: 0 },
  { id: 'bass', label: 'Bass boost', bands: [7, 5, 1, 0, 0], preamp: -1 },
  { id: 'treble', label: 'Treble boost', bands: [0, 0, 1, 5, 7], preamp: -1 },
  { id: 'vocal', label: 'Vocal', bands: [-2, 0, 4, 5, 1], preamp: 0 },
  { id: 'loudness', label: 'Loudness', bands: [5, 3, -1, 3, 5], preamp: -2 },
];

export const FLAT_BANDS = [0, 0, 0, 0, 0];

type EqualizerSettings = {
  enabled: boolean;
  presetId: string;
  bands: number[];
  preamp: number;
};

type EqualizerStore = EqualizerSettings & {
  hydrated: boolean;
  setEnabled: (enabled: boolean) => void;
  setBand: (index: number, db: number) => void;
  setPreamp: (db: number) => void;
  applyPreset: (presetId: string) => void;
  reset: () => void;
  hydrate: (settings: EqualizerSettings | null) => void;
};

function clampDb(value: number) {
  return Math.min(EQUALIZER_MAX_DB, Math.max(EQUALIZER_MIN_DB, value));
}

export const useEqualizerStore = create<EqualizerStore>((set) => ({
  enabled: false,
  presetId: 'flat',
  bands: [...FLAT_BANDS],
  preamp: 0,
  hydrated: false,
  setEnabled: (enabled) => set({ enabled }),
  setBand: (index, db) =>
    set((state) => ({
      bands: state.bands.map((value, i) => (i === index ? clampDb(db) : value)),
      presetId: 'custom',
    })),
  setPreamp: (db) => set({ preamp: clampDb(db) }),
  applyPreset: (presetId) => {
    const preset = EQUALIZER_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    set({ presetId: preset.id, bands: [...preset.bands], preamp: preset.preamp });
  },
  reset: () => set({ presetId: 'flat', bands: [...FLAT_BANDS], preamp: 0 }),
  hydrate: (settings) =>
    set({
      enabled: settings?.enabled ?? false,
      presetId: settings?.presetId ?? 'flat',
      bands:
        settings?.bands.length === EQUALIZER_BANDS.length
          ? settings.bands.map(clampDb)
          : [...FLAT_BANDS],
      preamp: clampDb(settings?.preamp ?? 0),
      hydrated: true,
    }),
}));
