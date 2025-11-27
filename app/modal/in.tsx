// src/screens/InSection.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { add_in } from '@/app/services/registry';
import icons from '@/assets/icons/in/index';
import CalculatorModal from '@/components/CalculatorModal';

const iconNames = Object.keys(icons) as (keyof typeof icons)[];

const ICON_SIZE = 30;
const ICONS_PER_ROW = 4;

export default function InSection() {
  const router = useRouter();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [calculatorVisible, setCalculatorVisible] = useState(false);

  const handleIconPress = (iconName: string) => {
    setSelectedIcon(iconName);
    setCalculatorVisible(true);
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

    await add_in(count);
    
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
        <View style={styles.handle} />
      </View>

      <View style={styles.content}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((iconName) => (
              <TouchableOpacity
                key={iconName}
                style={[
                  styles.iconBox,
                  selectedIcon === iconName && calculatorVisible && styles.selectedIconBox
                ]}
                onPress={() => handleIconPress(iconName)}
              >
                <Image source={icons[iconName]} style={styles.icon} />
                <Text style={styles.iconLabel}>{iconName}</Text>
              </TouchableOpacity>
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
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  iconBox: {
    width: '22%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectedIconBox: {
    backgroundColor: '#e3f2fd',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: '#444',
  },
});