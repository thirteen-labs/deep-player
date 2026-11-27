import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import {
  Album,
  AlbumList,
  Calendar,
  Check,
  Clock,
  DashboardSpeed,
  Database,
  EditPencil,
  Eye,
  EyeClosed,
  Folder,
  HardDrive,
  Heart,
  InfoCircle,
  MediaVideo,
  Minus,
  MusicDoubleNote,
  NavArrowLeft,
  NavArrowRight,
  Page,
  Playlist,
  PlaylistPlus,
  Plus,
  Restart,
  ShareAndroid,
  ShareIos,
  SkipNext,
  SoundHigh,
  Timer,
  TimerOff,
  Trash,
  User,
  Xmark,
} from 'iconoir-react-native';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton, InfoRow, MediaArtwork, PressableScale, ThemedIcon } from '@/components/ui';
import type { AppIcon } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { Radius } from '@/constants/typography';
import { useCapabilityStore } from '@/features/settings/capabilities/capability.registry';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore, type Track } from '@/lib/db/store';
import { fetchTrackMetadata } from '@/lib/metadata';
import { shareTrack } from '@/lib/share';
import {
  EQUALIZER_BANDS,
  EQUALIZER_MAX_DB,
  EQUALIZER_MIN_DB,
  EQUALIZER_PRESETS,
  EQUALIZER_STEP_DB,
  useEqualizerStore,
} from '@/stores/equalizer-store';
import {
  PLAYBACK_SPEEDS,
  SLEEP_TIMER_MINUTES,
  usePlayerStore,
  type SleepTimer,
} from '@/stores/player-store';
import { useTrackSheetStore } from '@/stores/track-sheet-store';
import { formatBytes, formatTime } from '@/utils/format';

const DESTRUCTIVE = '#E5484D';
const ShareIcon = Platform.OS === 'android' ? ShareAndroid : ShareIos;

type SheetActionProps = {
  icon: AppIcon;
  label: string;
  description?: string;
  value?: string;
  chevron?: boolean;
  destructive?: boolean;
  active?: boolean;
  onPress: () => void;
};

/** One tappable row in the track sheet, with a leading icon tile. */
function SheetAction({
  icon,
  label,
  description,
  value,
  chevron = false,
  destructive = false,
  active = false,
  onPress,
}: SheetActionProps) {
  const theme = useTheme();
  const tint = destructive ? DESTRUCTIVE : active ? theme.tint : theme.text;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={active ? { selected: true } : undefined}
      onPress={onPress}
      style={styles.action}>
      <View style={[styles.actionIcon, { backgroundColor: theme.backgroundSelected }]}>
        <ThemedIcon icon={icon} size={18} color={destructive ? DESTRUCTIVE : active ? 'tint' : 'text'} />
      </View>
      <View style={styles.actionCopy}>
        <ThemedText type="body" style={{ color: tint }}>
          {label}
        </ThemedText>
        {description ? (
          <ThemedText type="caption" themeColor="textSecondary">
            {description}
          </ThemedText>
        ) : null}
      </View>
      {value ? (
        <ThemedText type="bodySmall" themeColor="textSecondary">
          {value}
        </ThemedText>
      ) : null}
      {chevron ? <ThemedIcon icon={NavArrowRight} size={16} color="textSecondary" /> : null}
    </PressableScale>
  );
}

/** Back arrow + section title used by the sheet's sub-views. */
function SheetHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.subHeader}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={styles.backButton}>
        <ThemedIcon icon={NavArrowLeft} size={18} color="text" />
      </PressableScale>
      <ThemedText type="label">{title}</ThemedText>
    </View>
  );
}

function TrackHeader({ track }: { track: Track }) {
  const isVideo = track.mediaType === 'video';
  const subtitle = isVideo
    ? track.title || track.uri
    : [track.artist || 'Unknown artist', track.album].filter(Boolean).join(' • ');
  return (
    <View style={styles.trackHeader}>
      <MediaArtwork
        uri={track.artworkUri}
        size={52}
        radius={Radius.md}
        fallbackIcon={isVideo ? MediaVideo : MusicDoubleNote}
      />
      <View style={styles.trackHeaderCopy}>
        <ThemedText type="label" numberOfLines={1}>
          {track.title || track.uri}
        </ThemedText>
        <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={1}>
          {subtitle}
        </ThemedText>
      </View>
    </View>
  );
}

function EditField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="bodySmall" themeColor="textSecondary">
        {label}
      </ThemedText>
      <BottomSheetTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
        ]}
      />
    </View>
  );
}

/** Edit form. Mounted fresh each time the panel opens, so state seeds from the track. */
function EditPanel({
  track,
  onBack,
  onSaved,
}: {
  track: Track;
  onBack: () => void;
  onSaved: (track: Track) => void;
}) {
  const updateTrack = useDbStore((s) => s.updateTrack);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [album, setAlbum] = useState(track.album);
  const [genre, setGenre] = useState(track.genre);

  const reset = () => {
    setTitle(track.title);
    setArtist(track.artist);
    setAlbum(track.album);
    setGenre(track.genre);
  };

  const save = () => {
    const patch = {
      title: title.trim() || track.title,
      artist: artist.trim(),
      album: album.trim(),
      genre: genre.trim(),
    };
    void updateTrack(track.id, patch).then(() => onSaved({ ...track, ...patch }));
  };

  const fetchMetadata = async () => {
    try {
      const meta = await fetchTrackMetadata(track);
      if (meta.title) setTitle(meta.title);
      if (meta.artist !== undefined) setArtist(meta.artist ?? '');
      if (meta.album !== undefined) setAlbum(meta.album ?? '');
      if (meta.genre !== undefined) setGenre(meta.genre ?? '');
      if (Object.keys(meta).length === 0) {
        Alert.alert('No metadata found', 'Could not read embedded tags for this track.');
      }
    } catch (error) {
      console.warn('Metadata fetch failed', error);
      Alert.alert('Metadata fetch failed', 'Unable to read metadata from this file.');
    }
  };

  return (
    <>
      <SheetHeader title="Edit track" onBack={onBack} />
      <ThemedText type="bodySmall" themeColor="textSecondary">
        Update the track info, read embedded tags, or save your changes.
      </ThemedText>
      <EditField label="Title" value={title} onChangeText={setTitle} />
      <EditField label="Artist" value={artist} onChangeText={setArtist} />
      <EditField label="Album" value={album} onChangeText={setAlbum} />
      <EditField label="Genre" value={genre} onChangeText={setGenre} />
      <View style={styles.inlineActions}>
        <AppButton label="Save" variant="primary" size="small" icon={Check} onPress={save} />
        <AppButton
          label="Fetch metadata"
          variant="ghost"
          size="small"
          icon={Database}
          onPress={() => void fetchMetadata()}
        />
        <AppButton label="Reset" variant="ghost" size="small" icon={Restart} onPress={reset} />
      </View>
    </>
  );
}

/** Playlist picker plus inline "new playlist" creation. */
function PlaylistPanel({
  track,
  onBack,
  onClose,
}: {
  track: Track;
  onBack: () => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const playlists = useDbStore((s) => s.playlists);
  const addToPlaylist = useDbStore((s) => s.addToPlaylist);
  const createPlaylist = useDbStore((s) => s.createPlaylist);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const addTo = (playlistId: string) => {
    void addToPlaylist(playlistId, track.id).then(onClose);
  };

  const createAndAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    void createPlaylist(trimmed)
      .then((playlistId) => addToPlaylist(playlistId, track.id))
      .then(onClose);
  };

  return (
    <>
      <SheetHeader title="Add to playlist" onBack={onBack} />
      {playlists.length === 0 ? (
        <ThemedText type="bodySmall" themeColor="textSecondary">
          You don&apos;t have any playlists yet. Create one below.
        </ThemedText>
      ) : (
        playlists.map((playlist) => (
          <SheetAction
            key={playlist.id}
            icon={Playlist}
            label={playlist.name}
            onPress={() => addTo(playlist.id)}
          />
        ))
      )}
      {creating ? (
        <View style={styles.createRow}>
          <BottomSheetTextInput
            value={name}
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={createAndAdd}
          />
          <View style={styles.inlineActions}>
            <AppButton
              label="Cancel"
              variant="ghost"
              size="small"
              icon={Xmark}
              onPress={() => {
                setCreating(false);
                setName('');
              }}
            />
            <AppButton
              label="Create & add"
              variant="primary"
              size="small"
              icon={Plus}
              disabled={!name.trim()}
              onPress={createAndAdd}
            />
          </View>
        </View>
      ) : (
        <SheetAction
          icon={Plus}
          label="New playlist"
          description="Create a playlist with this track"
          onPress={() => setCreating(true)}
        />
      )}
    </>
  );
}

/** The interactive body of the shared track options bottom sheet. */
export function TrackActionsSheet({ track }: { track: Track }) {
  const theme = useTheme();
  const isVideo = track.mediaType === 'video';
  const view = useTrackSheetStore((s) => s.view);
  const setView = useTrackSheetStore((s) => s.setView);
  const close = useTrackSheetStore((s) => s.close);
  const open = useTrackSheetStore((s) => s.open);

  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const speed = usePlayerStore((s) => s.speed);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const sleepTimer = usePlayerStore((s) => s.sleepTimer);
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);
  const sleepTimerDefault = usePlayerStore((s) => s.preferences.sleepTimerDefault);

  const playlists = useDbStore((s) => s.playlists);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);
  const deleteTrack = useDbStore((s) => s.deleteTrack);
  const setTrackHidden = useDbStore((s) => s.setTrackHidden);
  const lastPlayedAt = useDbStore((s) => s.lastPlayedAt[track.id]);

  const equalizerSupported = useCapabilityStore((s) => s.capabilities.audio.equalizer);
  const equalizerEnabled = useEqualizerStore((s) => s.enabled);
  const equalizerPreset = useEqualizerStore((s) => s.presetId);
  const equalizerBands = useEqualizerStore((s) => s.bands);
  const equalizerPreamp = useEqualizerStore((s) => s.preamp);
  const setEqualizerEnabled = useEqualizerStore((s) => s.setEnabled);
  const setEqualizerBand = useEqualizerStore((s) => s.setBand);
  const setEqualizerPreamp = useEqualizerStore((s) => s.setPreamp);
  const applyEqualizerPreset = useEqualizerStore((s) => s.applyPreset);
  const resetEqualizer = useEqualizerStore((s) => s.reset);

  const speedLabel = `${speed}×`;
  const sleepLabel =
    sleepTimer == null
      ? 'Off'
      : sleepTimer.kind === 'track'
        ? 'End of track'
        : `${sleepTimer.minutes} min`;
  const equalizerLabel = equalizerEnabled
    ? equalizerPreset === 'custom'
      ? 'Custom'
      : (EQUALIZER_PRESETS.find((preset) => preset.id === equalizerPreset)?.label ?? 'On')
    : 'Off';

  const sleepMinutesOptions = Array.from(
    new Set([...SLEEP_TIMER_MINUTES, sleepTimerDefault]),
  )
    .filter((minutes) => minutes > 0)
    .sort((a, b) => a - b);

  const backToMenu = () => setView('menu');

  const confirmDelete = () => {
    const noun = isVideo ? 'video' : 'track';
    Alert.alert(`Delete ${noun}?`, `Delete "${track.title || track.uri}" from your library?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteTrack(track.id).then(close);
        },
      },
    ]);
  };

  const toggleHidden = () => {
    void setTrackHidden(track.id, !track.hidden).then(close);
  };

  const onShare = () => {
    close();
    void shareTrack(track).catch((error) => {
      console.warn('Share failed', error);
      Alert.alert('Share failed', 'This track could not be shared right now.');
    });
  };

  const chooseSleepTimer = (timer: SleepTimer | null) => {
    setSleepTimer(timer);
    setView('menu');
  };

  if (view === 'playlist') {
    return <PlaylistPanel track={track} onBack={backToMenu} onClose={close} />;
  }

  if (view === 'edit') {
    return (
      <EditPanel
        key={track.id}
        track={track}
        onBack={backToMenu}
        onSaved={(updated) => open(updated, 'menu')}
      />
    );
  }

  if (view === 'speed') {
    return (
      <>
        <SheetHeader title="Playback speed" onBack={backToMenu} />
        {PLAYBACK_SPEEDS.map((value) => (
          <SheetAction
            key={value}
            icon={value === speed ? Check : DashboardSpeed}
            label={`${value}×`}
            description={value === 1 ? 'Normal speed' : undefined}
            active={value === speed}
            onPress={() => setSpeed(value)}
          />
        ))}
      </>
    );
  }

  if (view === 'sleep') {
    const isOff = sleepTimer == null;
    return (
      <>
        <SheetHeader title="Sleep timer" onBack={backToMenu} />
        <SheetAction
          icon={TimerOff}
          label="Off"
          active={isOff}
          value={isOff ? '✓' : undefined}
          onPress={() => chooseSleepTimer(null)}
        />
        {sleepMinutesOptions.map((minutes) => {
          const active = sleepTimer?.kind === 'duration' && sleepTimer.minutes === minutes;
          return (
            <SheetAction
              key={minutes}
              icon={Timer}
              label={`${minutes} minutes${minutes === sleepTimerDefault ? ' — default' : ''}`}
              active={active}
              value={active ? '✓' : undefined}
              onPress={() => chooseSleepTimer({ kind: 'duration', minutes })}
            />
          );
        })}
        <SheetAction
          icon={MusicDoubleNote}
          label="End of track"
          description="Pause when the current track finishes"
          active={sleepTimer?.kind === 'track'}
          value={sleepTimer?.kind === 'track' ? '✓' : undefined}
          onPress={() => chooseSleepTimer({ kind: 'track' })}
        />
      </>
    );
  }

  if (view === 'equalizer') {
    if (!equalizerSupported) {
      return (
        <>
          <SheetHeader title="Equalizer" onBack={backToMenu} />
          <ThemedText type="bodySmall" themeColor="textSecondary">
            Audio effects are not available in the active playback engine. The equalizer preferences
            are disabled in Settings.
          </ThemedText>
        </>
      );
    }
    return (
      <>
        <SheetHeader title="Equalizer" onBack={backToMenu} />
        <SheetAction
          icon={SoundHigh}
          label="Equalizer"
          description={equalizerEnabled ? 'On' : 'Off'}
          active={equalizerEnabled}
          value={equalizerEnabled ? 'On' : 'Off'}
          onPress={() => setEqualizerEnabled(!equalizerEnabled)}
        />
        <View style={styles.presetRow}>
          {EQUALIZER_PRESETS.map((preset) => (
            <AppButton
              key={preset.id}
              label={preset.label}
              size="small"
              variant={equalizerPreset === preset.id ? 'primary' : 'secondary'}
              onPress={() => applyEqualizerPreset(preset.id)}
            />
          ))}
        </View>
        <View style={styles.bandList}>
          {EQUALIZER_BANDS.map((band, index) => (
            <View key={band.hz} style={styles.bandRow}>
              <ThemedText type="bodySmall" themeColor="textSecondary" style={styles.bandLabel}>
                {band.label} Hz
              </ThemedText>
              <View style={styles.bandControls}>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`Lower ${band.label} hertz`}
                  onPress={() => setEqualizerBand(index, equalizerBands[index] - EQUALIZER_STEP_DB)}
                  style={[styles.stepButton, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedIcon icon={Minus} size={16} color="text" />
                </PressableScale>
                <ThemedText type="numeric" style={styles.bandValue}>
                  {equalizerBands[index] > 0 ? '+' : ''}
                  {equalizerBands[index]} dB
                </ThemedText>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`Raise ${band.label} hertz`}
                  onPress={() => setEqualizerBand(index, equalizerBands[index] + EQUALIZER_STEP_DB)}
                  style={[styles.stepButton, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedIcon icon={Plus} size={16} color="text" />
                </PressableScale>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.bandRow}>
          <ThemedText type="bodySmall" themeColor="textSecondary" style={styles.bandLabel}>
            Preamp
          </ThemedText>
          <View style={styles.bandControls}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Lower preamp"
              onPress={() => setEqualizerPreamp(equalizerPreamp - EQUALIZER_STEP_DB)}
              style={[styles.stepButton, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedIcon icon={Minus} size={16} color="text" />
            </PressableScale>
            <ThemedText type="numeric" style={styles.bandValue}>
              {equalizerPreamp > 0 ? '+' : ''}
              {equalizerPreamp} dB
            </ThemedText>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Raise preamp"
              onPress={() => setEqualizerPreamp(equalizerPreamp + EQUALIZER_STEP_DB)}
              style={[styles.stepButton, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedIcon icon={Plus} size={16} color="text" />
            </PressableScale>
          </View>
        </View>
        <ThemedText type="caption" themeColor="textSecondary">
          {EQUALIZER_MIN_DB} dB to {EQUALIZER_MAX_DB} dB per band. Your curve is saved; the current
          audio engine doesn&apos;t apply output filtering yet.
        </ThemedText>
        <AppButton label="Reset" variant="ghost" size="small" icon={Restart} onPress={resetEqualizer} />
      </>
    );
  }

  if (view === 'info') {
    const format = track.mimeType ?? track.uri.split('.').pop()?.toUpperCase() ?? 'Unknown';
    return (
      <>
        <SheetHeader title={isVideo ? 'Video info' : 'Media info'} onBack={backToMenu} />
        <InfoRow
          label="Title"
          icon={isVideo ? MediaVideo : MusicDoubleNote}
          value={track.title || '—'}
        />
        {!isVideo ? (
          <>
            <InfoRow label="Artist" icon={User} value={track.artist || '—'} />
            <InfoRow label="Album" icon={Album} value={track.album || '—'} />
            <InfoRow label="Album artist" icon={User} value={track.albumArtist || '—'} />
            <InfoRow label="Genre" icon={AlbumList} value={track.genre || '—'} />
          </>
        ) : (
          <InfoRow label="Media type" icon={MediaVideo} value="Video" />
        )}
        <InfoRow label="Duration" icon={Clock} value={formatTime(track.durationMs / 1000)} />
        <InfoRow label="Size" icon={HardDrive} value={formatBytes(track.size)} />
        <InfoRow label="Format" icon={Page} value={format} />
        <InfoRow
          label="Added"
          icon={Calendar}
          value={track.addedAt ? new Date(track.addedAt).toLocaleDateString() : '—'}
        />
        <InfoRow
          label="Last played"
          icon={Clock}
          value={lastPlayedAt ? new Date(lastPlayedAt).toLocaleString() : 'Never'}
        />
        <InfoRow label="Favorite" icon={Heart} value={track.favorite ? 'Yes' : 'No'} />
        <InfoRow label="Location" icon={Folder} value={track.localUri ?? track.uri} />
      </>
    );
  }

  if (isVideo) {
    return (
      <>
        <TrackHeader track={track} />
        <SheetAction
          icon={MediaVideo}
          label="Play video"
          onPress={() => {
            close();
            router.push(`/videos/${encodeURIComponent(track.id)}`);
          }}
        />
        <SheetAction
          icon={Heart}
          label={track.favorite ? 'Remove from favorites' : 'Add to favorites'}
          active={track.favorite}
          value={track.favorite ? 'On' : undefined}
          onPress={() => void toggleFavorite(track.id)}
        />
        <SheetAction
          icon={track.hidden ? Eye : EyeClosed}
          label={track.hidden ? 'Unhide video' : 'Hide / blacklist'}
          description={
            track.hidden
              ? 'Show this video in library lists again'
              : 'Remove this video from library lists'
          }
          onPress={toggleHidden}
        />
        <SheetAction icon={InfoCircle} label="Video info" chevron onPress={() => setView('info')} />
        <SheetAction icon={ShareIcon} label="Share" onPress={onShare} />
        <SheetAction icon={Trash} label="Delete video" destructive onPress={confirmDelete} />
      </>
    );
  }

  return (
    <>
      <TrackHeader track={track} />
      <SheetAction
        icon={SkipNext}
        label="Play next"
        onPress={() => {
          playNext(track);
          close();
        }}
      />
      <SheetAction
        icon={Plus}
        label="Add to queue"
        onPress={() => {
          addToQueue(track);
          close();
        }}
      />
      <SheetAction
        icon={Heart}
        label={track.favorite ? 'Remove from favorites' : 'Add to favorites'}
        active={track.favorite}
        value={track.favorite ? 'On' : undefined}
        onPress={() => void toggleFavorite(track.id)}
      />
      <SheetAction
        icon={PlaylistPlus}
        label="Add to playlist"
        value={playlists.length > 0 ? `${playlists.length}` : undefined}
        chevron
        onPress={() => setView('playlist')}
      />
      <SheetAction
        icon={DashboardSpeed}
        label="Playback speed"
        value={speedLabel}
        chevron
        onPress={() => setView('speed')}
      />
      <SheetAction
        icon={sleepTimer ? Timer : TimerOff}
        label="Sleep timer"
        value={sleepLabel}
        chevron
        onPress={() => setView('sleep')}
      />
      {equalizerSupported ? (
        <SheetAction
          icon={SoundHigh}
          label="Equalizer"
          value={equalizerLabel}
          chevron
          onPress={() => setView('equalizer')}
        />
      ) : null}
      <SheetAction
        icon={track.hidden ? Eye : EyeClosed}
        label={track.hidden ? 'Unhide track' : 'Hide / blacklist'}
        description={
          track.hidden
            ? 'Show this track in library lists again'
            : 'Remove this track from library lists'
        }
        onPress={toggleHidden}
      />
      <SheetAction icon={InfoCircle} label="Media info" chevron onPress={() => setView('info')} />
      <SheetAction icon={EditPencil} label="Edit track" chevron onPress={() => setView('edit')} />
      <SheetAction icon={ShareIcon} label="Share" onPress={onShare} />
      <SheetAction icon={Trash} label="Delete" destructive onPress={confirmDelete} />
    </>
  );
}

const styles = StyleSheet.create({
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  trackHeaderCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
    borderCurve: 'continuous',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  bandList: {
    gap: Spacing.two,
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  bandLabel: {
    width: 64,
  },
  bandControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bandValue: {
    width: 64,
    textAlign: 'center',
  },
  createRow: {
    gap: Spacing.two,
  },
  inlineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
