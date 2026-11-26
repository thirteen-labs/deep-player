import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';

import type { Track } from '@/lib/db/schema';

const EXTENSION_BY_MIME: Record<string, string> = {
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/mp4': '.m4a',
  'audio/aac': '.aac',
  'audio/flac': '.flac',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
};

function extensionFor(track: Track): string {
  const fromUri = track.uri.match(/\.[a-z0-9]{1,5}(?=$|[?#])/i)?.[0];
  if (fromUri) return fromUri;
  return (track.mimeType && EXTENSION_BY_MIME[track.mimeType]) || '';
}

function safeFileName(track: Track): string {
  const base = (track.title || track.id).replace(/[^a-zA-Z0-9-_ ]/g, '_').slice(0, 60);
  return `share-${base || 'track'}${extensionFor(track)}`;
}

/**
 * Picks a URI the system share sheet can read. Prefers an existing local
 * copy; otherwise copies the media-library/content URI into the cache.
 */
async function resolveShareUri(track: Track): Promise<string | null> {
  if (track.localUri) return track.localUri;
  if (track.uri.startsWith('file://')) return track.uri;

  try {
    const source = new File(track.uri);
    const target = new File(Paths.cache, safeFileName(track));
    if (target.exists) target.delete();
    await source.copy(target);
    return Platform.OS === 'android' ? (target.contentUri ?? target.uri) : target.uri;
  } catch (error) {
    console.warn('Unable to prepare track for sharing', error);
    return null;
  }
}

function trackMessage(track: Track): string {
  const lines = [track.title || 'Track'];
  if (track.artist) lines.push(track.artist);
  if (track.album) lines.push(track.album);
  lines.push('Shared from Deep Player');
  return lines.join('\n');
}

/**
 * Opens the system share sheet for a track. Shares the audio file when a
 * readable copy is available and falls back to track details as text.
 */
export async function shareTrack(track: Track): Promise<void> {
  const title = track.title || 'Track';

  const canShareFiles = await Sharing.isAvailableAsync().catch(() => false);
  if (canShareFiles) {
    const uri = await resolveShareUri(track);
    if (uri) {
      try {
        await Sharing.shareAsync(uri, {
          dialogTitle: `Share ${title}`,
          mimeType: track.mimeType ?? undefined,
          UTI: 'public.audio',
        });
        return;
      } catch (error) {
        console.warn('File share failed, falling back to text', error);
      }
    }
  }

  await Share.share({ title, message: trackMessage(track) });
}
