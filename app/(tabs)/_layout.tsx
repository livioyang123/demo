// app/(tabs)/_layout.tsx
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useGradient } from '@/hooks/useGradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

export default function TabLayout() {
  const { accentColor } = useGradient();
  const router = useRouter();

  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="graph"
        options={{
          title: 'Graph',
          tabBarIcon: ({ color }) => <Foundation name="graph-bar" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="accounting"
        options={{
          href: '/accounting',
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <Pressable
              onPress={() => router.push('modal/' as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="add-circle-sharp" size={30} color={accentColor} />
            </Pressable>
          ),
        }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            router.push('/modal/in' as any);
          },
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Ionicons name="planet" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user-circle" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}