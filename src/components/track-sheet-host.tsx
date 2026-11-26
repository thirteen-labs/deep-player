import BottomSheet from '@gorhom/bottom-sheet';
import { MusicDoubleNote } from 'iconoir-react-native';
import { useEffect, useRef, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { TrackActionsSheet } from '@/components/music/track-actions-sheet';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { useDbStore } from '@/lib/db/store';
import { useTrackSheetStore, type TrackSheetHostOwner } from '@/stores/track-sheet-store';

/**
 * Single root-level track options sheet. Mounted once in the root layout so
 * every track row can open it without nesting sheets inside list rows.
 */
export function TrackSheetHost({ owner = 'root' }: { owner?: TrackSheetHostOwner }) {
  const track = useTrackSheetStore((s) => s.track);
  const view = useTrackSheetStore((s) => s.view);
  const close = useTrackSheetStore((s) => s.close);
  const activeHost = useTrackSheetStore((s) => s.host);
  const sheetRef = useRef<ComponentRef<typeof BottomSheet>>(null);

  // Follow the live DB row so favorite/edit/hide changes show up immediately
  // instead of leaving the sheet on a stale snapshot.
  const trackId = track?.id;
  const liveTrack = useDbStore(
    (s) =>
      (trackId ? s.tracks.find((t) => t.id === trackId) : undefined) ??
      (trackId ? s.hiddenTracks.find((t) => t.id === trackId) : undefined),
  );
  const current = liveTrack ?? track;

  useEffect(() => {
    if (track) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [track]);

  // Modal screens (the player) mount their own copy above the modal layer.
  if (activeHost !== owner) return null;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <AppBottomSheet
        ref={sheetRef}
        title="Track options"
        icon={MusicDoubleNote}
        snapPoints={['65%', '92%']}
        scrollable
        scrollToTopKey={`${current?.id ?? 'none'}:${view}`}
        onClose={close}>
        {current ? <TrackActionsSheet track={current} /> : null}
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 21,
  },
});
