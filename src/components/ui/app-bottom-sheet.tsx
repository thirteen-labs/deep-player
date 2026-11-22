import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, type ComponentRef, type PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
    contentStyle?: StyleProp<ViewStyle>;
  }
>;

/** Themed gorhom bottom sheet wrapper. Starts closed and opens via ref.snapToIndex()/close(). */
export const AppBottomSheet = forwardRef<ComponentRef<typeof BottomSheet>, AppBottomSheetProps>(
  function AppBottomSheet(
    {
      children,
      title,
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
        <BottomSheetView style={[styles.content, contentStyle]}>
          {title ? (
            <ThemedText type="smallBold" style={styles.title}>
              {title}
            </ThemedText>
          ) : null}
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    marginBottom: Spacing.one,
  },
});
