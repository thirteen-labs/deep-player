import { Pressable, type PressableProps } from 'react-native';

export type PressableScaleProps = PressableProps & {
  /** Scale applied while pressed. Defaults to 0.97. */
  scale?: number;
  /** Opacity applied while pressed. Defaults to 0.75. */
  feedbackOpacity?: number;
};

/** A Pressable with consistent press feedback across the app. */
export function PressableScale({
  style,
  scale = 0.97,
  feedbackOpacity = 0.75,
  ...rest
}: PressableScaleProps) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => {
        const resolved = typeof style === 'function' ? style({ pressed }) : style;
        return [resolved, pressed && { opacity: feedbackOpacity, transform: [{ scale }] }];
      }}
    />
  );
}
