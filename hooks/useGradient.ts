// hooks/useGradient.ts
import { getColor } from '@/app/utils/bgColor';
import { getAccentColor, getDynamicColor } from '@/constants/design-system';
import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

export interface GradientColors {
  colors: string[];
  accentColor: string;
  textColor: string;
}

export function useGradient(): GradientColors {
  const [colors, setColors] = useState<string[]>(getColor());

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('gradientChanged', (newColors: string[]) => {
      setColors(newColors);
    });

    return () => {
      listener.remove();
    };
  }, []);

  return {
    colors,
    accentColor: getAccentColor(colors),
    textColor: getDynamicColor(colors),
  };
}