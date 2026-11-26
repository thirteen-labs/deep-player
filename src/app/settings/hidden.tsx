import { Eye, EyeClosed } from 'iconoir-react-native';
import { useEffect } from 'react';

import { AppButton, InfoRow, Screen, TopBar, TrackList } from '@/components/ui';
import { useDbStore } from '@/lib/db/store';
import { usePlayerStore } from '@/stores/player-store';
import { openTrackSheet } from '@/stores/track-sheet-store';

/**
 * Manages blacklisted tracks. Hidden tracks stay in the database (and in
 * playlists) but are excluded from every library list until restored.
 */
export default function HiddenTracksScreen() {
  const hiddenTracks = useDbStore((s) => s.hiddenTracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const load = useDbStore((s) => s.load);
  const setTrackHidden = useDbStore((s) => s.setTrackHidden);
  const play = usePlayerStore((s) => s.play);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const restoreAll = () => {
    for (const track of hiddenTracks) {
      void setTrackHidden(track.id, false);
    }
  };

  return (
    <Screen fullWidth header={<TopBar title="Hidden tracks" showBack />}>
      <InfoRow
        label="Hidden tracks"
        icon={EyeClosed}
        iconSize={22}
        value={`${hiddenTracks.length}`}
        valueColor="textSecondary"
        subtitle="Hidden tracks stay on your device but are left out of library lists."
      />
      {hiddenTracks.length > 0 ? (
        <AppButton
          label="Restore all"
          icon={Eye}
          variant="ghost"
          size="small"
          onPress={restoreAll}
        />
      ) : null}
      <TrackList
        tracks={hiddenTracks}
        isLoading={!isLoaded}
        onSelect={(track) => play(track)}
        onMorePress={(track) => openTrackSheet(track)}
        emptyMessage="No hidden tracks."
        emptyDescription="Hide a track from its options sheet to blacklist it here."
      />
    </Screen>
  );
}
