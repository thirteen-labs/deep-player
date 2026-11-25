import type { SQLiteDatabase } from 'expo-sqlite';

import type { Folder, Track } from '@/lib/db/schema';

/** A generated folder together with the video ids it should contain. */
export type SeriesGroup = {
  folder: Folder;
  trackIds: string[];
};

const EXTENSION_RE = /\.[a-z0-9]{2,4}$/i;
const BRACKETED_RE = /[([][^\])]*[)\]]/g;
const YEAR_RE = /\b(?:19|20)\d{2}\b/g;
const TECH_RE = /\b(?:2160p|1080p|720p|480p|4k|uhd|hdr|hdr10|10bit|bluray|bdrip|brrip|webrip|webdl|web|remux|proper|repack|internal|extended|unrated|imax|dual|audio|x264|x265|h264|h265|hevc|aac|ac3|eac3|ddp5|dts)\b/gi;
const NUMBER_RE = /\b(?:s\d{1,2}\s*e\d{1,2}|sn\s*\d{1,2}|\d{1,2}\s*x\s*\d{1,3}|ep(?:isode)?\s*\d+|part\s*\d+|pt\.?\s*\d+|vol(?:ume)?\s*\d+|\d{1,4})\b/gi;
const SEPARATOR_RE = /\s(?:[-–—:|]|\bpart\b|\bep(?:isode)?\b|\bchapter\b)\s/i;
const LEADING_IGNORED = new Set(['the', 'a', 'an']);
const BROAD_PRIMARIES = new Set([
  'space',
  'world',
  'history',
  'story',
  'love',
  'life',
  'time',
  'night',
  'day',
  'real',
  'true',
  'ultimate',
]);
const GENERIC_TOKENS = new Set([
  'video',
  'videos',
  'movie',
  'movies',
  'film',
  'films',
  'clip',
  'clips',
  'episode',
  'ep',
  'part',
  'pt',
  'season',
  'series',
  'sample',
  'test',
  'full',
  'final',
  'best',
  'new',
  'hd',
  'hq',
]);

/** Removes file noise that should not decide which smart folder a video joins. */
function cleanTitle(title: string): string {
  return title
    .replace(EXTENSION_RE, '')
    .replace(BRACKETED_RE, ' ')
    .replace(YEAR_RE, ' ')
    .replace(TECH_RE, ' ')
    .replace(NUMBER_RE, ' ')
    .replace(/^\s*[-–—:|]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Leading tokens used to recognize a series: "X-Men 2", "X-Men - ...", etc. */
function titleTokens(title: string): string[] {
  const cleaned = cleanTitle(title);
  const base = cleaned.split(SEPARATOR_RE)[0] ?? cleaned;
  const tokens = base
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, ' ')
    .split(' ')
    .filter(Boolean);

  while (tokens.length > 0 && LEADING_IGNORED.has(tokens[0])) tokens.shift();
  return tokens.filter((token) => !GENERIC_TOKENS.has(token));
}

function sharedPrefix(groups: string[][]): string[] {
  if (groups.length === 0) return [];
  const prefix = [...groups[0]];
  for (const tokens of groups.slice(1)) {
    let index = 0;
    while (index < prefix.length && index < tokens.length && prefix[index] === tokens[index]) {
      index += 1;
    }
    prefix.length = index;
    if (prefix.length === 0) break;
  }
  return prefix;
}

function formatName(tokens: string[]): string {
  return tokens
    .map((token) =>
      token
        .split('-')
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
        .join('-'),
    )
    .join(' ');
}

/**
 * Builds a smart folder for every recurring video series. Titles such as
 * "X-Men.mp4", "X-Men 2.mp4" and "X-Men - The Last Stand.mp4" are grouped
 * under "X-Men". Music is never included.
 */
export function buildSeriesGroups(tracks: Track[]): SeriesGroup[] {
  const buckets = new Map<string, { tokens: string[][]; entries: { trackId: string; title: string }[] }>();

  for (const track of tracks) {
    if (track.mediaType !== 'video') continue;

    const tokens = titleTokens(track.title);
    if (tokens.length === 0 || GENERIC_TOKENS.has(tokens[0])) continue;

    const primary = tokens[0];
    let bucket = buckets.get(primary);
    if (!bucket) {
      bucket = { tokens: [], entries: [] };
      buckets.set(primary, bucket);
    }
    bucket.tokens.push(tokens);
    bucket.entries.push({ trackId: track.id, title: track.title });
  }

  return [...buckets.entries()]
    .map(([primary, bucket]) => ({ primary, ...bucket }))
    .filter(({ primary, tokens, entries }) => {
      const prefix = sharedPrefix(tokens);
      const exactPrimary = tokens.some((list) => list.length === 1);
      const distinctivePrimary = primary.length >= 5 && !BROAD_PRIMARIES.has(primary);
      const strong = prefix.length > 1 || primary.includes('-') || exactPrimary || distinctivePrimary;
      return entries.length > 1 && prefix.length > 0 && strong;
    })
    .map(({ tokens, entries }) => {
      const prefix = sharedPrefix(tokens);
      const name = formatName(prefix);
      const key = prefix.join(' ');

      return {
        folder: {
          id: `series:${key}`,
          name,
          kind: 'folder',
          smartlistType: 'series',
          mediaType: 'video',
          createdAt: Date.now(),
        } satisfies Folder,
        trackIds: entries
          .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }))
          .map((entry) => entry.trackId),
      };
    })
    .sort((a, b) => a.folder.name.localeCompare(b.folder.name));
}

/** Reconciles generated smart folders with the video library. Safe to call on
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
