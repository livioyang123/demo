// app/modal/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ModalLayout() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1]; // 'in' o 'second'

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.row}>
        {/* Back button – chiude il modal correttamente */}
        <Pressable onPress={() => router.dismiss()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={28} color="#007aff" />
        </Pressable>

        {/* I tuoi tab di paginazione */}
        <View style={styles.tabsContainer}>
          <Pressable
            onPress={() => router.replace('/modal/in')}
            style={[styles.tab, currentRoute === ('in') && styles.activeTab]}
          >
            <Ionicons
              name={currentRoute === 'in' ? "document-text" : "document-text-outline"}
              size={24}
              color={currentRoute === 'in' ? '#007aff' : '#8e8e93'}
            />
            <Text style={[styles.tabText, currentRoute === ('in') && styles.activeText]}>
              In
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace('/modal/out')}
            style={[styles.tab, currentRoute === 'out' && styles.activeTab]}
          >
            <Ionicons
              name={currentRoute === 'out' ? "list" : "list-outline"}
              size={24}
              color={currentRoute === 'out' ? '#007aff' : '#8e8e93'}
            />
            <Text style={[styles.tabText, currentRoute === 'out' && styles.activeText]}>
              Out
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER SEMPRE VISIBILE */}
      <Header />

      {/* Contenuto della pagina corrente (in.tsx o second.tsx) */}
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
    paddingTop: 35,     // safe area
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007aff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    color: '#8e8e93',
  },
  activeText: {
    color: '#007aff',
  },
});