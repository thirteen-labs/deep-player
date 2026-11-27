import { Plus, Trash } from 'iconoir-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton, PressableScale } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { Radius, getTypographyStyles } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { useFontScale } from '@/stores/font-size-store';

import {
  emptySmartList,
  SMART_RULE_FIELDS,
  SMART_RULE_OPERATORS,
  type MediaType,
  type SmartList,
  type SmartRule,
  type SmartRuleOperator,
  type SmartRuleValue,
} from '../types';

const FIELD_VALUES = new Set([
  'title',
  'artist',
  'album',
  'genre',
  'mediaType',
  'favorite',
  'duration',
  'addedAt',
  'playCount',
  'resolution',
]);
const FIELDS = SMART_RULE_FIELDS.filter((field) => FIELD_VALUES.has(field.value));

function fieldType(field: string) {
  return FIELDS.find((option) => option.value === field)?.type ?? 'text';
}

function parseValue(field: string, raw: string): SmartRuleValue {
  const type = fieldType(field);
  if (type === 'boolean') return raw === 'true';
  if (type === 'number' || type === 'date') {
    const value = raw.trim();
    return value === '' ? undefined : Number(value);
  }
  return raw;
}

function displayValue(value: SmartRuleValue | undefined): string {
  if (value == null) return '';
  return typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? theme.backgroundSelected : theme.background },
      ]}>
      <ThemedText type="label" themeColor={selected ? 'tint' : 'textSecondary'}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

type SmartListEditorSheetProps = {
  /** Supply an existing list to edit it; omit to create a new one. */
  list?: SmartList;
  onSave: (list: SmartList) => void;
  onCancel: () => void;
};

/** Minimal rule builder: enough fields and operators to create useful lists. */
export function SmartListEditorSheet({ list, onSave, onCancel }: SmartListEditorSheetProps) {
  const theme = useTheme();
  const fontScale = useFontScale();
  const [name, setName] = useState(list?.name ?? '');
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>(
    list?.mediaTypes ?? ['music', 'video'],
  );
  const [groupOperator, setGroupOperator] = useState<'AND' | 'OR'>(
    list?.conditions.operator ?? 'AND',
  );
  const [rules, setRules] = useState<SmartRule[]>(
    list?.conditions.rules.length
      ? list.conditions.rules.map((rule) => ({ ...rule }))
      : [{ field: 'title', operator: 'contains', value: '' }],
  );

  const toggleMediaType = (value: MediaType) =>
    setMediaTypes((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );

  const updateRule = (index: number, patch: Partial<SmartRule>) =>
    setRules((current) =>
      current.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, ...patch } : rule)),
    );

  const updateValue = (index: number, raw: string) => {
    const rule = rules[index];
    updateRule(index, { value: parseValue(rule.field, raw) });
  };

  const removeRule = (index: number) => setRules((current) => current.filter((_, i) => i !== index));

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const base = list ?? emptySmartList();
    onSave({
      ...base,
      name: trimmed,
      mediaTypes,
      section: mediaTypes.includes('video') ? 'video' : 'music',
      conditions: {
        operator: groupOperator,
        rules: rules.map((rule) =>
          rule.operator === 'is_empty' ? { ...rule, value: undefined } : rule,
        ),
      },
      updatedAt: Date.now(),
    });
  };

  return (
    <View style={styles.container}>
      <ThemedText type="caption" themeColor="textSecondary">
        Name
      </ThemedText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Long music videos"
        placeholderTextColor={theme.textSecondary}
        style={[
          getTypographyStyles(fontScale).body,
          styles.input,
          { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
        ]}
      />

      <ThemedText type="caption" themeColor="textSecondary">
        Media types
      </ThemedText>
      <View style={styles.row}>
        <Chip label="Music" selected={mediaTypes.includes('music')} onPress={() => toggleMediaType('music')} />
        <Chip label="Video" selected={mediaTypes.includes('video')} onPress={() => toggleMediaType('video')} />
      </View>

      <ThemedText type="caption" themeColor="textSecondary">
        Match rules ({groupOperator})
      </ThemedText>
      <View style={styles.row}>
        <Chip label="All rules" selected={groupOperator === 'AND'} onPress={() => setGroupOperator('AND')} />
        <Chip label="Any rule" selected={groupOperator === 'OR'} onPress={() => setGroupOperator('OR')} />
      </View>

      {rules.map((rule, index) => {
        const type = fieldType(rule.field);
        return (
          <View key={index} style={[styles.rule, { borderColor: theme.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.row}>
                {FIELDS.map((field) => (
                  <Chip
                    key={field.value}
                    label={field.label}
                    selected={rule.field === field.value}
                    onPress={() =>
                      updateRule(index, {
                        field: field.value,
                        value: field.type === 'boolean' ? false : undefined,
                        operator: field.type === 'number' ? 'greater_than' : 'equals',
                      })
                    }
                  />
                ))}
              </View>
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.row}>
                {SMART_RULE_OPERATORS.map((operator) => (
                  <Chip
                    key={operator.value}
                    label={operator.label}
                    selected={rule.operator === operator.value}
                    onPress={() => updateRule(index, { operator: operator.value as SmartRuleOperator })}
                  />
                ))}
              </View>
            </ScrollView>

            {rule.operator !== 'is_empty' ? (
              type === 'boolean' ? (
                <View style={styles.row}>
                  <Chip label="Yes" selected={rule.value === true} onPress={() => updateRule(index, { value: true })} />
                  <Chip label="No" selected={rule.value === false} onPress={() => updateRule(index, { value: false })} />
                </View>
              ) : (
                <TextInput
                  value={displayValue(rule.value)}
                  onChangeText={(text) => updateValue(index, text)}
                  placeholder={type === 'number' || type === 'date' ? 'Number' : 'Value'}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType={type === 'text' ? 'default' : 'number-pad'}
                  style={[
                    getTypographyStyles(fontScale).bodySmall,
                    styles.input,
                    { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                  ]}
                />
              )
            ) : null}

            {rules.length > 1 ? (
              <AppButton label="Remove rule" icon={Trash} variant="ghost" size="small" onPress={() => removeRule(index)} />
            ) : null}
          </View>
        );
      })}

      <AppButton
        label="Add rule"
        icon={Plus}
        variant="ghost"
        size="small"
        onPress={() =>
          setRules((current) => [...current, { field: 'artist', operator: 'contains', value: '' }])
        }
      />

      <View style={styles.actions}>
        <AppButton label="Cancel" variant="ghost" onPress={onCancel} />
        <AppButton
          label={list ? 'Save changes' : 'Save list'}
          variant="primary"
          disabled={!name.trim()}
          onPress={save}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    paddingVertical: Spacing.half,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    borderCurve: 'continuous',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    minHeight: 40,
  },
  rule: {
    gap: Spacing.one,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
});
