import { type PropsWithChildren, type ReactNode, type RefObject } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ScrollViewInstance,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ScreenBackground } from '@/components/screen-background';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useScreenBottomInset } from '@/hooks/use-screen-bottom-inset';

import { ScreenHeader } from './screen-header';

type ScreenProps = PropsWithChildren<{
  /** Page title. When provided a ScreenHeader is rendered automatically. */
  title?: string;
  description?: string;
  /** Right-aligned header action. */
  headerAction?: ReactNode;
  /** Replace the automatic header entirely. */
  header?: ReactNode;
  /** Use the device's full width with a minimal (< 8px) outer padding. */
  fullWidth?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  pageStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** Ref used by settings screens to scroll to a focused control. */
  scrollRef?: RefObject<ScrollViewInstance | null>;
}>;

/** Scrollable screen shell: themed background, safe-area padding, centered page. */
export function Screen({
  title,
  description,
  headerAction,
  header,
  children,
  fullWidth = false,
  contentContainerStyle,
  pageStyle,
  style,
  scrollRef,
}: ScreenProps) {
  const bottomInset = useScreenBottomInset();
  const { width } = useWindowDimensions();
  const compact = width < 560;

  return (
    <ScreenBackground style={style}>
      <ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: bottomInset,
            paddingHorizontal: fullWidth ? Spacing.one : compact ? Spacing.three : Spacing.four,
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.page, fullWidth && styles.fullWidthPage, pageStyle]}>
          {header ??
            (title ? (
              <ScreenHeader title={title} description={description} action={headerAction} />
            ) : null)}
          {children}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.five,
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  fullWidthPage: {
    maxWidth: '100%',
  },
});
