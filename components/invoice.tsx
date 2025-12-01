// components/Invoice.tsx
import { calculateTotalForInMonth_in, calculateTotalForInMonth_out } from '@/app/services/registry';
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';

interface InvoiceProps {
  visible: boolean;
  onClose: () => void;
  initialYear?: number;
}

interface MonthData {
  month: string;
  monthNum: number;
  income: number;
  outcome: number;
  total: number;
}

const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

export default function Invoice({ visible, onClose, initialYear = new Date().getFullYear() }: InvoiceProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalOutcome, setTotalOutcome] = useState(0);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  useEffect(() => {
    if (visible) {
      loadYearData();
    }
  }, [visible, selectedYear]);

  const loadYearData = async () => {
    const data: MonthData[] = [];
    let yearIncome = 0;
    let yearOutcome = 0;

    for (let month = 0; month < 12; month++) {
      const dateString = `${selectedYear}-${month + 1}`;
      const income = await calculateTotalForInMonth_in(dateString);
      const outcome = await calculateTotalForInMonth_out(dateString);
      
      data.push({
        month: monthNames[month],
        monthNum: month,
        income,
        outcome,
        total: income - outcome
      });

      yearIncome += income;
      yearOutcome += outcome;
    }

    setMonthsData(data);
    setTotalIncome(yearIncome);
    setTotalOutcome(yearOutcome);
  };

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
            <Text style={styles.title}>Resoconto Annuale</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Year Selector */}
          <View style={styles.yearSelector}>
            <Pressable 
              onPress={() => { handlePress(); setShowYearPicker(!showYearPicker); }}
              style={styles.yearButton}
            >
              <Text style={styles.yearText}>{selectedYear}</Text>
              <AntDesign name={showYearPicker ? "caret-up" : "caret-down"} size={16} color="#007aff" />
            </Pressable>
          </View>

          {showYearPicker && (
            <View style={styles.yearPicker}>
              <ScrollView style={styles.yearList}>
                {years.map(year => (
                  <Pressable
                    key={year}
                    onPress={() => {
                      handlePress();
                      setSelectedYear(year);
                      setShowYearPicker(false);
                    }}
                    style={[styles.yearItem, year === selectedYear && styles.selectedYearItem]}
                  >
                    <Text style={[styles.yearItemText, year === selectedYear && styles.selectedYearText]}>
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Total Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Totale In</Text>
              <Text style={[styles.summaryValue, { color: '#4caf50' }]}>
                €{totalIncome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Totale Out</Text>
              <Text style={[styles.summaryValue, { color: '#f44336' }]}>
                €{totalOutcome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Bilancio</Text>
              <Text style={[styles.summaryValue, { color: totalIncome - totalOutcome >= 0 ? '#4caf50' : '#f44336' }]}>
                €{(totalIncome - totalOutcome).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Table */}
          <ScrollView style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Mese</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>In</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Out</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Totale</Text>
            </View>

            {monthsData.map((data, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{data.month}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', color: '#4caf50' }]}>
                  €{data.income.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', color: '#f44336' }]}>
                  €{data.outcome.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontWeight: '600', color: data.total >= 0 ? '#4caf50' : '#f44336' }]}>
                  €{data.total.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
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
    height: '85%',
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
  yearSelector: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  yearText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007aff',
  },
  yearPicker: {
    backgroundColor: '#f9f9f9',
    maxHeight: 150,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  yearList: {
    padding: 5,
  },
  yearItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  selectedYearItem: {
    backgroundColor: '#007aff',
  },
  yearItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedYearText: {
    color: 'white',
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 10,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 5,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    fontSize: 14,
    color: '#444',
  },
});