import type { SQLiteDatabase } from 'expo-sqlite';

import type { Folder, Track } from '@/lib/db/schema';

/** A generated folder together with the video ids it should contain. */
export type SeriesGroup = {
  folder: Folder;
  trackIds: string[];
};

type ParsedTitle = {
  id: string;
  name: string;
  season: number | null;
  episode: number | null;
};

// Quality/source tags are not part of a series name.
const JUNK_PATTERN =
  /\b(1080p|720p|2160p|4k|uhd|hdr|hdr10|10bit|x264|x265|h264|h265|hevc|aac|ac3|eac3|ddp5|dts|bluray|bdrip|brrip|webrip|webdl|web|remux|proper|repack|internal|extended|unrated|imax|dual|audio|full)\b/gi;

function normalizeTitle(title: string) {
  return title
    .replace(/\.[a-z0-9]{2,4}$/i, '')
    .toLowerCase()
    .replace(/[_.\-–—]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function removeMatches(source: string, matches: string[]) {
  let result = source;
  for (const match of matches) {
    if (match) result = result.replace(match, ' ');
  }
  return result
    .replace(JUNK_PATTERN, ' ')
    .replace(/\b(?:season|sn|s|e|ep|episode)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts a stable series/season identity from a file name.
 * Handles `Dead Case SN1 EP2`, `Dead.Case.S01E02`, `Dead Case 1x02`,
 * `Dead Case Season 1 Episode 2` and plain numbered episodes.
 */
function parseVideoTitle(track: Track): ParsedTitle | null {
  const normalized = normalizeTitle(track.title);
  if (!normalized) return null;

  const seasonEpisode =
    normalized.match(/\b(?:s|sn|season)\s*0*(\d{1,2})\s*(?:e|ep|episode)\s*0*(\d{1,3})\b/) ??
    normalized.match(/\b0*(\d{1,2})\s*x\s*0*(\d{1,3})\b/);
  const onlyEpisode = normalized.match(/\b(?:e|ep|episode)\s*0*(\d{1,3})\b/);
  const onlySeason =
    normalized.match(/\b(?:season|sn)\s*0*(\d{1,2})\b/) ?? normalized.match(/\bs\s*0*(\d{1,2})\b/);

  const season = seasonEpisode ? Number(seasonEpisode[1]) : onlySeason ? Number(onlySeason[1]) : null;
  const episode = seasonEpisode ? Number(seasonEpisode[2]) : onlyEpisode ? Number(onlyEpisode[1]) : null;

  const markers = [seasonEpisode?.[0], onlyEpisode?.[0], onlySeason?.[0]].filter(
    (value): value is string => Boolean(value),
  );
  let seriesName = removeMatches(normalized, markers);

  // With no explicit markers, treat a trailing episode number as part of the episode.
  if (season === null && episode === null) {
    const withoutNumber = seriesName.replace(/\b\d{1,3}\b\s*$/, '').trim();
    if (withoutNumber.length >= 3) seriesName = withoutNumber;
  }

  if (seriesName.length < 3) return null;

  const slug = slugify(seriesName);
  if (!slug) return null;

  const displayName = titleCase(seriesName);
  return {
    id: `series:${slug}:s${season ?? 0}`,
    name: season ? `${displayName} Season ${season}` : displayName,
    season,
    episode,
  };
}

/** Builds the folder groups that should exist for the current video library. */
export function buildSeriesGroups(tracks: Track[]): SeriesGroup[] {
  const videos = tracks.filter((track) => track.mediaType === 'video');
  const groups = new Map<string, { folder: Folder; entries: { trackId: string; episode: number | null; title: string }[] }>();

  for (const track of videos) {
    const parsed = parseVideoTitle(track);
    if (!parsed) continue;

    let group = groups.get(parsed.id);
    if (!group) {
      group = {
        folder: {
          id: parsed.id,
          name: parsed.name,
          kind: 'folder',
          smartlistType: 'series',
          mediaType: 'video',
          createdAt: Date.now(),
        },
        entries: [],
      };
      groups.set(parsed.id, group);
    }
    group.entries.push({ trackId: track.id, episode: parsed.episode, title: track.title });
  }

  return [...groups.values()]
    .filter((group) => group.entries.length >= 2)
    .map((group) => ({
      folder: group.folder,
      trackIds: group.entries
        .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0) || a.title.localeCompare(b.title))
        .map((entry) => entry.trackId),
    }))
    .sort((a, b) => a.folder.name.localeCompare(b.folder.name));
}

/**
 * Reconciles generated series folders with the video library. Safe to call on
 * every load: it only writes when the desired folders or memberships change.
 */
export async function syncSeriesFolders(db: SQLiteDatabase, tracks: Track[]): Promise<void> {
  const desired = buildSeriesGroups(tracks);
  const desiredIds = new Set(desired.map((group) => group.folder.id));
  const existing = await db.getAllAsync<{ id: string }>(
    "SELECT id FROM folders WHERE smartlistType = 'series'",
  );

  for (const folder of existing) {
    if (desiredIds.has(folder.id)) continue;
    await db.runAsync('DELETE FROM folderTracks WHERE folderId = ?', folder.id);
    await db.runAsync('DELETE FROM folders WHERE id = ?', folder.id);
  }

  for (const group of desired) {
    const { folder, trackIds } = group;
    await db.runAsync(
      `INSERT INTO folders (id, name, kind, smartlistType, mediaType, createdAt)
       VALUES (?, ?, ?, 'series', 'video', ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, kind = excluded.kind, mediaType = excluded.mediaType`,
      folder.id,
      folder.name,
      folder.kind,
      folder.createdAt,
    );

    const current = await db.getAllAsync<{ trackId: string }>(
      'SELECT trackId FROM folderTracks WHERE folderId = ? ORDER BY position ASC',
      folder.id,
    );
    const currentIds = current.map((row) => row.trackId);
    const unchanged =
      currentIds.length === trackIds.length && currentIds.every((id, index) => id === trackIds[index]);
    if (unchanged) continue;

    await db.runAsync('DELETE FROM folderTracks WHERE folderId = ?', folder.id);
    for (let index = 0; index < trackIds.length; index += 1) {
      await db.runAsync(
        'INSERT INTO folderTracks (folderId, trackId, position) VALUES (?, ?, ?)',
        folder.id,
        trackIds[index],
        index,
      );
    }
  }
}
