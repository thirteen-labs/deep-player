import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  applyImport,
  backupCategories,
  pickBackupFile,
  parseBackup,
  previewImport,
  type ImportPreview,
} from '@/features/settings/backup/import-settings';
import { exportSettings } from '@/features/settings/backup/export-settings';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { BACKUP_CATEGORIES, type BackupCategory } from '@/features/settings/types/settings.enums';
import { labelize } from '@/features/settings/ui/control-config';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SettingInfo } from './SettingInfo';
import { SettingsResetDialog } from './SettingsResetDialog';
import { SettingsSection } from './SettingsSection';

/** Local JSON backup/import workflow (spec §9). */
export function BackupSettings() {
  const theme = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const replaceSettings = useSettingsStore((s) => s.replaceSettings);
  const [selected, setSelected] = useState<BackupCategory[]>(() =>
    BACKUP_CATEGORIES.filter((category) => {
      if (category === 'appearance') return settings.storage.backupIncludeAppearance;
      if (category === 'playback') return settings.storage.backupIncludePlayback;
      if (category === 'folders') return settings.storage.backupIncludeFolders;
      if (category === 'player') return settings.storage.backupIncludePresets;
      return true;
    }),
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState<{ raw: unknown; preview: ImportPreview } | null>(null);

  const toggle = (category: BackupCategory) => {
    setSelected((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  const onExport = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const result = await exportSettings(settings, selected);
      setStatus(`Exported ${Object.keys(result.backup.settings).length} categories${result.shared ? ' and opened Share' : ''}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Export failed.');
    } finally {
      setBusy(false);
    }
  };

  const onPick = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const raw = await pickBackupFile();
      if (!raw) {
        setStatus('Import cancelled.');
        return;
      }
      const backup = parseBackup(raw);
      const parsedPreview = previewImport(settings, backup, backupCategories(backup));
      setPending({ raw, preview: parsedPreview });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Invalid backup file.');
    } finally {
      setBusy(false);
    }
  };

  const onConfirmImport = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await applyImport(
        settings,
        pending.raw,
        (next) => replaceSettings(next),
        () => useSettingsStore.getState().settings,
        pending.preview.categories,
      );
      setStatus(`Restored ${pending.preview.changes.length} setting(s).`);
      setPending(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Import failed; existing settings were preserved.');
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SettingsSection title="Export categories">
        <View style={styles.chips}>
          {BACKUP_CATEGORIES.map((category) => {
            const active = selected.includes(category);
            return (
              <Text
                key={category}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => toggle(category)}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? theme.accent : theme.border,
                    backgroundColor: active ? theme.accent : theme.backgroundElement,
                    color: active ? theme.background : theme.text,
                  },
                ]}>
                {labelize(category)}
              </Text>
            );
          })}
        </View>
        <Text
          accessibilityRole="button"
          onPress={() => void onExport()}
          style={[styles.action, { color: theme.accent }]}>
          {busy ? 'Working…' : 'Export settings JSON'}
        </Text>
      </SettingsSection>

      <SettingsSection title="Restore">
        <Text
          accessibilityRole="button"
          onPress={() => void onPick()}
          style={[styles.action, { color: theme.accent }]}>
          {busy ? 'Working…' : 'Choose a backup file'}
        </Text>
        <SettingInfo
          message="Backups never include PINs, credentials, media files, or your wallpaper path. Future schema versions are rejected."
        />
      </SettingsSection>

      {status ? <SettingInfo tone="warning" message={status} /> : null}

      <SettingsResetDialog
        visible={pending !== null}
        title="Apply this backup?"
        message={`${pending?.preview.changes.length ?? 0} setting(s) will change. Your existing settings are restored automatically if validation fails.`}
        confirmLabel="Import"
        onCancel={() => setPending(null)}
        onConfirm={() => void onConfirmImport()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingHorizontal: Spacing.three },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, fontSize: 13, fontWeight: '600' },
  action: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontSize: 15, fontWeight: '600' },
});
