// components/CurrencyConverter.tsx
import { borderRadius, iconSizes, responsive, shadows, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface CurrencyConverterProps {
  visible: boolean;
  onClose: () => void;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

const currencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.09 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.86 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 161.45 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', rate: 0.97 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.53 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.68 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.89 },
];

export default function CurrencyConverter({ visible, onClose }: CurrencyConverterProps) {
  const [fromCurrency, setFromCurrency] = useState(currencies[0]);
  const [toCurrency, setToCurrency] = useState(currencies[1]);
  const [fromAmount, setFromAmount] = useState('1');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const { colors, accentColor, textColor } = useGradient();

  const convert = (amount: string, from: Currency, to: Currency): string => {
    const value = parseFloat(amount) || 0;
    const inEuro = value / from.rate;
    const result = inEuro * to.rate;
    return result.toFixed(2);
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const toAmount = convert(fromAmount, fromCurrency, toCurrency);

  const CurrencyInput = ({
    currency,
    amount,
    onAmountChange,
    onCurrencyPress,
    editable = true,
  }: {
    currency: Currency;
    amount: string;
    onAmountChange?: (text: string) => void;
    onCurrencyPress: () => void;
    editable?: boolean;
  }) => (
    <View style={[styles.inputContainer, { borderColor: accentColor }]}>
      <Pressable onPress={onCurrencyPress} style={styles.currencyButton}>
        <Text style={[styles.currencySymbol, { color: accentColor }]}>{currency.symbol}</Text>
        <Ionicons name="chevron-down" size={iconSizes.sm} color={accentColor} />
      </Pressable>
      
      <TextInput
        style={[styles.amountInput, { color: textColor }]}
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="numeric"
        placeholder="0.00"
        editable={editable}
      />
      
      <Text style={styles.currencyCode}>{currency.code}</Text>
    </View>
  );

  const CurrencyPicker = ({
    visible,
    onSelect,
    onClose,
    selected,
  }: {
    visible: boolean;
    onSelect: (currency: Currency) => void;
    onClose: () => void;
    selected: Currency;
  }) => {
    if (!visible) return null;

    return (
      <View style={styles.pickerOverlay}>
        <Pressable style={styles.pickerBackground} onPress={onClose} />
        <View style={[styles.pickerContainer, { backgroundColor: 'white' }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: textColor }]}>Seleziona Valuta</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={iconSizes.lg} color={textColor} />
            </Pressable>
          </View>
          <ScrollView>
            {currencies.map(currency => (
              <Pressable
                key={currency.code}
                onPress={() => {
                  onSelect(currency);
                  onClose();
                }}
                style={[
                  styles.currencyItem,
                  currency.code === selected.code && {
                    backgroundColor: accentColor + '20',
                  },
                ]}
              >
                <View style={styles.currencyItemLeft}>
                  <Text style={[styles.currencyItemSymbol, { color: accentColor }]}>
                    {currency.symbol}
                  </Text>
                  <View>
                    <Text style={[styles.currencyItemCode, { color: textColor }]}>
                      {currency.code}
                    </Text>
                    <Text style={styles.currencyItemName}>{currency.name}</Text>
                  </View>
                </View>
                {currency.code === selected.code && (
                  <Ionicons name="checkmark-circle" size={iconSizes.lg} color={accentColor} />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: 'white' }]}>
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={iconSizes.lg} color={accentColor} />
            </Pressable>
            <Text style={[styles.title, { color: textColor }]}>Convertitore Valute</Text>
            <View style={{ width: iconSizes.lg }} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Da</Text>
            <CurrencyInput
              currency={fromCurrency}
              amount={fromAmount}
              onAmountChange={setFromAmount}
              onCurrencyPress={() => setShowFromPicker(true)}
            />
          </View>

          <View style={styles.swapContainer}>
            <Pressable
              onPress={handleSwap}
              style={[styles.swapButton, { backgroundColor: accentColor }]}
            >
              <Ionicons name="swap-vertical" size={iconSizes.lg} color="white" />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>A</Text>
            <CurrencyInput
              currency={toCurrency}
              amount={toAmount}
              onCurrencyPress={() => setShowToPicker(true)}
              editable={false}
            />
          </View>

          <View style={[styles.rateInfo, { backgroundColor: accentColor + '15' }]}>
            <Text style={styles.rateText}>
              1 {fromCurrency.code} = {(toCurrency.rate / fromCurrency.rate).toFixed(4)} {toCurrency.code}
            </Text>
          </View>

          <CurrencyPicker
            visible={showFromPicker}
            onSelect={setFromCurrency}
            onClose={() => setShowFromPicker(false)}
            selected={fromCurrency}
          />
          <CurrencyPicker
            visible={showToPicker}
            onSelect={setToCurrency}
            onClose={() => setShowToPicker(false)}
            selected={toCurrency}
          />
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
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '65%',
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
  title: {
    ...typography.h4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: '#666',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    backgroundColor: '#f9f9f9',
    gap: spacing.xs,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
  },
  currencySymbol: {
    fontSize: responsive(24),
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    ...typography.h3,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  currencyCode: {
    ...typography.caption,
    color: '#666',
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  swapButton: {
    width: responsive(50),
    height: responsive(50),
    borderRadius: responsive(25),
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  rateInfo: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  rateText: {
    ...typography.caption,
    color: '#666',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pickerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerTitle: {
    ...typography.h4,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currencyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currencyItemSymbol: {
    fontSize: responsive(24),
    fontWeight: '600',
  },
  currencyItemCode: {
    ...typography.bodyBold,
  },
  currencyItemName: {
    ...typography.small,
    color: '#666',
  },
});