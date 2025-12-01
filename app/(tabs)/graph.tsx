// app/(tabs)/graph.tsx
import { loadArray } from '@/app/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';

type Period = 'week' | 'month' | 'year';
type DataType = 'in' | 'out';

interface Transaction {
  type: string;
  amount: number;
  date: Date;
}

export default function GraphScreen() {
  const [period, setPeriod] = useState<Period>('month');
  const [dataType, setDataType] = useState<DataType>('out');
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [topTypes, setTopTypes] = useState<{ type: string; amount: number; percentage: number }[]>([]);
  const [average, setAverage] = useState(0);

  useEffect(() => {
    loadData();
  }, [period, dataType]);

  const loadData = async () => {
    const registry = dataType === 'in' ? 'registry_in' : 'registry_out';
    const data: Transaction[] = await loadArray(registry);
    
    const now = new Date();
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      } else if (period === 'month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else {
        return itemDate.getFullYear() === now.getFullYear();
      }
    });

    // Calcola dati per il grafico
    const groupedData = groupDataByPeriod(filteredData, period);
    setChartData(groupedData);

    // Calcola media
    const total = filteredData.reduce((sum, item) => sum + item.amount, 0);
    const avg = groupedData.length > 0 ? total / groupedData.length : 0;
    setAverage(avg);

    // Calcola top 5
    const typeGroups: { [key: string]: number } = {};
    filteredData.forEach(item => {
      typeGroups[item.type] = (typeGroups[item.type] || 0) + item.amount;
    });

    const sortedTypes = Object.entries(typeGroups)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, amount]) => ({
        type,
        amount,
        percentage: (amount / total) * 100
      }));

    setTopTypes(sortedTypes);
  };

  const groupDataByPeriod = (data: Transaction[], period: Period) => {
    const grouped: { [key: string]: number } = {};

    data.forEach(item => {
      const date = new Date(item.date);
      let key = '';

      if (period === 'week') {
        const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        key = days[date.getDay()];
      } else if (period === 'month') {
        key = date.getDate().toString();
      } else {
        const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        key = months[date.getMonth()];
      }

      grouped[key] = (grouped[key] || 0) + item.amount;
    });

    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  };

  const handlePress = () => {
    Vibration.vibrate(10);
  };

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;
  const barWidth = Math.max(20, (chartWidth - chartData.length * 10) / chartData.length);

  return (
    <LinearGradient
      colors={['#d7d8b6ff', '#f2edadff', '#ffffffff']}
      locations={[0.1, 0.2, 0.9]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Grafici</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => { handlePress(); setPeriod(p); }}
              style={[styles.periodButton, period === p && styles.activePeriodButton]}
            >
              <Text style={[styles.periodText, period === p && styles.activePeriodText]}>
                {p === 'week' ? 'Settimana' : p === 'month' ? 'Mese' : 'Anno'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Data Type Selector */}
        <View style={styles.typeSelector}>
          <Pressable
            onPress={() => { handlePress(); setDataType('in'); }}
            style={[styles.typeButton, dataType === 'in' && styles.activeTypeButton]}
          >
            <Text style={[styles.typeText, dataType === 'in' && styles.activeTypeText]}>In</Text>
          </Pressable>
          <Pressable
            onPress={() => { handlePress(); setDataType('out'); }}
            style={[styles.typeButton, dataType === 'out' && styles.activeTypeButton]}
          >
            <Text style={[styles.typeText, dataType === 'out' && styles.activeTypeText]}>Out</Text>
          </Pressable>
        </View>

        {/* Average Card */}
        <View style={styles.averageCard}>
          <Ionicons name="stats-chart" size={24} color="#007aff" />
          <View>
            <Text style={styles.averageLabel}>Media per {period === 'week' ? 'giorno' : period === 'month' ? 'giorno' : 'mese'}</Text>
            <Text style={styles.averageValue}>€{average.toFixed(2)}</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Andamento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chart}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: (item.value / maxValue) * 150,
                          width: barWidth,
                          backgroundColor: dataType === 'in' ? '#4caf50' : '#f44336'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                  <Text style={styles.barValue}>€{item.value.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Top 5 */}
        <View style={styles.topContainer}>
          <Text style={styles.sectionTitle}>Top 5 Categorie</Text>
          {topTypes.map((item, index) => (
            <View key={index} style={styles.topItem}>
              <View style={styles.topRank}>
                <Text style={styles.topRankText}>{index + 1}</Text>
              </View>
              <View style={styles.topInfo}>
                <Text style={styles.topType}>{item.type}</Text>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${item.percentage}%`,
                        backgroundColor: dataType === 'in' ? '#4caf50' : '#f44336'
                      }
                    ]} 
                  />
                </View>
              </View>
              <View style={styles.topAmount}>
                <Text style={styles.topAmountText}>€{item.amount.toFixed(2)}</Text>
                <Text style={styles.topPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#070707ff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activePeriodButton: {
    backgroundColor: '#007aff',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activePeriodText: {
    color: 'white',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  activeTypeButton: {
    backgroundColor: '#007aff',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTypeText: {
    color: 'white',
  },
  averageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  averageLabel: {
    fontSize: 12,
    color: '#666',
  },
  averageValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007aff',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingVertical: 10,
  },
  barContainer: {
    alignItems: 'center',
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  barValue: {
    fontSize: 10,
    color: '#999',
  },
  topContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  topRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007aff',
  },
  topInfo: {
    flex: 1,
  },
  topType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  topAmount: {
    alignItems: 'flex-end',
  },
  topAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  topPercentage: {
    fontSize: 12,
    color: '#666',
  },
});