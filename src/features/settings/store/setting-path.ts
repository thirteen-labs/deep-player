/**
 * Dotted-path helpers for nested settings, e.g. `video.subtitles.autoLoad`.
 * Pure functions returning new objects (immutable updates).
 */

export function getSettingById(obj: unknown, id: string): unknown {
  const parts = id.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

export function hasSettingById(obj: unknown, id: string): boolean {
  const parts = id.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return false;
    }
  }
  return true;
}

/** Immutably set a dotted path; returns a new root object. */
export function setSettingById<T>(obj: T, id: string, value: unknown): T {
  const parts = id.split('.');
  return setPath(obj, parts, value) as T;
}

function setPath(node: unknown, parts: string[], value: unknown): unknown {
  if (parts.length === 0) return value;
  const [head, ...rest] = parts;
  const base = node && typeof node === 'object' ? { ...(node as Record<string, unknown>) } : {};
  const child = (node as Record<string, unknown> | null | undefined)?.[head];
  base[head] = setPath(child, rest, value);
  return base;
}

/** The leading section of a dotted id, e.g. `video` from `video.subtitles.autoLoad`. */
export function sectionOf(id: string): string {
  return id.split('.')[0];
}

/** The key remainder after the section, e.g. `subtitles.autoLoad`. */
export function keyOf(id: string): string {
  const i = id.indexOf('.');
  return i === -1 ? '' : id.slice(i + 1);
}
