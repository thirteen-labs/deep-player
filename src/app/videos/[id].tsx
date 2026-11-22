import { Pause, Play } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { Scrubber } from '@/components/ui/scrubber';
import { Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useDbStore } from '@/lib/db/store';

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams();
  const track = useDbStore((s) => s.tracks.find((t) => t.id === String(id)));

  const videoUri = track?.uri;
  const player = useVideoPlayer(videoUri ?? null, (p) => {
    p.timeUpdateEventInterval = 0.25;
  });

  const [isPlaying, setIsPlaying] = useState(player.playing);
  const [currentTime, setCurrentTime] = useState(player.currentTime);

  useEffect(() => {
    if (videoUri) void player.replaceAsync(videoUri);
  }, [videoUri, player]);

  useEffect(() => {
    const playingSub = player.addListener('playingChange', ({ isPlaying: playing }) => setIsPlaying(playing));
    const timeSub = player.addListener('timeUpdate', ({ currentTime: t }) => setCurrentTime(t));
    return () => {
      playingSub.remove();
      timeSub.remove();
    };
  }, [player]);

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <Screen title={track?.title || 'Video'} description={track?.artist || undefined}>
      <VideoView player={player} style={styles.video} />
      <Scrubber
        currentTime={currentTime}
        duration={player.duration}
        onSeek={(seconds) => {
          // eslint-disable-next-line react-hooks/immutability -- seeking is a player command, not React state.
          player.currentTime = seconds;
        }}
      />
      <View style={styles.controls}>
        <IconButton icon={isPlaying ? Pause : Play} accessibilityLabel={isPlaying ? 'Pause' : 'Play'} onPress={togglePlay} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
  },
  controls: {
    marginTop: Spacing.two,
  },
});
