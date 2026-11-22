import { PropsWithChildren, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import { GlassView } from './glass-view';

type SectionCardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  /** Right-aligned header content (e.g. a button). */
  action?: ReactNode;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  padding?: number;
  gap?: number;
  radius?: number;
}>;

/** Glass card with an optional titled header, body and footer. */
export function SectionCard({
  title,
  subtitle,
  action,
  footer,
  children,
  style,
  contentStyle,
  padding = Spacing.four,
  gap = Spacing.two,
  radius = 24,
}: SectionCardProps) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <GlassView style={[styles.card, { padding, borderRadius: radius }, style]}>
      {hasHeader ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
            {subtitle ? (
              <ThemedText type="small" themeColor="textSecondary">
                {subtitle}
              </ThemedText>
            ) : null}
          </View>
          {action}
        </View>
      ) : null}
      <View style={[styles.body, { gap }, contentStyle]}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  headerText: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  body: {
    width: '100%',
  },
  footer: {
    marginTop: Spacing.three,
  },
});
