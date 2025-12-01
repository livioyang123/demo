// components/ui/UnifiedCard.tsx
import { feedback } from '@/app/utils/feedback';
import { borderRadius, shadows, spacing } from '@/constants/design-system';
import React, { ReactNode } from 'react';
import { Pressable, PressableStateCallbackType, View, ViewStyle } from 'react-native';

interface UnifiedCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  disabled?: boolean;
}

export default function UnifiedCard({
  children,
  onPress,
  style,
  elevation = 'md',
  padding = 'md',
  radius = 'md',
  backgroundColor = 'white',
  disabled = false,
}: UnifiedCardProps) {
  
  const handlePress = () => {
    if (onPress && !disabled) {
      feedback.triggerFeedback('light');
      onPress();
    }
  };

  const paddingMap = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  const radiusMap = {
    sm: borderRadius.sm,
    md: borderRadius.md,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
  };

  const elevationMap = {
    none: {},
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
  };

  const cardStyle: ViewStyle = {
    backgroundColor,
    padding: paddingMap[padding],
    borderRadius: radiusMap[radius],
    ...elevationMap[elevation],
  };

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }: PressableStateCallbackType) => [
          cardStyle,
          {
            opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
            transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
          },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}