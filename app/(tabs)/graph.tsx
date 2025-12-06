// app/(tabs)/graph.tsx
import { loadArray } from '@/app/utils/storage';
import UnifiedCard from '@/components/ui/UnifiedCard';
import UnifiedSelector from '@/components/ui/UnifiedSelector';
import { EXPENSE_COLOR, INCOME_COLOR } from '@/constants/colors';
import { borderRadius, iconSizes, responsive, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

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
  
  const { colors, accentColor, textColor } = useGradient();

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

    const groupedData = groupDataByPeriod(filteredData, period);
    setChartData(groupedData);

    const total = filteredData.reduce((sum, item) => sum + item.amount, 0);
    const avg = groupedData.length > 0 ? total / groupedData.length : 0;
    setAverage(avg);

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

  const periodOptions = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  const dataTypeOptions = [
    { label: 'In', value: 'in' },
    { label: 'Out', value: 'out' },
  ];

  const LineChart = () => {
    if (chartData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={[styles.emptyText, { color: textColor }]}>Nessun dato disponibile</Text>
        </View>
      );
    }

    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    const minValue = Math.min(...chartData.map(d => d.value), 0);
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - responsive(80);
    const chartHeight = responsive(200);
    const padding = responsive(40);

    const xStep = (chartWidth - padding * 2) / (chartData.length - 1 || 1);
    const yScale = (chartHeight - padding * 2) / (maxValue - minValue || 1);

    const points = chartData.map((item, index) => ({
      x: padding + index * xStep,
      y: chartHeight - padding - (item.value - minValue) * yScale,
      value: item.value,
      label: item.label
    }));

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    const lineColor = dataType === 'in' ? INCOME_COLOR : EXPENSE_COLOR;
    const fillColor = dataType === 'in' ? INCOME_COLOR + '20' : EXPENSE_COLOR + '20';
 
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartWrapper}>
          <Svg width={Math.max(chartWidth, points.length * 60)} height={chartHeight}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
              const value = minValue + ratio * (maxValue - minValue);
              return (
                <React.Fragment key={i}>
                  <Line
                    x1={padding}
                    y1={y}
                    x2={Math.max(chartWidth, points.length * 60) - padding}
                    y2={y}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <SvgText
                    x={padding - 10}
                    y={y + 5}
                    fontSize="10"
                    fill="#999"
                    textAnchor="end"
                  >
                    {value.toFixed(0)}
                  </SvgText>
                </React.Fragment>
              );
            })}

            <Path d={areaPath} fill={fillColor} />
            <Path
              d={pathData}
              stroke={lineColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((point, index) => (
              <React.Fragment key={index}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="white"
                  stroke={lineColor}
                  strokeWidth="3"
                />
                <SvgText
                  x={point.x}
                  y={chartHeight - padding + 20}
                  fontSize="12"
                  fill="#666"
                  textAnchor="middle"
                >
                  {point.label}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={[colors[0], colors[1],colors[2]]}
      locations={[0.1, 0.2, 0.9]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Grafici</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <UnifiedSelector
          options={periodOptions}
          selected={period}
          onSelect={(value) => setPeriod(value as Period)}
          gradientColors={colors}
          style={{ marginBottom: spacing.md }}
        />

        <UnifiedSelector
          options={dataTypeOptions}
          selected={dataType}
          onSelect={(value) => setDataType(value as DataType)}
          gradientColors={colors}
          style={{ marginBottom: spacing.md }}
        />

        <UnifiedCard style={{ marginBottom: spacing.md }}>
          <View style={styles.averageContent}>
            <Ionicons name="stats-chart" size={iconSizes.lg} color={accentColor} />
            <View>
              <Text style={styles.averageLabel}>
                Media per {period === 'week' ? 'giorno' : period === 'month' ? 'giorno' : 'mese'}
              </Text>
              <Text style={[styles.averageValue, { color: accentColor }]}>
                €{average.toFixed(2)}
              </Text>
            </View>
          </View>
        </UnifiedCard>

        <UnifiedCard style={{ marginBottom: spacing.md }}>
          <Text style={styles.sectionTitle}>Andamento</Text>
          <LineChart />
        </UnifiedCard>

        <UnifiedCard>
          <Text style={styles.sectionTitle}>Top 5 Categorie</Text>
          {topTypes.length === 0 ? (
            <Text style={styles.emptyText}>Nessuna categoria disponibile</Text>
          ) : (
            topTypes.map((item, index) => (
              <View key={index} style={styles.topItem}>
                <View style={[styles.topRank, { backgroundColor: accentColor + '20' }]}>
                  <Text style={[styles.topRankText, { color: accentColor }]}>{index + 1}</Text>
                </View>
                <View style={styles.topInfo}>
                  <Text style={styles.topType}>{item.type}</Text>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${item.percentage}%`,
                          backgroundColor: dataType === 'in' ? INCOME_COLOR : EXPENSE_COLOR
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
            ))
          )}
        </UnifiedCard>
      </ScrollView>
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
    ...typography.h2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  averageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  averageLabel: {
    ...typography.small,
    color: '#666',
  },
  averageValue: {
    ...typography.h3,
  },
  sectionTitle: {
    ...typography.bodyBold,
    marginBottom: spacing.md,
    color: '#333',
  },
  chartWrapper: {
    paddingVertical: spacing.sm,
  },
  emptyChart: {
    height: responsive(200),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
    color: '#999',
    textAlign: 'center',
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  topRank: {
    width: responsive(30),
    height: responsive(30),
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRankText: {
    ...typography.caption,
    fontWeight: '700',
  },
  topInfo: {
    flex: 1,
  },
  topType: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: '#333',
  },
  progressBarBg: {
    height: responsive(8),
    backgroundColor: '#e0e0e0',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  topAmount: {
    alignItems: 'flex-end',
  },
  topAmountText: {
    ...typography.caption,
    fontWeight: '600',
    color: '#333',
  },
  topPercentage: {
    ...typography.small,
    color: '#666',
  },
});