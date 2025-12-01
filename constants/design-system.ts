// constants/design-system.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
export const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
};

// Responsive function
export const responsive = (size: number) => {
  const scale = width / 375; // Base on iPhone X width
  return Math.round(size * scale);
};

// Spacing system
export const spacing = {
  xs: responsive(4),
  sm: responsive(8),
  md: responsive(16),
  lg: responsive(24),
  xl: responsive(32),
  xxl: responsive(48),
};

// Icon sizes
export const iconSizes = {
  xs: responsive(16),
  sm: responsive(20),
  md: responsive(24),
  lg: responsive(28),
  xl: responsive(32),
};

// Border radius
export const borderRadius = {
  sm: responsive(8),
  md: responsive(12),
  lg: responsive(16),
  xl: responsive(20),
  round: responsive(999),
};

// Typography
export const typography = {
  h1: { fontSize: responsive(32), fontWeight: '700' as const },
  h2: { fontSize: responsive(28), fontWeight: '700' as const },
  h3: { fontSize: responsive(24), fontWeight: '600' as const },
  h4: { fontSize: responsive(20), fontWeight: '600' as const },
  body: { fontSize: responsive(16), fontWeight: '400' as const },
  bodyBold: { fontSize: responsive(16), fontWeight: '600' as const },
  caption: { fontSize: responsive(14), fontWeight: '400' as const },
  small: { fontSize: responsive(12), fontWeight: '400' as const },
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Get dynamic color from gradient
export const getDynamicColor = (gradientColors: string[]): string => {
  // Extract RGB from first gradient color
  const hex = gradientColors[0].replace('#', '').slice(0, 6);
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return dark or light color based on brightness
  return brightness > 128 ? '#070707' : '#FFFFFF';
};

// Get accent color from gradient
export const getAccentColor = (gradientColors: string[]): string => {
  // Use middle gradient color as accent
  return gradientColors[1] || gradientColors[0];
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
};

export default {
  spacing,
  iconSizes,
  borderRadius,
  typography,
  shadows,
  responsive,
  getDynamicColor,
  getAccentColor,
  animations,
};