import { useWindowDimensions } from 'react-native';

/** Phone-friendly default with tablet/large-screen expansion and user override. */
export function useAdaptiveColumns(preferred?: number): number {
  const { width } = useWindowDimensions();
  const adaptive = width >= 900 ? 4 : width >= 640 ? 3 : 2;
  return preferred && preferred > 2 ? Math.min(preferred, 4) : adaptive;
}
