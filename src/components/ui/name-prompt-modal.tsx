import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getTypographyStyles, Radius } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { useFontScale } from '@/stores/font-size-store';

import { AppButton } from './app-button';
import { GlassView } from './glass-view';

type NamePromptModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  value?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

/** Cross-platform replacement for `Alert.prompt` (which is iOS-only). */
export function NamePromptModal({
  visible,
  title,
  description,
  value = '',
  confirmLabel = 'Save',
  onCancel,
  onConfirm,
}: NamePromptModalProps) {
  const theme = useTheme();
  const fontScale = useFontScale();
  // The parent remounts this modal with a new `key` each time it opens, so the
  // initial value is always fresh without an effect.
  const [text, setText] = useState(value);

  const submit = () => {
    const trimmed = text.trim();
    if (trimmed) onConfirm(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
          <Pressable style={styles.dismissArea} accessibilityLabel="Dismiss dialog" onPress={onCancel} />
          <GlassView style={[styles.card, { borderColor: theme.glassBorder }]}>
            <ThemedText type="label">{title}</ThemedText>
            {description ? (
              <ThemedText type="bodySmall" themeColor="textSecondary">
                {description}
              </ThemedText>
            ) : null}
            <TextInput
              autoFocus
              value={text}
              onChangeText={setText}
              onSubmitEditing={submit}
              returnKeyType="done"
              placeholder="Name"
              placeholderTextColor={theme.textSecondary}
              style={[
                getTypographyStyles(fontScale).body,
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
            <View style={styles.actions}>
              <AppButton label="Cancel" variant="ghost" size="small" onPress={onCancel} />
              <AppButton label={confirmLabel} variant="primary" size="small" onPress={submit} />
            </View>
          </GlassView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  dismissArea: {
    position: 'absolute',
    inset: 0,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
