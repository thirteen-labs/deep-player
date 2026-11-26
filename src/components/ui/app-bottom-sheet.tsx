import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useRef, type ComponentRef, type PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedIcon, type AppIcon } from './themed-icon';

type AppBottomSheetProps = PropsWithChildren<
  Pick<
    BottomSheetProps,
    | 'snapPoints'
    | 'index'
    | 'enableDynamicSizing'
    | 'enablePanDownToClose'
    | 'onChange'
    | 'onClose'
  > & {
    title?: string;
    /** Icon shown before the sheet title. */
    icon?: AppIcon;
    /** Wraps the content in a scroll view (needed for long action lists). */
    scrollable?: boolean;
    /** When this value changes the scrollable content jumps back to the top. */
    scrollToTopKey?: string;
    contentStyle?: StyleProp<ViewStyle>;
  }
>;

/** Themed gorhom bottom sheet wrapper. Starts closed and opens via ref.snapToIndex()/close(). */
export const AppBottomSheet = forwardRef<ComponentRef<typeof BottomSheet>, AppBottomSheetProps>(
  function AppBottomSheet(
    {
      children,
      title,
      icon,
      scrollable = false,
      scrollToTopKey,
      snapPoints,
      index = -1,
      // Dynamic sizing only makes sense when no explicit snap points are given.
      enableDynamicSizing = !snapPoints,
      enablePanDownToClose = true,
      onChange,
      onClose,
      contentStyle,
    },
    ref,
  ) {
    const theme = useTheme();
    const scrollRef = useRef<ComponentRef<typeof BottomSheetScrollView>>(null);

    useEffect(() => {
      if (scrollable) scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [scrollable, scrollToTopKey]);

    const header =
      title || icon ? (
        <View style={styles.header}>
          {icon ? <ThemedIcon icon={icon} size={18} color="tint" /> : null}
          {title ? <ThemedText type="label">{title}</ThemedText> : null}
        </View>
      ) : null;

    return (
      <BottomSheet
        ref={ref}
        snapPoints={snapPoints}
        index={index}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={enablePanDownToClose}
        onChange={onChange}
        onClose={onClose}
        backgroundStyle={{ backgroundColor: theme.backgroundElement }}
        handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
        backdropComponent={(props: BottomSheetBackdropProps) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}>
        {scrollable ? (
          <BottomSheetScrollView
            ref={scrollRef}
            contentContainerStyle={[styles.content, contentStyle]}
            showsVerticalScrollIndicator={false}>
            {header}
            {children}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView style={[styles.content, contentStyle]}>
            {header}
            {children}
          </BottomSheetView>
        )}
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
});
