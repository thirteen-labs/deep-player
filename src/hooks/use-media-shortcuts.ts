import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * mpv-inspired keyboard shortcuts for web/desktop. Native is a no-op because
 * touch devices use the on-screen transport controls instead.
 */
export type MediaShortcutActions = {
  togglePlay?: () => void;
  seekBy?: (seconds: number) => void;
  next?: () => void;
  previous?: () => void;
  adjustVolume?: (delta: number) => void;
  toggleMute?: () => void;
  cycleSpeed?: () => void;
  toggleFullscreen?: () => void;
  togglePictureInPicture?: () => void;
  toggleControls?: () => void;
  close?: () => void;
};

type KeyLikeEvent = {
  key?: string;
  repeat?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  target?: { tagName?: string; isContentEditable?: boolean } | null;
  preventDefault?: () => void;
};

type KeyEventTarget = {
  addEventListener?: (type: 'keydown', listener: (event: KeyLikeEvent) => void) => void;
  removeEventListener?: (type: 'keydown', listener: (event: KeyLikeEvent) => void) => void;
};

const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function useMediaShortcuts(actions: MediaShortcutActions) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onKeyDown = (event: KeyLikeEvent) => {
      const target = event.target;
      if (target?.tagName && IGNORED_TAGS.has(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      switch (event.key) {
        case ' ':
        case 'k':
          actions.togglePlay?.();
          break;
        case 'ArrowLeft':
        case 'j':
          actions.seekBy?.(-10);
          break;
        case 'ArrowRight':
        case 'l':
          actions.seekBy?.(10);
          break;
        case 'ArrowDown':
          actions.seekBy?.(-30);
          break;
        case 'ArrowUp':
          actions.seekBy?.(30);
          break;
        case 'n':
        case '>':
          actions.next?.();
          break;
        case 'b':
        case '<':
          actions.previous?.();
          break;
        case 'm':
          actions.toggleMute?.();
          break;
        case '9':
          actions.adjustVolume?.(-0.1);
          break;
        case '0':
          actions.adjustVolume?.(0.1);
          break;
        case 's':
          actions.cycleSpeed?.();
          break;
        case 'f':
          actions.toggleFullscreen?.();
          break;
        case 'i':
          actions.togglePictureInPicture?.();
          break;
        case 'h':
          actions.toggleControls?.();
          break;
        case 'Escape':
          actions.close?.();
          break;
        default:
          return;
      }
      event.preventDefault?.();
    };

    const scope = globalThis as unknown as KeyEventTarget;
    scope.addEventListener?.('keydown', onKeyDown);
    return () => scope.removeEventListener?.('keydown', onKeyDown);
  }, [actions]);
}
