// components/Navbar-refactored.tsx
import { iconSizes } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Budget from './budget';
import CurrencyConverter from './CurrencyConverter';
import Invoice from './invoice';
import UnifiedButton from './ui/UnifiedButton';

interface NavbarTool {
  icon: string;
  component: 'invoice' | 'budget' | 'currency';
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
  label: string;
}

const tools: NavbarTool[] = [
  { 
    icon: 'receipt-outline', 
    component: 'invoice', 
    iconFamily: 'Ionicons',
    label: 'Resoconto'
  },
  { 
    icon: 'wallet-outline', 
    component: 'budget', 
    iconFamily: 'Ionicons',
    label: 'Budget'
  },
  { 
    icon: 'cash-multiple', 
    component: 'currency', 
    iconFamily: 'MaterialCommunityIcons',
    label: 'Conversione'
  },
];

export default function Navbar() {
  const [activeModal, setActiveModal] = useState<'invoice' | 'budget' | 'currency' | null>(null);
  const { accentColor } = useGradient();

  return (
    <>
      <View style={styles.container}>
        {tools.map((tool, index) => (
          <UnifiedButton
            key={index}
            icon={tool.icon as any}
            iconFamily={tool.iconFamily}
            iconColor={accentColor}
            iconSize={iconSizes.lg}
            variant="ghost"
            onPress={() => setActiveModal(tool.component)}
            feedbackType="light"
          />
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
    height: 55,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 5,
    transform: [{ translateY: -10 }],
  },
});