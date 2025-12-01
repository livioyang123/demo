// components/Budget.tsx
import { calculateTotalForInMonth_out } from '@/app/utils/registry';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, Vibration, View } from 'react-native';

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
      Vibration.vibrate(10);
      const key = budgetType === 'monthly' ? 'budget_monthly' : 'budget_yearly';
      const value = budgetType === 'monthly' ? monthlyBudget : yearlyBudget;
      await AsyncStorage.setItem(key, value);
      setIsEditing(false);
    } catch (e) {
      console.error('Errore salvataggio budget:', e);
    }
  };

  const resetBudget = () => {
    Vibration.vibrate(10);
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

  const handlePress = () => {
    Vibration.vibrate(10);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => { handlePress(); onClose(); }} style={styles.closeButton}>
              <AntDesign name="close" size={24} color="#007aff" />
            </Pressable>
            <Text style={styles.title}>Budget</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Type Selector */}
          <View style={styles.typeSelector}>
            <Pressable
              onPress={() => { handlePress(); setBudgetType('monthly'); }}
              style={[styles.typeButton, budgetType === 'monthly' && styles.activeTypeButton]}
            >
              <Text style={[styles.typeButtonText, budgetType === 'monthly' && styles.activeTypeText]}>
                Mensile
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { handlePress(); setBudgetType('yearly'); }}
              style={[styles.typeButton, budgetType === 'yearly' && styles.activeTypeButton]}
            >
              <Text style={[styles.typeButtonText, budgetType === 'yearly' && styles.activeTypeText]}>
                Annuale
              </Text>
            </Pressable>
          </View>

          {/* Budget Display/Edit */}
          <View style={styles.budgetSection}>
            <Text style={styles.label}>Budget {budgetType === 'monthly' ? 'Mensile' : 'Annuale'}</Text>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={budgetType === 'monthly' ? monthlyBudget : yearlyBudget}
                  onChangeText={budgetType === 'monthly' ? setMonthlyBudget : setYearlyBudget}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
                <Pressable onPress={saveBudget} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Salva</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => { handlePress(); setIsEditing(true); }} style={styles.budgetDisplay}>
                <Text style={styles.budgetValue}>€{currentBudget.toFixed(2)}</Text>
                <AntDesign name="edit" size={20} color="#007aff" />
              </Pressable>
            )}
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <View>
                <Text style={styles.progressLabel}>Speso</Text>
                <Text style={styles.spentValue}>€{currentSpent.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.progressLabel}>Rimanente</Text>
                <Text style={[styles.remainingValue, { color: remaining >= 0 ? '#4caf50' : '#f44336' }]}>
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
                    backgroundColor: percentage > 30 ? '#4caf50' : percentage > 10 ? '#ff9800' : '#f44336'
                  }
                ]} 
              />
            </View>
            <Text style={styles.percentageText}>{percentage.toFixed(1)}% disponibile</Text>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: '#e3f2fd' }]}>
              <Text style={styles.summaryLabel}>Media giornaliera disponibile</Text>
              <Text style={styles.summaryValue}>
                €{budgetType === 'monthly' 
                  ? (remaining / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).toFixed(2)
                  : (remaining / 365).toFixed(2)
                }
              </Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: '#fff3e0' }]}>
              <Text style={styles.summaryLabel}>% Budget utilizzato</Text>
              <Text style={styles.summaryValue}>
                {currentBudget > 0 ? ((currentSpent / currentBudget) * 100).toFixed(1) : 0}%
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable onPress={resetBudget} style={styles.resetButton}>
              <AntDesign name="delete" size={20} color="#f44336" />
              <Text style={styles.resetButtonText}>Azzera Budget</Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTypeButton: {
    backgroundColor: '#007aff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTypeText: {
    color: 'white',
  },
  budgetSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  budgetDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007aff',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  spentValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44336',
  },
  remainingValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    paddingHorizontal: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#f44336',
    fontWeight: '600',
  },
});