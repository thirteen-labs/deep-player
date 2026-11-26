/**
 * Offline global search (spec §8): normalized text matching + lightweight fuzzy
 * matching. No network. Searches title, description, keywords, category, id.
 */
import { SETTINGS_REGISTRY } from './settings.registry';
import type { SettingSearchEntry } from './settings.registry';

const MAX_RESULTS = 100;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Lightweight fuzzy: subsequence match score 0..1. */
function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  if (target.includes(query)) return 1;
  let qi = 0;
  let consecutive = 0;
  let best = 0;
  let run = 0;
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) {
      qi++;
      run++;
      consecutive = Math.max(consecutive, run);
    } else {
      run = 0;
    }
  }
  if (qi < query.length) return 0; // not a subsequence
  const coverage = query.length / target.length;
  const consec = consecutive / query.length;
  best = 0.5 * coverage + 0.5 * consec;
  return best;
}

function scoreEntry(query: string, entry: SettingSearchEntry): number {
  const q = normalize(query);
  if (!q) return 0;
  const haystacks = [
    normalize(entry.title),
    normalize(entry.description),
    normalize(entry.id),
    normalize(entry.category),
    ...entry.keywords.map(normalize),
  ];
  let best = 0;
  for (const hay of haystacks) {
    // exact word boundary match scores highest
    if (hay === q) best = Math.max(best, 1);
    else if (hay.startsWith(q)) best = Math.max(best, 0.95);
    else if (hay.includes(q)) best = Math.max(best, 0.85);
    else best = Math.max(best, 0.5 * fuzzyScore(q, hay));
  }
  // boost title matches
  const titleScore = fuzzyScore(q, normalize(entry.title));
  best = Math.max(best, titleScore);
  return best;
}

export interface SearchResult extends SettingSearchEntry {
  score: number;
}

/** Search the registry; returns highest-scoring first. */
export function searchSettings(query: string, limit = MAX_RESULTS): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  return SETTINGS_REGISTRY.map((entry) => ({ ...entry, score: scoreEntry(q, entry) }))
    .filter((r) => r.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** All settings for a given route (used to render category screens). */
export function settingsForRoute(route: string): SettingSearchEntry[] {
  return SETTINGS_REGISTRY.filter((entry) => entry.route === route);
}

/** All distinct categories. */
export function listCategories(): string[] {
  return Array.from(new Set(SETTINGS_REGISTRY.map((entry) => entry.category)));
}
