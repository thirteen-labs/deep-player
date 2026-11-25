import { PropsWithChildren, type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { Radius, type TextVariant } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

import { GlassView } from './glass-view';
import type { AppIcon } from './themed-icon';
import { ThemedIcon } from './themed-icon';

type SectionCardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  /** Leading header icon. */
  icon?: AppIcon;
  /** Header icon size. */
  iconSize?: number;
  /** Semantic heading level. */
  titleVariant?: TextVariant;
  /** Custom heading style (for example, a larger section title). */
  titleStyle?: StyleProp<TextStyle>;
  /** Draw a hairline below the header to separate it from its children. */
  headerDivider?: boolean;
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
  icon: Icon,
  iconSize = 16,
  titleVariant = 'label',
  titleStyle,
  headerDivider = false,
  action,
  footer,
  children,
  style,
  contentStyle,
  padding = Spacing.four,
  gap = Spacing.two,
  radius = Radius.xxl,
}: SectionCardProps) {
  const theme = useTheme();
  const hasHeader = Boolean(title || subtitle || Icon || action);

  return (
    <GlassView style={[styles.card, { padding, borderRadius: radius }, style]}>
      {hasHeader ? (
        <View
          style={[
            styles.header,
            headerDivider && {
              marginBottom: Spacing.three,
              paddingBottom: Spacing.two,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: theme.border,
            },
          ]}>
          <View style={styles.headerLeading}>
            {Icon ? (
              <View style={[styles.iconBadge, { backgroundColor: withAlpha(theme.tint, 0.14) }]}>
                <ThemedIcon icon={Icon} size={iconSize} color="tint" />
              </View>
            ) : null}
            <View style={styles.headerText}>
              {title ? (
                <ThemedText type={titleVariant} style={titleStyle}>
                  {title}
                </ThemedText>
              ) : null}
              {subtitle ? (
                <ThemedText type="bodySmall" themeColor="textSecondary">
                  {subtitle}
                </ThemedText>
              ) : null}
            </View>
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
  headerLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  headerText: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: '100%',
  },
  footer: {
    marginTop: Spacing.three,
  },
});
