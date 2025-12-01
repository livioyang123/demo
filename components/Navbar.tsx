// components/Navbar.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Vibration, View } from 'react-native';
import Budget from './budget';
import CurrencyConverter from './CurrencyConverter';
import Invoice from './invoice';

interface NavbarTool {
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  component: 'invoice' | 'budget' | 'currency';
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
}

const tools: NavbarTool[] = [
  { icon: 'receipt-outline', component: 'invoice', iconFamily: 'Ionicons' },
  { icon: 'wallet-outline', component: 'budget', iconFamily: 'Ionicons' },
  { icon: 'cash-multiple', component: 'currency', iconFamily: 'MaterialCommunityIcons' },
];

export default function Navbar() {
  const [activeModal, setActiveModal] = useState<'invoice' | 'budget' | 'currency' | null>(null);

  const handlePress = (component: 'invoice' | 'budget' | 'currency') => {
    Vibration.vibrate(10);
    setActiveModal(component);
  };

  const renderIcon = (tool: NavbarTool) => {
    if (tool.iconFamily === 'Ionicons') {
      return (
        <Ionicons 
          name={tool.icon as keyof typeof Ionicons.glyphMap} 
          size={24} 
          color="#007aff" 
        />
      );
    } else {
      return (
        <MaterialCommunityIcons 
          name={tool.icon as keyof typeof MaterialCommunityIcons.glyphMap} 
          size={24} 
          color="#007aff" 
        />
      );
    }
  };

  return (
    <>
      <View style={styles.container}>
        {tools.map((tool, index) => (
          <Pressable
            key={index}
            onPress={() => handlePress(tool.component)}
            style={({ pressed }) => [
              styles.toolButton,
              pressed && styles.toolButtonPressed
            ]}
          >
            {renderIcon(tool)}
          </Pressable>
        ))}
      </View>

      <Invoice 
        visible={activeModal === 'invoice'} 
        onClose={() => setActiveModal(null)} 
      />
      <Budget 
        visible={activeModal === 'budget'} 
        onClose={() => setActiveModal(null)} 
      />
      <CurrencyConverter 
        visible={activeModal === 'currency'} 
        onClose={() => setActiveModal(null)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  toolButtonPressed: {
    backgroundColor: '#e0e0e0',
  },
});