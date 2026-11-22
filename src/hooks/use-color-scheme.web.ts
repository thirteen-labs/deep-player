import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 * When the color scheme is unavailable, fall back to the light default.
 */
export function useColorScheme() {
  const colorScheme = useRNColorScheme();

  if (colorScheme === null || colorScheme === undefined) {
    return 'light';
  }

  return colorScheme;
}
