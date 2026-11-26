import { useEffect, useState } from 'react';

import { SettingInfo, SettingsScreen, SettingsSection } from '@/components/settings';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useDbStore } from '@/lib/db/store';
import { getDb } from '@/lib/db/schema';

export default function StorageDatabaseScreen() {
  const tracks = useDbStore((s) => s.tracks);
  const folders = useDbStore((s) => s.folders);
  const hiddenTracks = useDbStore((s) => s.hiddenTracks);
  const diagnostics = useSettingsStore((s) => s.settings.advanced.databaseDiagnostics);
  const [integrity, setIntegrity] = useState<string | null>(null);

  useEffect(() => {
    if (!diagnostics) return;
    let cancelled = false;
    void getDb()
      .then(async (db) => {
        const row = await db.getFirstAsync<{ integrity_check: string }>('PRAGMA integrity_check');
        if (!cancelled) setIntegrity(row?.integrity_check ?? 'unknown');
      })
      .catch((error: unknown) => {
        console.warn('Database integrity check failed', error);
        if (!cancelled) setIntegrity('check failed');
      });
    return () => {
      cancelled = true;
    };
  }, [diagnostics]);

  return (
    <SettingsScreen
      title="Database"
      subtitle="Structured media data stored locally with SQLite"
      route="/settings/storage/database"
      section="storage">
      <SettingsSection title="Library totals">
        <SettingInfo message={`${tracks.length} tracks · ${folders.length} folders · ${hiddenTracks.length} hidden tracks`} />
        <SettingInfo message="Clearing preference data never deletes media files or the SQLite library." />
      </SettingsSection>
      {diagnostics ? (
        <SettingsSection title="Integrity">
          <SettingInfo
            tone={integrity === 'ok' ? 'info' : 'warning'}
            message={
              diagnostics
                ? integrity
                  ? `SQLite integrity check: ${integrity}`
                  : 'Running integrity check…'
                : 'Database diagnostics are disabled.'
            }
          />
        </SettingsSection>
      ) : null}
    </SettingsScreen>
  );
}
