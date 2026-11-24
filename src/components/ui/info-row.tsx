import type { AppIcon } from './themed-icon';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import { PressableScale } from './pressable-scale';
import { ThemedIcon } from './themed-icon';

type InfoRowProps = {
  label: string;
  value?: ReactNode;
  subtitle?: string;
  icon?: AppIcon;
  onPress?: () => void;
  valueColor?: 'text' | 'textSecondary' | 'tint' | 'accent';
  style?: StyleProp<ViewStyle>;
};

/** Left label (+ optional subtitle) with a right-aligned value; optional press target. */
export function InfoRow({
  label,
  value,
  subtitle,
  icon,
  onPress,
  valueColor = 'text',
  style,
}: InfoRowProps) {
  const content = (
    <>
      <View style={styles.copy}>
        <View style={styles.labelLine}>
          {icon ? <ThemedIcon icon={icon} size={18} color="textSecondary" /> : null}
          <ThemedText type="default" numberOfLines={1}>
            {label}
          </ThemedText>
        </View>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {value != null ? (
        <View style={styles.value}>
          {typeof value === 'string' || typeof value === 'number' ? (
            <ThemedText type="default" themeColor={valueColor} selectable>
              {String(value)}
            </ThemedText>
          ) : (
            value
          )}
        </View>
      ) : null}
    </>
  );

  const rowStyle = [styles.row, style];

  return onPress ? (
    <PressableScale accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={rowStyle}>
      {content}
    </PressableScale>
  ) : (
    <View style={rowStyle}>{content}</View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderCurve: 'continuous',
  },
  copy: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  labelLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  value: {
    flexShrink: 0,
    maxWidth: '50%',
  },
});
