// components/AddButton.tsx
import { feedback } from '@/app/utils/feedback';
import { add_in, add_out } from '@/app/utils/registry';
import TransactionConfirmModal from '@/components/TransactionConfirmModal';
import { responsive, shadows, spacing } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

export default function AddButton() {
  const { accentColor } = useGradient();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isFocused, setIsFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handlePressIn = () => {
    setIsFocused(true);
    feedback.triggerFeedback('light');
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    setShowModal(true);
  };

  const handleConfirm = async (
    amount: number,
    type: string,
    description: string,
    isIn: boolean
  ) => {
    const transaction = {
      type,
      description,
      date: new Date(),
      amount,
    };

    if (isIn) {
      await add_in(transaction);
    } else {
      await add_out(transaction);
    }

    feedback.triggerFeedback('success');
    setShowModal(false);
  };

  return (
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={[
            styles.addButton,
            {
              backgroundColor: isFocused ? 'white' : accentColor,
              borderColor: isFocused ? accentColor : 'white',
            },
          ]}
        >
          <Ionicons 
            name="add" 
            size={28} 
            color={isFocused ? accentColor : 'white'} 
          />
        </Pressable>
      </Animated.View>

      <TransactionConfirmModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    top: responsive(550),
    right: spacing.lg,
    width: responsive(60),
    height: responsive(60),
    borderRadius: responsive(30),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    zIndex: 1000,
  },
});