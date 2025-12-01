// app/(tabs)/discover.tsx
import { calculateTotalForInMonth_in, calculateTotalForInMonth_out } from '@/app/utils/registry';
import Budget from '@/components/budget';
import CurrencyConverter from '@/components/CurrencyConverter';
import Invoice from '@/components/invoice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';

interface CardData {
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
  title: string;
  value: string;
  subtitle: string;
  color: string;
  action?: () => void;
}

export default function DiscoverScreen() {
  const [monthIn, setMonthIn] = useState(0);
  const [monthOut, setMonthOut] = useState(0);
  const [budget, setBudget] = useState(0);
  const [budgetRemaining, setBudgetRemaining] = useState(0);
  const [activeModal, setActiveModal] = useState<'invoice' | 'budget' | 'currency' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${now.getMonth() + 1}`;
    
    const inValue = await calculateTotalForInMonth_in(dateString);
    const outValue = await calculateTotalForInMonth_out(dateString);
    
    const budgetStr = await AsyncStorage.getItem('budget_monthly');
    const budgetValue = budgetStr ? parseFloat(budgetStr) : 0;
    
    setMonthIn(inValue);
    setMonthOut(outValue);
    setBudget(budgetValue);
    setBudgetRemaining(budgetValue - outValue);
  };

  const handlePress = () => {
    Vibration.vibrate(10);
  };

  const openModal = (modal: 'invoice' | 'budget' | 'currency') => {
    handlePress();
    setActiveModal(modal);
  };

  const cards: CardData[] = [
    {
      icon: 'trending-up',
      iconFamily: 'Ionicons',
      title: 'Entrate Mese',
      value: `€${monthIn.toFixed(2)}`,
      subtitle: 'Totale entrate mensili',
      color: '#4caf50',
    },
    {
      icon: 'trending-down',
      iconFamily: 'Ionicons',
      title: 'Uscite Mese',
      value: `€${monthOut.toFixed(2)}`,
      subtitle: 'Totale uscite mensili',
      color: '#f44336',
    },
    {
      icon: 'stats-chart',
      iconFamily: 'Ionicons',
      title: 'Bilancio Mensile',
      value: `€${(monthIn - monthOut).toFixed(2)}`,
      subtitle: 'Differenza entrate/uscite',
      color: monthIn - monthOut >= 0 ? '#4caf50' : '#f44336',
      action: () => openModal('invoice'),
    },
    {
      icon: 'wallet',
      iconFamily: 'Ionicons',
      title: 'Budget Mensile',
      value: `€${budget.toFixed(2)}`,
      subtitle: `Rimanente: €${budgetRemaining.toFixed(2)}`,
      color: '#2196f3',
      action: () => openModal('budget'),
    },
  ];

  const tools = [
    {
      icon: 'receipt-outline',
      iconFamily: 'Ionicons' as const,
      title: 'Resoconto',
      subtitle: 'Visualizza invoice annuale',
      action: () => openModal('invoice'),
    },
    {
      icon: 'wallet-outline',
      iconFamily: 'Ionicons' as const,
      title: 'Budget',
      subtitle: 'Gestisci il tuo budget',
      action: () => openModal('budget'),
    },
    {
      icon: 'cash-multiple',
      iconFamily: 'MaterialCommunityIcons' as const,
      title: 'Conversione',
      subtitle: 'Converti valute',
      action: () => openModal('currency'),
    },
  ];

  return (
    <LinearGradient
      colors={['#d7d8b6ff', '#f2edadff', '#ffffffff']}
      locations={[0.1, 0.2, 0.9]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Scopri</Text>
        <Text style={styles.subtitle}>Panoramica delle tue finanze</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Cards Grid */}
        <View style={styles.cardsGrid}>
          {cards.map((card, index) => (
            <Pressable
              key={index}
              onPress={card.action ? () => { handlePress(); card.action!(); } : undefined}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
                !card.action && styles.cardDisabled,
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
                {card.iconFamily === 'Ionicons' ? (
                  <Ionicons name={card.icon as any} size={24} color={card.color} />
                ) : (
                  <MaterialCommunityIcons name={card.icon as any} size={24} color={card.color} />
                )}
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        {/* Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>Strumenti</Text>
          {tools.map((tool, index) => (
            <Pressable
              key={index}
              onPress={() => { handlePress(); tool.action(); }}
              style={({ pressed }) => [
                styles.toolCard,
                pressed && styles.toolCardPressed,
              ]}
            >
              <View style={styles.toolIcon}>
                {tool.iconFamily === 'Ionicons' ? (
                  <Ionicons name={tool.icon as any} size={28} color="#007aff" />
                ) : (
                  <MaterialCommunityIcons name={tool.icon as any} size={28} color="#007aff" />
                )}
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </Pressable>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiche Rapide</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{((monthIn / (monthIn + monthOut)) * 100 || 0).toFixed(0)}%</Text>
              <Text style={styles.statLabel}>% Entrate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{((monthOut / (monthIn + monthOut)) * 100 || 0).toFixed(0)}%</Text>
              <Text style={styles.statLabel}>% Uscite</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {budget > 0 ? ((budgetRemaining / budget) * 100).toFixed(0) : 0}%
              </Text>
              <Text style={styles.statLabel}>Budget Libero</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#070707ff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  card: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardDisabled: {
    opacity: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#999',
  },
  toolsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toolCardPressed: {
    opacity: 0.7,
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  toolSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  statsSection: {
    marginBottom: 25,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007aff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});