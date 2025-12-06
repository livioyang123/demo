// components/AddButton.tsx
import { feedback } from '@/app/utils/feedback';
import { responsive, shadows, spacing } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';


export default function AddButton() {
  const { accentColor } = useGradient();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    feedback.triggerFeedback('light');
    
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();

    router.push('/modal/in' as any);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.addButton,
          {
            backgroundColor: accentColor,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </Animated.View>
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
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    zIndex: 1000,
    borderColor:"white",
  },
});