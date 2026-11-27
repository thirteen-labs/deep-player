/** Rule-based smart collection model. Smart lists never duplicate media rows. */
import type { MediaSection, MediaType, SortConfig } from './media-list.types';

export type SmartRuleOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'before'
  | 'after'
  | 'is_empty';

export type SmartRuleValue = string | number | boolean | null | undefined;

export interface SmartRule {
  field: string;
  operator: SmartRuleOperator;
  value?: SmartRuleValue;
}

export interface SmartRuleGroup {
  operator: 'AND' | 'OR';
  rules: SmartRule[];
  groups?: SmartRuleGroup[];
}

export interface SmartList {
  id: string;
  name: string;
  description?: string;
  section: MediaSection;
  mediaTypes: MediaType[];
  conditions: SmartRuleGroup;
  sort?: SortConfig;
  artworkUri?: string;
  icon?: string;
  isSystem: boolean;
  isPinned: boolean;
  isHidden: boolean;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  createdAt: number;
  updatedAt: number;
}

export interface SmartRuleFieldOption {
  value: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

export const SMART_RULE_FIELDS: SmartRuleFieldOption[] = [
  { value: 'title', label: 'Title', type: 'text' },
  { value: 'artist', label: 'Artist', type: 'text' },
  { value: 'album', label: 'Album', type: 'text' },
  { value: 'genre', label: 'Genre', type: 'text' },
  { value: 'mediaType', label: 'Media type', type: 'text' },
  { value: 'duration', label: 'Duration (seconds)', type: 'number' },
  { value: 'size', label: 'File size (bytes)', type: 'number' },
  { value: 'favorite', label: 'Favorite', type: 'boolean' },
  { value: 'playCount', label: 'Play count', type: 'number' },
  { value: 'lastPlayedAt', label: 'Last played', type: 'date' },
  { value: 'addedAt', label: 'Date added', type: 'date' },
  { value: 'playbackPosition', label: 'Playback position (seconds)', type: 'number' },
  { value: 'inProgress', label: 'In progress', type: 'boolean' },
  { value: 'isCompleted', label: 'Completed', type: 'boolean' },
  { value: 'resolution', label: 'Resolution', type: 'text' },
  { value: 'folderId', label: 'Folder', type: 'text' },
];

export const SMART_RULE_OPERATORS: { value: SmartRuleOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'is_empty', label: 'Is empty' },
];

export function emptyRuleGroup(): SmartRuleGroup {
  return { operator: 'AND', rules: [] };
}

export function emptySmartList(): SmartList {
  const now = Date.now();
  return {
    id: `custom-${now.toString(36)}`,
    name: '',
    section: 'video',
    mediaTypes: ['music', 'video'],
    conditions: emptyRuleGroup(),
    isSystem: false,
    isPinned: false,
    isHidden: false,
    sortBy: 'title',
    sortDirection: 'asc',
    createdAt: now,
    updatedAt: now,
  };
}
