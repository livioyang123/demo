// components/budget.tsx
import { feedback } from '@/app/utils/feedback';
import { calculateTotalForInMonth_out } from '@/app/utils/registry';
import { EXPENSE_COLOR } from '@/constants/colors';
import { borderRadius, responsive, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface BudgetProps {
  visible: boolean;
  onClose: () => void;
}

type BudgetType = 'monthly' | 'yearly';

export default function Budget({ visible, onClose }: BudgetProps) {
  const [budgetType, setBudgetType] = useState<BudgetType>('monthly');
  const [monthlyBudget, setMonthlyBudget] = useState('0');
  const [yearlyBudget, setYearlyBudget] = useState('0');
  const [currentSpent, setCurrentSpent] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const { accentColor, textColor } = useGradient();

  useEffect(() => {
    if (visible) {
      loadBudgets();
      loadCurrentSpent();
    }
  }, [visible, budgetType]);

  const loadBudgets = async () => {
    try {
      const monthly = await AsyncStorage.getItem('budget_monthly');
      const yearly = await AsyncStorage.getItem('budget_yearly');
      
      if (monthly) setMonthlyBudget(monthly);
      if (yearly) setYearlyBudget(yearly);
    } catch (e) {
      console.error('Errore caricamento budget:', e);
    }
  };

  const loadCurrentSpent = async () => {
    const now = new Date();
    const year = now.getFullYear();
    
    if (budgetType === 'monthly') {
      const month = now.getMonth() + 1;
      const spent = await calculateTotalForInMonth_out(`${year}-${month}`);
      setCurrentSpent(spent);
    } else {
      let totalSpent = 0;
      for (let month = 1; month <= 12; month++) {
        const spent = await calculateTotalForInMonth_out(`${year}-${month}`);
        totalSpent += spent;
      }
      setCurrentSpent(totalSpent);
    }
  };

  const saveBudget = async () => {
    try {
      feedback.triggerFeedback('success');
      const key = budgetType === 'monthly' ? 'budget_monthly' : 'budget_yearly';
      const value = budgetType === 'monthly' ? monthlyBudget : yearlyBudget;
      await AsyncStorage.setItem(key, value);
      setIsEditing(false);
    } catch (e) {
      console.error('Errore salvataggio budget:', e);
    }
  };

  const resetBudget = () => {
    feedback.triggerFeedback('warning');
    Alert.alert(
      'Conferma',
      'Vuoi azzerare il budget?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Azzera',
          style: 'destructive',
          onPress: async () => {
            if (budgetType === 'monthly') {
              setMonthlyBudget('0');
              await AsyncStorage.setItem('budget_monthly', '0');
            } else {
              setYearlyBudget('0');
              await AsyncStorage.setItem('budget_yearly', '0');
            }
          }
        }
      ]
    );
  };

  const currentBudget = parseFloat(budgetType === 'monthly' ? monthlyBudget : yearlyBudget);
  const remaining = currentBudget - currentSpent;
  const percentage = currentBudget > 0 ? (remaining / currentBudget) * 100 : 0;
  const progressWidth = Math.max(0, Math.min(100, percentage));

  const getProgressColor = () => {
    if (percentage > 30) return accentColor;
    if (percentage > 10) return '#FF9800';
    return EXPENSE_COLOR;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => { feedback.triggerFeedback('light'); onClose(); }} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={accentColor} />
            </Pressable>
            <Text style={[styles.title, { color: textColor }]}>Budget</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.typeSelector}>
            <Pressable
              onPress={() => { feedback.triggerFeedback('light'); setBudgetType('monthly'); }}
              style={[styles.typeButton, budgetType === 'monthly' && { backgroundColor: accentColor }]}
            >
              <Text style={[styles.typeButtonText, budgetType === 'monthly' && styles.activeTypeText]}>
                Mensile
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { feedback.triggerFeedback('light'); setBudgetType('yearly'); }}
              style={[styles.typeButton, budgetType === 'yearly' && { backgroundColor: accentColor }]}
            >
              <Text style={[styles.typeButtonText, budgetType === 'yearly' && styles.activeTypeText]}>
                Annuale
              </Text>
            </Pressable>
          </View>

          <View style={styles.budgetSection}>
            <Text style={styles.label}>Budget {budgetType === 'monthly' ? 'Mensile' : 'Annuale'}</Text>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.input, { borderColor: accentColor }]}
                  value={budgetType === 'monthly' ? monthlyBudget : yearlyBudget}
                  onChangeText={budgetType === 'monthly' ? setMonthlyBudget : setYearlyBudget}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
                <Pressable onPress={saveBudget} style={[styles.saveButton, { backgroundColor: accentColor }]}>
                  <Text style={styles.saveButtonText}>Salva</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => { feedback.triggerFeedback('light'); setIsEditing(true); }} style={styles.budgetDisplay}>
                <Text style={[styles.budgetValue, { color: accentColor }]}>€{currentBudget.toFixed(2)}</Text>
                <Ionicons name="create-outline" size={20} color={accentColor} />
              </Pressable>
            )}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <View>
                <Text style={styles.progressLabel}>Speso</Text>
                <Text style={[styles.spentValue, { color: EXPENSE_COLOR }]}>€{currentSpent.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.progressLabel}>Rimanente</Text>
                <Text style={[styles.remainingValue, { color: remaining >= 0 ? accentColor : EXPENSE_COLOR }]}>
                  €{remaining.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${progressWidth}%`,
                    backgroundColor: getProgressColor()
                  }
                ]} 
              />
            </View>
            <Text style={styles.percentageText}>{percentage.toFixed(1)}% disponibile</Text>
          </View>

          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: accentColor + '15' }]}>
              <Text style={styles.summaryLabel}>Media giornaliera disponibile</Text>
              <Text style={[styles.summaryValue, { color: accentColor }]}>
                €{budgetType === 'monthly' 
                  ? (remaining / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).toFixed(2)
                  : (remaining / 365).toFixed(2)
                }
              </Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: accentColor + '10' }]}>
              <Text style={styles.summaryLabel}>% Budget utilizzato</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>
                {currentBudget > 0 ? ((currentSpent / currentBudget) * 100).toFixed(1) : 0}%
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={resetBudget} style={styles.resetButton}>
              <Ionicons name="trash-outline" size={20} color={EXPENSE_COLOR} />
              <Text style={[styles.resetButtonText, { color: EXPENSE_COLOR }]}>Azzera Budget</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '75%',
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h4,
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    backgroundColor: '#f5f5f5',
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  typeButtonText: {
    ...typography.bodyBold,
    color: '#666',
  },
  activeTypeText: {
    color: 'white',
  },
  budgetSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: '#666',
    marginBottom: spacing.sm,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  saveButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  saveButtonText: {
    color: 'white',
    ...typography.bodyBold,
  },
  budgetDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  budgetValue: {
    ...typography.h3,
  },
  progressSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.small,
    color: '#666',
    marginBottom: spacing.xs / 2,
  },
  spentValue: {
    ...typography.h4,
  },
  remainingValue: {
    ...typography.h4,
  },
  progressBarContainer: {
    height: responsive(12),
    backgroundColor: '#e0e0e0',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  percentageText: {
    ...typography.small,
    color: '#666',
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  summaryLabel: {
    ...typography.small,
    color: '#666',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h4,
  },
  actions: {
    paddingHorizontal: spacing.lg,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: '#EF476F',
    borderRadius: borderRadius.sm,
  },
  resetButtonText: {
    ...typography.bodyBold,
  },
});