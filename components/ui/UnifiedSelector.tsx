// components/ui/UnifiedSelector.tsx
import { feedback } from '@/app/utils/feedback';
import { borderRadius, getAccentColor, getDynamicColor, spacing, typography } from '@/constants/design-system';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';


interface SelectorOption {
  label: string;
  value: string;
}

interface UnifiedSelectorProps {
  options: SelectorOption[];
  selected: string;
  onSelect: (value: string) => void;
  style?: ViewStyle;
  gradientColors: string[];
}

export default function UnifiedSelector({
  options,
  selected,
  onSelect,
  style,
  gradientColors,
}: UnifiedSelectorProps) {
  
  const accentColor = getAccentColor(gradientColors);
  const textColor = getDynamicColor(gradientColors);

  const handleSelect = (value: string) => {
    feedback.triggerFeedback('light');
    onSelect(value);
  };

  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => {
        const isSelected = option.value === selected;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option.value)}
            style={({ pressed }) => [
              styles.option,
              isFirst && styles.firstOption,
              isLast && styles.lastOption,
              isSelected && { 
                backgroundColor: accentColor,
              },
              pressed && styles.pressedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && { 
                  color: 'white',
                  fontWeight: '600',
                },
                !isSelected && { color: textColor },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.md,
    padding: spacing.xs / 2,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstOption: {
    borderTopLeftRadius: borderRadius.sm,
    borderBottomLeftRadius: borderRadius.sm,
  },
  lastOption: {
    borderTopRightRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
  },
  pressedOption: {
    opacity: 0.7,
  },
  optionText: {
    ...typography.body,
  },
});