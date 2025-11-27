// components/TransactionsList.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import {
  add_in,
  add_out,
  delete_in_index,
  delete_out_index,
  modify_in_index,
  modify_out_index,
} from '@/app/services/registry';
import { loadArray } from '@/app/services/storage';
import iconsIn from '@/assets/icons/in/index';
import iconsOut from '@/assets/icons/out/index';

interface Transaction {
  type: string;
  description: string;
  date: Date;
  amount: number;
}

interface TransactionsListProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export default function TransactionsList({
  selectedMonth,
  selectedYear,
  onMonthChange,
}: TransactionsListProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState <(Transaction & { isIn: boolean; index: number })[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [iconModalVisible, setIconModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editField, setEditField] = useState<'type' | 'amount' | null>(null);
  const [editValue, setEditValue] = useState('');

  const loadTransactions = async () => {
    try {
      const registryIn = await loadArray('registry_in');
      const registryOut = await loadArray('registry_out');

      const targetYear = selectedYear;
      const targetMonth = selectedMonth;

      const filteredIn = registryIn
        .map((item: Transaction, index: number) => ({ ...item, isIn: true, index }))
        .filter((item: Transaction) => {
          const date = new Date(item.date);
          return date.getFullYear() === targetYear && date.getMonth() === targetMonth;
        });

      const filteredOut = registryOut
        .map((item: Transaction, index: number) => ({ ...item, isIn: false, index }))
        .filter((item: Transaction) => {
          const date = new Date(item.date);
          return date.getFullYear() === targetYear && date.getMonth() === targetMonth;
        });

      const combined = [...filteredIn, ...filteredOut].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setTransactions(combined);
    } catch (error) {
      console.error('Errore caricamento transazioni:', error);
    }
  };

  useEffect(() => {
    loadTransactions();
    const updateListener = () => {
      loadTransactions();
    }

    const listener = DeviceEventEmitter.addListener('registryChanged', updateListener);

    return () => {
      listener.remove();
    };
  }, [selectedMonth, selectedYear]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    // Scroll verso l'alto (mese successivo)
    if (contentOffset.y < -1) {
      let newMonth = selectedMonth + 1;
      let newYear = selectedYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      onMonthChange(newMonth, newYear);
    }
    
    // Scroll verso il basso (mese precedente)
    if (contentOffset.y + layoutMeasurement.height > contentSize.height + 50) {
      let newMonth = selectedMonth - 1;
      let newYear = selectedYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      onMonthChange(newMonth, newYear);
    }
  };

  const handleIconPress = (transaction: any) => {
    setEditingTransaction(transaction);
    setIconModalVisible(true);
  };

  const handleIconSelect = async (newIconName: string, newIsIn: boolean) => {
    if (!editingTransaction) return;

    const { isIn, index, type, description, date, amount } = editingTransaction;

    // Se cambia categoria (in->out o out->in)
    if (isIn !== newIsIn) {
      const newItem = {
        type: newIconName,
        description,
        date,
        amount,
      };

      if (newIsIn) {
        await add_in(newItem);
        await delete_out_index(index);
      } else {
        await add_out(newItem);
        await delete_in_index(index);
      }
    } else {
      // Stessa categoria, solo cambio icona
      const updatedItem = {
        type: newIconName,
        description,
        date,
        amount,
      };

      if (isIn) {
        await modify_in_index(index, updatedItem);
      } else {
        await modify_out_index(index, updatedItem);
      }
    }

    setIconModalVisible(false);
    setEditingTransaction(null);
    loadTransactions();
  };

  const handleFieldEdit = (transaction: any, field: 'type' | 'amount') => {
    setEditingTransaction(transaction);
    setEditField(field);
    setEditValue(field === 'amount' ? transaction.amount.toString() : transaction.type);
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!editingTransaction || !editField) return;

    const { isIn, index, type, description, date, amount } = editingTransaction;

    const updatedItem = {
      type: editField === 'type' ? editValue : type,
      description,
      date,
      amount: editField === 'amount' ? parseFloat(editValue) : amount,
    };

    if (isIn) {
      await modify_in_index(index, updatedItem);
    } else {
      await modify_out_index(index, updatedItem);
    }

    setEditModalVisible(false);
    setEditingTransaction(null);
    setEditField(null);
    loadTransactions();
  };

  const getIcon = (type: string, isIn: boolean) => {
    const icons = isIn ? iconsIn : iconsOut;
    return icons[type as keyof typeof icons] || null;
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {transactions.map((transaction, idx) => {
          const icon = getIcon(transaction.type, transaction.isIn);
          const sign = transaction.isIn ? '+' : '-';
          const color = transaction.isIn ? '#34C759' : '#FF3B30';

          return (
            <View key={idx} style={styles.transactionRow}>
              <View style={styles.leftSection}>
                <Pressable onPress={() => handleIconPress(transaction)}>
                  {icon && <Image source={icon} style={styles.icon} />}
                </Pressable>
                <Pressable onPress={() => handleFieldEdit(transaction, 'type')}>
                  <Text style={styles.typeText}>{transaction.type}</Text>
                </Pressable>
              </View>

              <Pressable onPress={() => handleFieldEdit(transaction, 'amount')}>
                <Text style={[styles.amountText, { color }]}>
                  {sign} {transaction.amount.toFixed(2)}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Modal per cambio icona */}
      <Modal
        visible={iconModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIconModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIconModalVisible(false)}>
          <View style={styles.iconModalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>

            <Text style={styles.sectionTitle}>In</Text>
            <View style={styles.iconGrid}>
              {Object.keys(iconsIn).map((iconName) => (
                <Pressable
                  key={iconName}
                  style={styles.iconOption}
                  onPress={() => handleIconSelect(iconName, true)}
                >
                  <Image
                    source={iconsIn[iconName as keyof typeof iconsIn]}
                    style={styles.iconSmall}
                  />
                  <Text style={styles.iconLabel}>{iconName}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Out</Text>
            <View style={styles.iconGrid}>
              {Object.keys(iconsOut).map((iconName) => (
                <Pressable
                  key={iconName}
                  style={styles.iconOption}
                  onPress={() => handleIconSelect(iconName, false)}
                >
                  <Image
                    source={iconsOut[iconName as keyof typeof iconsOut]}
                    style={styles.iconSmall}
                  />
                  <Text style={styles.iconLabel}>{iconName}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Modal per edit type/amount */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
          <View style={styles.editModalContent}>
            <Text style={styles.modalTitle}>
              Edit {editField === 'type' ? 'Type' : 'Amount'}
            </Text>
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType={editField === 'amount' ? 'numeric' : 'default'}
            />
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleEditSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    height: 30,
    maxHeight: 600,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderRadius: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  typeText: {
    fontSize: 16,
    color: '#262626ff',
    fontWeight: '500',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  iconOption: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconSmall: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});