/**
 * Capability registry (spec §11). Conservative defaults; the native engine
 * reports real support at runtime via `reportCapabilities`. Capability changes
 * trigger UI refresh. Unsupported controls must be disabled/hidden with a
 * reason and must never show a successful state when the engine rejected it.
 */
import { create } from 'zustand';

import type { CapabilityInfo, CapabilityKey, PlayerCapabilities } from './capability.types';
import { SETTING_CAPABILITY_MAP } from './capability.types';

/** Conservative baseline used until the native engine reports real support. */
export const CONSERVATIVE_CAPABILITIES: PlayerCapabilities = {
  audio: {
    backgroundPlayback: true,
    gapless: false,
    crossfade: false,
    equalizer: false,
    replayGain: false,
    volumeNormalization: false,
    audioEffects: false,
  },
  video: {
    // expo-video selects decoders internally; there is no public API to honour
    // a decoder preference, so the corresponding settings stay disabled.
    hardwareDecoding: false,
    softwareDecoding: true,
    pictureInPicture: false,
    subtitles: true,
    externalSubtitles: true,
    subtitleStyling: false,
    playbackSpeed: true,
    rotation: true,
    gestureControls: false,
  },
  system: {
    foregroundService: true,
    mediaNotifications: true,
    lockScreenControls: true,
    backgroundAudio: true,
    navigationBar: false,
    statusBar: false,
    privateFolders: false,
    thumbnailGeneration: false,
  },
};

export type CapabilityPatch = {
  [K in keyof PlayerCapabilities]?: Partial<PlayerCapabilities[K]>;
};

interface CapabilityStore {
  capabilities: PlayerCapabilities;
  /** Replace capabilities reported by the native engine/platform. */
  reportCapabilities: (capabilities: PlayerCapabilities) => void;
  /** Merge a partial update within each capability section. */
  patchCapabilities: (patch: CapabilityPatch) => void;
  resetCapabilities: () => void;
}

export const useCapabilityStore = create<CapabilityStore>((set) => ({
  capabilities: CONSERVATIVE_CAPABILITIES,
  reportCapabilities: (capabilities) => set({ capabilities }),
  patchCapabilities: (patch) =>
    set((state) => ({
      capabilities: {
        audio: { ...state.capabilities.audio, ...patch.audio },
        video: { ...state.capabilities.video, ...patch.video },
        system: { ...state.capabilities.system, ...patch.system },
      },
    })),
  resetCapabilities: () => set({ capabilities: CONSERVATIVE_CAPABILITIES }),
}));

function getCapability(caps: PlayerCapabilities, key: CapabilityKey): boolean {
  const [section, name] = key.split('.') as [keyof PlayerCapabilities, string];
  const group = caps[section] as Record<string, boolean>;
  return Boolean(group?.[name]);
}

/** Is a given capability key currently supported? */
export function isCapabilitySupported(key: CapabilityKey, caps?: PlayerCapabilities): boolean {
  const capabilities = caps ?? useCapabilityStore.getState().capabilities;
  return getCapability(capabilities, key);
}

/** Capability info for a *setting* id; pure preferences are always supported. */
export function capabilityForSetting(settingId: string, caps?: PlayerCapabilities): CapabilityInfo {
  const key = SETTING_CAPABILITY_MAP[settingId];
  if (!key) return { supported: true };
  const supported = isCapabilitySupported(key, caps);
  return supported
    ? { supported: true }
    : {
        supported: false,
        reason: `${settingId} requires engine capability "${key}", which is not available on this device/build.`,
      };
}

/* ---- Native engine integration points ---- */
export function reportCapabilities(capabilities: PlayerCapabilities): void {
  useCapabilityStore.getState().reportCapabilities(capabilities);
}

export function patchCapabilities(patch: CapabilityPatch): void {
  useCapabilityStore.getState().patchCapabilities(patch);
}

export function resetCapabilities(): void {
  useCapabilityStore.getState().resetCapabilities();
}
