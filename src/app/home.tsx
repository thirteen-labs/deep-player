import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock3, Film, Folder, Headphones, ListMusic, Music2, Play } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  AppButton,
  ContinueCard,
  EmptyState,
  InfoRow,
  Screen,
  SectionCard,
  ThemedIcon,
  TopBar,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore } from '@/lib/db/store';
import { usePlayerStore } from '@/stores/player-store';
import { getContinueItems } from '@/utils/continue';

export default function HomeScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 560;
  const tracks = useDbStore((s) => s.tracks);
  const folders = useDbStore((s) => s.folders);
  const playlists = useDbStore((s) => s.playlists);
  const positions = useDbStore((s) => s.playbackPositions);
  const lastPlayedAt = useDbStore((s) => s.lastPlayedAt);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const load = useDbStore((s) => s.load);
  const play = usePlayerStore((s) => s.play);
  const setQueue = usePlayerStore((s) => s.setQueue);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const musicCount = useMemo(() => tracks.filter((t) => t.mediaType !== 'video').length, [tracks]);
  const videoCount = useMemo(() => tracks.filter((t) => t.mediaType === 'video').length, [tracks]);
  const seriesCount = useMemo(
    () => folders.filter((folder) => folder.smartlistType === 'series').length,
    [folders],
  );

  const continueListening = useMemo(
    () => getContinueItems(tracks, positions, lastPlayedAt, 'music'),
    [tracks, positions, lastPlayedAt],
  );
  const continueWatching = useMemo(
    () => getContinueItems(tracks, positions, lastPlayedAt, 'video'),
    [tracks, positions, lastPlayedAt],
  );

  const resumeMusic = (index: number) => {
    const queue = continueListening.map((item) => item.track);
    setQueue(queue, index);
    play(queue[index]);
  };

  return (
    <Screen header={<TopBar title="Home" showNotifications={false} />}>
      <LinearGradient
        colors={[theme.tint, theme.accent, theme.backgroundElement]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <View style={styles.heroCopy}>
          <ThemedText type="smallBold" themeColor="background" style={styles.eyebrow}>
            DEEP PLAYER
          </ThemedText>
          <ThemedText type="subtitle" themeColor="background" numberOfLines={2} style={styles.heroTitle}>
            Pick up right where you left off.
          </ThemedText>
          <ThemedText type="small" themeColor="background" style={styles.heroSubtitle}>
            Music, videos and smart folders — all in one place.
          </ThemedText>
        </View>
        <View style={[styles.heroIcon, { backgroundColor: theme.glassBackground }]}>
          <ThemedIcon icon={Play} size={30} color="tint" strokeWidth={2.4} />
        </View>
      </LinearGradient>

      <SectionCard
        title="Continue watching"
        subtitle={continueWatching.length ? 'Your videos are waiting' : undefined}
        action={
          <AppButton
            label={compact ? 'Videos' : 'All videos'}
            icon={Film}
            variant="ghost"
            size="small"
            onPress={() => router.push('/videos')}
          />
        }>
        {continueWatching.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
            {continueWatching.map((item) => (
              <ContinueCard
                key={item.track.id}
                item={item}
                mediaType="video"
                onPress={() => router.push(`/videos/${encodeURIComponent(item.track.id)}`)}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            icon={Film}
            message="Nothing to resume yet"
            description={isLoaded ? 'Start a video and it will appear here.' : 'Loading your library…'}
          />
        )}
      </SectionCard>

      <SectionCard
        title="Continue listening"
        subtitle={continueListening.length ? 'Jump back into your tracks' : undefined}
        action={
          <AppButton
            label={compact ? 'Music' : 'All music'}
            icon={Music2}
            variant="ghost"
            size="small"
            onPress={() => router.push('/music')}
          />
        }>
        {continueListening.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
            {continueListening.map((item, index) => (
              <ContinueCard key={item.track.id} item={item} mediaType="music" onPress={() => resumeMusic(index)} />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            icon={Headphones}
            message="No tracks in progress"
            description={isLoaded ? 'Play a song to start your queue here.' : 'Loading your library…'}
          />
        )}
      </SectionCard>

      <SectionCard title="Library at a glance" gap={Spacing.one}>
        <InfoRow label="Music tracks" value={musicCount} icon={Music2} onPress={() => router.push('/music')} />
        <InfoRow label="Videos" value={videoCount} icon={Film} onPress={() => router.push('/videos')} />
        <InfoRow label="Folders" value={folders.length} icon={Folder} onPress={() => router.push('/folders')} />
        {seriesCount > 0 ? (
          <InfoRow label="Video series" value={seriesCount} icon={Clock3} onPress={() => router.push('/folders')} />
        ) : null}
        <InfoRow label="Playlists" value={playlists.length} icon={ListMusic} onPress={() => router.push('/folders')} />
      </SectionCard>

      <SectionCard title="Quick actions" gap={Spacing.two}>
        <AppButton label="Open music library" icon={Music2} variant="primary" onPress={() => router.push('/music')} />
        <AppButton label="Browse folders" icon={Folder} variant="secondary" onPress={() => router.push('/folders')} />
        <AppButton label="Watch videos" icon={Film} variant="secondary" onPress={() => router.push('/videos')} />
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 26,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 148,
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  eyebrow: {
    letterSpacing: 1.6,
    opacity: 0.85,
  },
  heroTitle: {
    fontSize: 27,
    lineHeight: 34,
  },
  heroSubtitle: {
    opacity: 0.9,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRow: {
    gap: Spacing.three,
    paddingRight: Spacing.four,
    paddingBottom: Spacing.one,
  },
});
