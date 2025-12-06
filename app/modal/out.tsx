// app/modal/out.tsx
import { add_out } from '@/app/utils/registry';
import icons from '@/assets/icons/out/index';
import CalculatorModal from '@/components/CalculatorModal';
import { borderRadius, responsive, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const iconNames = Object.keys(icons) as (keyof typeof icons)[];
const ICON_SIZE = 30;
const ICONS_PER_ROW = 4;

export default function OutSection() {
  const router = useRouter();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const { accentColor, textColor } = useGradient();

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleIconPress = (iconName: string) => {
    setSelectedIcon(iconName);
    setCalculatorVisible(true);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 3,
      }),
    ]).start();
  };

  const handleCalculatorDone = async (
    amount: number,
    description: string,
    date: Date,
    operation?: 'add' | 'subtract'
  ) => {
    if (!selectedIcon) return;

    const count = {
      type: selectedIcon,
      description: description,
      date: date,
      amount: amount,
    };

    await add_out(count);

    setCalculatorVisible(false);
    setSelectedIcon(null);
    router.back();
  };

  const rows = [];
  for (let i = 0; i < iconNames.length; i += ICONS_PER_ROW) {
    rows.push(iconNames.slice(i, i + ICONS_PER_ROW));
  }

  return (
    <View style={styles.container}>
      <View style={styles.handleContainer}>
        <View style={[styles.handle, { backgroundColor: accentColor }]} />
      </View>

      <View style={styles.content}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(iconName => (
              <Pressable
                key={iconName}
                style={({ pressed }) => [
                  styles.iconBox,
                  selectedIcon === iconName &&
                    calculatorVisible && {
                      backgroundColor: accentColor + '20',
                      borderColor: accentColor,
                    },
                  pressed && styles.iconBoxPressed,
                ]}
                onPress={() => handleIconPress(iconName)}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: selectedIcon === iconName ? scaleAnim : 1 }],
                  }}
                >
                  <Image source={icons[iconName]} style={[styles.icon, { tintColor: accentColor }]} />
                </Animated.View>
                <Text style={[styles.iconLabel, { color: textColor }]}>{iconName}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      <CalculatorModal
        visible={calculatorVisible}
        onClose={() => {
          setCalculatorVisible(false);
          setSelectedIcon(null);
        }}
        onDone={handleCalculatorDone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: responsive(40),
    height: responsive(5),
    borderRadius: borderRadius.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsive(28),
  },
  iconBox: {
    width: '22%',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconBoxPressed: {
    backgroundColor: '#f0f0f0',
    transform: [{ scale: 0.95 }],
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginBottom: spacing.sm,
  },
  iconLabel: {
    ...typography.small,
    textAlign: 'center',
  },
});