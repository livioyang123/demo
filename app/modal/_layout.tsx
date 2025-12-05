// app/modal/_layout.tsx
import { borderRadius, iconSizes, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ModalLayout() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const { accentColor, textColor } = useGradient();
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: currentRoute === 'in' ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [currentRoute]);

  const indicatorTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150], // Metà larghezza dello schermo approssimata
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.row}>
          {/* Back button */}
          <Pressable onPress={() => router.dismiss()} style={styles.backButton}>
            <Ionicons name="chevron-down" size={iconSizes.xl} color={accentColor} />
          </Pressable>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <Pressable
              onPress={() => router.replace('/modal/in')}
              style={styles.tab}
            >
              <Ionicons
                name={currentRoute === 'in' ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
                size={iconSizes.lg}
                color={currentRoute === 'in' ? accentColor : '#8e8e93'}
              />
              <Text
                style={[
                  styles.tabText,
                  currentRoute === 'in' && { color: accentColor, fontWeight: '600' },
                ]}
              >
                In
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace('/modal/out')}
              style={styles.tab}
            >
              <Ionicons
                name={currentRoute === 'out' ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
                size={iconSizes.lg}
                color={currentRoute === 'out' ? accentColor : '#8e8e93'}
              />
              <Text
                style={[
                  styles.tabText,
                  currentRoute === 'out' && { color: accentColor, fontWeight: '600' },
                ]}
              >
                Out
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: accentColor,
              transform: [{ translateX: indicatorTranslate }],
            },
          ]}
        />
      </View>

      {/* Content */}
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 35,
    paddingHorizontal: spacing.md,
    paddingBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tabText: {
    ...typography.caption,
    color: '#8e8e93',
  },
  activeIndicator: {
    height: 3,
    width: '50%',
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
});