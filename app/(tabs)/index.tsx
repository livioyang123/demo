// app/(tabs)/index.tsx
import { feedback } from '@/app/utils/feedback';
import { calculateTotalForInMonth_in, calculateTotalForInMonth_out } from '@/app/utils/registry';
import AddButton from '@/components/AddButton';
import DatePickerModal from '@/components/DatePickerModal';
import Navbar from '@/components/Navbar';
import TransactionsList from '@/components/TransactionalList';
import UnifiedCard from '@/components/ui/UnifiedCard';
import VoiceInputButton from '@/components/voiceInputButton';
import { borderRadius, responsive, spacing, typography } from '@/constants/design-system';
import { months } from '@/constants/months';
import { useGradient } from '@/hooks/useGradient';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { DeviceEventEmitter, Pressable, StyleSheet, Text, View } from 'react-native';

// Colori più morbidi per in/out
const INCOME_COLOR = '#52B788'; // Verde più morbido
const EXPENSE_COLOR = '#EF476F'; // Rosso più morbido

export default function HomeScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPicker, setShowPicker] = useState(false);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  const { colors, accentColor, textColor } = useGradient();
  const router = useRouter();

  const formatNumber = (num: number, type: 'int' | 'float' = 'int') => {
    const values = num.toString().split('.');
    if (type === 'int') {
      return values[0];
    }
    return values.length > 1 ? values[1].padEnd(2, '0') : '00';
  };

  const formatDate = (mode = 'full') => {
    const month = months[selectedMonth];
    const year = selectedYear;

    if (mode === 'month') return month;
    if (mode === 'year') return year;

    return `${month} ${year}`;
  };

  const handleDone = () => {
    feedback.triggerFeedback('light');
    setShowPicker(false);
  };

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleDatePress = () => {
    feedback.triggerFeedback('light');
    setShowPicker(true);
  };

  useEffect(() => {
    async function fetchTotals() {
      try {
        const inValue = await calculateTotalForInMonth_in(
          selectedYear + '-' + (selectedMonth + 1)
        );
        const outValue = await calculateTotalForInMonth_out(
          selectedYear + '-' + (selectedMonth + 1)
        );

        setTotalIn(inValue);
        setTotalOut(outValue);
      } catch (e) {
        console.error('Errore nel calcolo dei totali:', e);
      }
    }

    fetchTotals();

    const updateListener = () => {
      fetchTotals();
    };

    const listener = DeviceEventEmitter.addListener('registryChanged', updateListener);

    return () => {
      listener.remove();
    };
  }, [selectedMonth, selectedYear]);

  return (
    <LinearGradient
      colors={[colors[0], colors[1], colors[2]]}
      locations={[0.1, 0.2, 0.9]}
      style={styles.mainContainer}
    >
      <View style={styles.appName}>
        <Text style={[styles.logoText, { color: accentColor }]}>L</Text>
      </View>

      <View style={styles.header}>
        <View style={styles.overView}>
          <View style={styles.dataSelector}>
            <Text style={[styles.selectedYear, { color: textColor }]}>{selectedYear}</Text>

            <Pressable style={styles.dateButton} onPress={handleDatePress}>
              <View style={styles.dateRow}>
                <Text style={[styles.dateText, { color: textColor }]}>
                  {formatDate('month')}
                </Text>
                <AntDesign name="caret-down" size={responsive(12)} color={textColor} />
              </View>
            </Pressable>
          </View>

          <View style={styles.info}>
            <UnifiedCard style={styles.infoCard} padding="sm">
              <Text style={styles.infoLabel}>In</Text>
              <View style={styles.amountRow}>
                <Text style={[styles.amountInteger, { color: INCOME_COLOR }]}>
                  {formatNumber(totalIn)}
                </Text>
                <Text style={[styles.amountDecimal, { color: INCOME_COLOR }]}>
                  .{formatNumber(totalIn, 'float')}
                </Text>
              </View>
            </UnifiedCard>

            <UnifiedCard style={styles.infoCard} padding="sm">
              <Text style={styles.infoLabel}>Out</Text>
              <View style={styles.amountRow}>
                <Text style={[styles.amountInteger, { color: EXPENSE_COLOR }]}>
                  {formatNumber(totalOut)}
                </Text>
                <Text style={[styles.amountDecimal, { color: EXPENSE_COLOR }]}>
                  .{formatNumber(totalOut, 'float')}
                </Text>
                
              </View>
            </UnifiedCard>
          </View>
        </View>

        <UnifiedCard style={styles.navbar} elevation="lg">
          <Navbar />
  
        </UnifiedCard>
      </View>

      <UnifiedCard style={styles.body} elevation="lg" padding="none">
        <TransactionsList
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
        />
      </UnifiedCard>

      <AddButton />
      <VoiceInputButton />

      <DatePickerModal
        visible={showPicker}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        months={months}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onClose={() => setShowPicker(false)}
        onDone={handleDone}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  appName: {
    width: responsive(200),
    height: responsive(50),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '4%',
    alignSelf: 'center',
  },
  logoText: {
    ...typography.h1,
    fontFamily: 'sans-serif-condensed',
  },
  header: {
    width: '96%',
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
  },
  overView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
  },
  dataSelector: {
    marginLeft: spacing.sm,
    position: 'absolute',
    left: 0,
  },
  selectedYear: {
    ...typography.body,
  },
  dateButton: {
    marginTop: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...typography.h4,
  },
  info: {
    position: 'absolute',
    right: 0,
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  infoCard: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  infoLabel: {
    ...typography.body,
    color: '#070707',
    marginBottom: spacing.xs,
  },
  amountRow: {
    paddingLeft: spacing.xs,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountInteger: {
    ...typography.h3,
    fontWeight: '700',
  },
  amountDecimal: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: responsive(2),
  },
  navbar: {
    width: '100%',
    height: responsive(60),
    marginTop: responsive(85),
    paddingBottom: responsive(30),
  },
  body: {
    width: '96%',
    position: 'absolute',
    top: responsive(230),
    alignSelf: 'center',
    bottom: responsive(20),
    borderRadius: borderRadius.xl,
  },
});