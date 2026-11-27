/**
 * Deterministic artwork selection for collection cards and thumbnails.
 *
 * The app does not extract frames during render. It prefers metadata artwork,
 * then a representative library item whose saved position is away from the
 * opening/closing edges, then a small collage, then a theme-aware placeholder
 * rendered by the presentation layer.
 */
import type { MediaItem, MediaListContext, MediaSection } from '../types';
import { durationSeconds } from '../types';

export interface ArtworkSelection {
  /** Primary image for a single-artwork card. */
  primaryUri?: string;
  /** Up to four images for a collage card. */
  collageUris: string[];
}

function uniqueUris(items: MediaItem[], limit: number): string[] {
  const seen = new Set<string>();
  const uris: string[] = [];
  for (const item of items) {
    const uri = item.artworkUri;
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    uris.push(uri);
    if (uris.length >= limit) break;
  }
  return uris;
}

/**
 * Score items without decoding frames. Saved playback positions at ~25% of a
 * video are more likely to be representative than the first frame; artwork
 * availability is the strongest signal.
 */
export function selectRepresentativeItem(
  items: MediaItem[],
  context: MediaListContext = {},
): MediaItem | undefined {
  if (items.length === 0) return undefined;

  const scored = items
    .map((item) => {
      const duration = durationSeconds(item);
      const position = context.playbackPositions?.[item.id] ?? 0;
      const positionScore = duration > 0 && position > 0 ? 1 - Math.abs(position / duration - 0.25) : 0;
      return {
        item,
        score: (item.artworkUri ? 10 : 0) + Math.max(0, positionScore) + (duration > 60 ? 1 : 0),
      };
    })
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));

  return scored[0]?.item;
}

export function selectArtwork(
  items: MediaItem[],
  context: MediaListContext = {},
  overrideUri?: string | null,
  limit = 4,
): ArtworkSelection {
  if (overrideUri) return { primaryUri: overrideUri, collageUris: [overrideUri] };

  const withArtwork = items.filter((item) => Boolean(item.artworkUri));
  const representative = selectRepresentativeItem(withArtwork, context);
  const primaryUri = representative?.artworkUri ?? undefined;
  const collageUris = uniqueUris(withArtwork, Math.max(1, Math.min(4, limit)));

  return { primaryUri, collageUris };
}

export function thumbnailFallbackLabel(section: MediaSection): string {
  if (section === 'video') return 'Video';
  if (section === 'smart') return 'Collection';
  return 'Music';
}
