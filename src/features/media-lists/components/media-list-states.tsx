import { EyeClosed, InfoCircle, Search } from 'iconoir-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState, LoadingState } from '@/components/ui';
import type { AppIcon } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { MediaListStateKind } from '../types';

const DEFAULT_COPY: Record<
  Exclude<MediaListStateKind, 'loading'>,
  { message: string; description: string; icon: AppIcon }
> = {
  error: {
    message: "Couldn't load this list",
    description: 'The local library could not be read. Try again in a moment.',
    icon: InfoCircle,
  },
  empty: {
    message: 'Nothing here yet',
    description: 'Add media to your library or choose another collection.',
    icon: InfoCircle,
  },
  search: {
    message: 'No matches',
    description: 'Try a different search term or clear your filters.',
    icon: Search,
  },
  permission: {
    message: 'Access needed',
    description: 'Allow media access in Settings to see your library.',
    icon: EyeClosed,
  },
  missing: {
    message: 'Some files are unavailable',
    description: 'These items are no longer on this device. Remove them from the library.',
    icon: InfoCircle,
  },
  'no-thumbnail': {
    message: 'No thumbnail available',
    description: 'A themed placeholder is shown until artwork is available.',
    icon: EyeClosed,
  },
};

type MediaListStateViewProps = {
  kind: MediaListStateKind;
  message?: string;
  description?: string;
  icon?: AppIcon;
  action?: ReactNode;
};

/** One shared presentation for every list-level state. */
export function MediaListStateView({
  kind,
  message,
  description,
  icon,
  action,
}: MediaListStateViewProps) {
  if (kind === 'loading') {
    return (
      <View style={styles.loading}>
        <LoadingState message={message ?? 'Loading media…'} variant="block" />
      </View>
    );
  }

  const copy = DEFAULT_COPY[kind];
  return (
    <EmptyState
      icon={icon ?? copy.icon}
      message={message ?? copy.message}
      description={description ?? copy.description}
      action={action}
    />
  );
}

/** Small inline caption used by rows with missing files or no artwork. */
export function MediaItemNotice({ label }: { label: string }) {
  return (
    <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 200,
    justifyContent: 'center',
    paddingVertical: Spacing.four,
  },
});
