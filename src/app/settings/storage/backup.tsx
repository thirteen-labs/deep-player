import { BackupSettings, SettingsScreen } from '@/components/settings';

export default function StorageBackupScreen() {
  return (
    <SettingsScreen
      title="Backup & restore"
      subtitle="Portable, local JSON settings backups"
      route="/settings/storage/backup"
      section="storage">
      <BackupSettings />
    </SettingsScreen>
  );
}
