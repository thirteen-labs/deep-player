/** Approximate 10-band EQ presets (dB gains, -12…+12). */
import { EQUALIZER_PRESETS } from '../types/settings.enums';

export const EQUALIZER_PRESET_GAINS: Record<string, number[]> = {
  flat: Array(10).fill(0),
  classical: [4, 3, 1, 0, 0, 1, 3, 4, 3, 2],
  dance: [5, 4, 2, 0, 0, 2, 4, 5, 4, 3],
  'hip-hop': [6, 5, 3, 1, -1, -1, 1, 3, 5, 6],
  jazz: [3, 2, 1, 2, -1, -1, 1, 2, 3, 2],
  pop: [2, 3, 4, 2, -1, -2, -1, 2, 3, 2],
  rock: [5, 4, 2, -1, -2, 1, 3, 4, 5, 4],
  custom: Array(10).fill(0),
};

export const EQUALIZER_PRESET_OPTIONS = EQUALIZER_PRESETS.map((preset) => ({
  value: preset,
  label: preset === 'hip-hop' ? 'Hip-hop' : preset.charAt(0).toUpperCase() + preset.slice(1),
}));
