// components/ui/UnifiedButton.tsx
import { feedback } from '@/app/utils/feedback';
import { borderRadius, iconSizes, shadows, spacing, typography } from '@/constants/design-system';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { Pressable, PressableStateCallbackType, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface UnifiedButtonProps {
  onPress: () => void;
  children?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons';
  iconColor?: string;
  iconSize?: number;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  feedbackType?: 'light' | 'medium' | 'heavy' | 'success';
}

export default function UnifiedButton({
  onPress,
  children,
  icon,
  iconFamily = 'Ionicons',
  iconColor = '#007aff',
  iconSize,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  feedbackType = 'light',
}: UnifiedButtonProps) {
  
  const handlePress = () => {
    if (!disabled) {
      feedback.triggerFeedback(feedbackType);
      onPress();
    }
  };

  const getButtonStyle = (pressed: boolean): ViewStyle => {
    const baseStyle: ViewStyle = {
      opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
    };

    const sizeStyles: { [key: string]: ViewStyle } = {
      sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
      md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
      lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    };

    const variantStyles: { [key: string]: ViewStyle } = {
      primary: {
        backgroundColor: '#007aff',
        borderRadius: borderRadius.md,
        ...shadows.sm,
      },
      secondary: {
        backgroundColor: '#f5f5f5',
        borderRadius: borderRadius.md,
        ...shadows.sm,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      icon: {
        backgroundColor: '#f9f9f9',
        borderRadius: borderRadius.round,
        padding: spacing.sm,
        ...shadows.sm,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  };

  const getTextStyle = (): TextStyle => {
    const variantTextStyles: { [key: string]: TextStyle } = {
      primary: { color: '#fff', ...typography.bodyBold },
      secondary: { color: '#070707', ...typography.bodyBold },
      ghost: { color: '#007aff', ...typography.body },
      icon: { color: '#070707', ...typography.caption },
    };

    return variantTextStyles[variant];
  };

  const renderIcon = () => {
    if (!icon) return null;

    const size = iconSize || iconSizes.md;
    const IconComponent = iconFamily === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

    return (
      <IconComponent 
        name={icon as any} 
        size={size} 
        color={iconColor}
        style={{ marginRight: children ? spacing.xs : 0 }}
      />
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }: PressableStateCallbackType) => [
        getButtonStyle(pressed),
        style,
      ]}
    >
      <View style={styles.content}>
        {renderIcon()}
        {children && (
          <Text style={[getTextStyle(), textStyle]}>
            {children}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});