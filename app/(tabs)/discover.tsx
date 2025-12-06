// app/(tabs)/discover.tsx
import { calculateTotalForInMonth_in, calculateTotalForInMonth_out } from '@/app/utils/registry';
import Budget from '@/components/budget';
import CurrencyConverter from '@/components/CurrencyConverter';
import Invoice from '@/components/invoice';
import UnifiedCard from '@/components/ui/UnifiedCard';
import { EXPENSE_COLOR, INCOME_COLOR } from '@/constants/colors';
import { iconSizes, responsive, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface StatCard {
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
  
  const { colors, accentColor, textColor } = useGradient();

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

  const cards: StatCard[] = [
    {
      icon: 'trending-up',
      iconFamily: 'Ionicons',
      title: 'Entrate Mese',
      value: `€${monthIn.toFixed(2)}`,
      subtitle: 'Totale entrate mensili',
      color: INCOME_COLOR,
    },
    {
      icon: 'trending-down',
      iconFamily: 'Ionicons',
      title: 'Uscite Mese',
      value: `€${monthOut.toFixed(2)}`,
      subtitle: 'Totale uscite mensili',
      color: EXPENSE_COLOR,
    },
    {
      icon: 'stats-chart',
      iconFamily: 'Ionicons',
      title: 'Bilancio Mensile',
      value: `€${(monthIn - monthOut).toFixed(2)}`,
      subtitle: 'Differenza entrate/uscite',
      color: monthIn - monthOut >= 0 ? INCOME_COLOR : EXPENSE_COLOR,
      action: () => setActiveModal('invoice'),
    },
    {
      icon: 'wallet',
      iconFamily: 'Ionicons',
      title: 'Budget Mensile',
      value: `€${budget.toFixed(2)}`,
      subtitle: `Rimanente: €${budgetRemaining.toFixed(2)}`,
      color: accentColor,
      action: () => setActiveModal('budget'),
    },
  ];

  const tools = [
    {
      icon: 'receipt-outline',
      iconFamily: 'Ionicons' as const,
      title: 'Resoconto',
      subtitle: 'Visualizza invoice annuale',
      action: () => setActiveModal('invoice'),
    },
    {
      icon: 'wallet-outline',
      iconFamily: 'Ionicons' as const,
      title: 'Budget',
      subtitle: 'Gestisci il tuo budget',
      action: () => setActiveModal('budget'),
    },
    {
      icon: 'cash-multiple',
      iconFamily: 'MaterialCommunityIcons' as const,
      title: 'Conversione',
      subtitle: 'Converti valute',
      action: () => setActiveModal('currency'),
    },
  ];

  return (
    <LinearGradient
      colors={[colors[0], colors[1], colors[2]]}
      locations={[0.1, 0.2, 0.9]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Scopri</Text>
        <Text style={styles.subtitle}>Panoramica delle tue finanze</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsGrid}>
          {cards.map((card, index) => (
            <UnifiedCard
              key={index}
              onPress={card.action}
              style={styles.card}
            >
              <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
                {card.iconFamily === 'Ionicons' ? (
                  <Ionicons name={card.icon as any} size={iconSizes.lg} color={card.color} />
                ) : (
                  <MaterialCommunityIcons name={card.icon as any} size={iconSizes.lg} color={card.color} />
                )}
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </UnifiedCard>
          ))}
        </View>

        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>Strumenti</Text>
          {tools.map((tool, index) => (
            <UnifiedCard
              key={index}
              onPress={tool.action}
              style={styles.toolCard}
            >
              <View style={[styles.toolIcon, { backgroundColor: accentColor + '20' }]}>
                {tool.iconFamily === 'Ionicons' ? (
                  <Ionicons name={tool.icon as any} size={iconSizes.lg} color={accentColor} />
                ) : (
                  <MaterialCommunityIcons name={tool.icon as any} size={iconSizes.lg} color={accentColor} />
                )}
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={iconSizes.md} color="#ccc" />
            </UnifiedCard>
          ))}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiche Rapide</Text>
          <View style={styles.statsGrid}>
            <UnifiedCard style={styles.statItem} padding="md">
              <Text style={[styles.statValue, { color: accentColor }]}>
                {((monthIn / (monthIn + monthOut)) * 100 || 0).toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>% Entrate</Text>
            </UnifiedCard>
            <UnifiedCard style={styles.statItem} padding="md">
              <Text style={[styles.statValue, { color: accentColor }]}>
                {((monthOut / (monthIn + monthOut)) * 100 || 0).toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>% Uscite</Text>
            </UnifiedCard>
            <UnifiedCard style={styles.statItem} padding="md">
              <Text style={[styles.statValue, { color: accentColor }]}>
                {budget > 0 ? ((budgetRemaining / budget) * 100).toFixed(0) : 0}%
              </Text>
              <Text style={styles.statLabel}>Budget Libero</Text>
            </UnifiedCard>
          </View>
        </View>
      </ScrollView>

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
    paddingTop: responsive(60),
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  card: {
    width: '48%',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: responsive(50),
    height: responsive(50),
    borderRadius: responsive(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.small,
    color: '#666',
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.small,
    color: '#999',
  },
  toolsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
    color: '#333',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toolIcon: {
    width: responsive(50),
    height: responsive(50),
    borderRadius: responsive(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    ...typography.bodyBold,
    color: '#333',
    marginBottom: spacing.xs / 2,
  },
  toolSubtitle: {
    ...typography.caption,
    color: '#666',
  },
  statsSection: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.small,
    color: '#666',
    textAlign: 'center',
  },
});