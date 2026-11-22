import { PropsWithChildren, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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
  contentContainerStyle?: StyleProp<ViewStyle>;
  pageStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}>;

/** Scrollable screen shell: themed background, safe-area padding, centered page. */
export function Screen({
  title,
  description,
  headerAction,
  header,
  children,
  contentContainerStyle,
  pageStyle,
  style,
}: ScreenProps) {
  const bottomInset = useScreenBottomInset();

  return (
    <ScreenBackground style={style}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomInset },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.page, pageStyle]}>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
});
