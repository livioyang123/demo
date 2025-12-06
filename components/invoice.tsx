// components/invoice.tsx
import { feedback } from '@/app/utils/feedback';
import { calculateTotalForInMonth_in, calculateTotalForInMonth_out } from '@/app/utils/registry';
import { EXPENSE_COLOR, INCOME_COLOR } from '@/constants/colors';
import { borderRadius, responsive, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

  const { accentColor, textColor } = useGradient();

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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => { feedback.triggerFeedback('light'); onClose(); }} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={accentColor} />
            </Pressable>
            <Text style={[styles.title, { color: textColor }]}>Resoconto Annuale</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.yearSelector}>
            <Pressable 
              onPress={() => { feedback.triggerFeedback('light'); setShowYearPicker(!showYearPicker); }}
              style={[styles.yearButton, { backgroundColor: accentColor + '15' }]}
            >
              <Text style={[styles.yearText, { color: accentColor }]}>{selectedYear}</Text>
              <Ionicons name={showYearPicker ? "chevron-up" : "chevron-down"} size={16} color={accentColor} />
            </Pressable>
          </View>

          {showYearPicker && (
            <View style={styles.yearPicker}>
              <ScrollView style={styles.yearList}>
                {years.map(year => (
                  <Pressable
                    key={year}
                    onPress={() => {
                      feedback.triggerFeedback('light');
                      setSelectedYear(year);
                      setShowYearPicker(false);
                    }}
                    style={[
                      styles.yearItem, 
                      year === selectedYear && { backgroundColor: accentColor }
                    ]}
                  >
                    <Text style={[
                      styles.yearItemText, 
                      year === selectedYear && styles.selectedYearText
                    ]}>
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={[styles.summary, { backgroundColor: accentColor + '10' }]}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Totale In</Text>
              <Text style={[styles.summaryValue, { color: INCOME_COLOR }]}>
                €{totalIncome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Totale Out</Text>
              <Text style={[styles.summaryValue, { color: EXPENSE_COLOR }]}>
                €{totalOutcome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Bilancio</Text>
              <Text style={[styles.summaryValue, { color: totalIncome - totalOutcome >= 0 ? INCOME_COLOR : EXPENSE_COLOR }]}>
                €{(totalIncome - totalOutcome).toFixed(2)}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.tableContainer}>
            <View style={[styles.tableHeader, { backgroundColor: accentColor + '15' }]}>
              <Text style={[styles.tableHeaderText, { flex: 1, color: textColor }]}>Mese</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right', color: textColor }]}>In</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right', color: textColor }]}>Out</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right', color: textColor }]}>Totale</Text>
            </View>

            {monthsData.map((data, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{data.month}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', color: INCOME_COLOR }]}>
                  €{data.income.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', color: EXPENSE_COLOR }]}>
                  €{data.outcome.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontWeight: '600', color: data.total >= 0 ? INCOME_COLOR : EXPENSE_COLOR }]}>
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
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '85%',
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
  yearSelector: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  yearText: {
    ...typography.h4,
  },
  yearPicker: {
    backgroundColor: '#f9f9f9',
    maxHeight: responsive(150),
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  yearList: {
    padding: spacing.xs,
  },
  yearItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs / 2,
  },
  yearItemText: {
    ...typography.body,
    textAlign: 'center',
  },
  selectedYearText: {
    color: 'white',
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.small,
    color: '#666',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h4,
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  tableHeaderText: {
    ...typography.bodyBold,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    ...typography.caption,
    color: '#444',
  },
});