// components/CurrencyConverter.tsx
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, Vibration, View } from 'react-native';

interface CurrencyConverterProps {
  visible: boolean;
  onClose: () => void;
}

const currencies = [
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
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState(currencies[0]);
  const [toCurrency, setToCurrency] = useState(currencies[1]);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handlePress = () => {
    Vibration.vibrate(10);
  };

  const convert = () => {
    const value = parseFloat(amount) || 0;
    const inEuro = value / fromCurrency.rate;
    const result = inEuro * toCurrency.rate;
    return result.toFixed(2);
  };

  const swapCurrencies = () => {
    handlePress();
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const CurrencyPicker = ({ 
    visible, 
    onSelect, 
    onClose, 
    selected 
  }: { 
    visible: boolean; 
    onSelect: (currency: typeof currencies[0]) => void; 
    onClose: () => void;
    selected: typeof currencies[0];
  }) => {
    if (!visible) return null;

    return (
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Seleziona Valuta</Text>
            <Pressable onPress={onClose}>
              <AntDesign name="close" size={24} color="#666" />
            </Pressable>
          </View>
          <ScrollView>
            {currencies.map((currency) => (
              <Pressable
                key={currency.code}
                onPress={() => {
                  handlePress();
                  onSelect(currency);
                  onClose();
                }}
                style={[
                  styles.currencyItem,
                  currency.code === selected.code && styles.selectedCurrency
                ]}
              >
                <View>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                </View>
                <Text style={styles.currencySymbol}>{currency.symbol}</Text>
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
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => { handlePress(); onClose(); }} style={styles.closeButton}>
              <AntDesign name="close" size={24} color="#007aff" />
            </Pressable>
            <Text style={styles.title}>Convertitore Valute</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Importo</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
            />
          </View>

          {/* From Currency */}
          <View style={styles.section}>
            <Text style={styles.label}>Da</Text>
            <Pressable
              onPress={() => { handlePress(); setShowFromPicker(true); }}
              style={styles.currencySelector}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencySymbolLarge}>{fromCurrency.symbol}</Text>
                <View>
                  <Text style={styles.currencyCodeLarge}>{fromCurrency.code}</Text>
                  <Text style={styles.currencyNameSmall}>{fromCurrency.name}</Text>
                </View>
              </View>
              <AntDesign name="down" size={20} color="#666" />
            </Pressable>
          </View>

          {/* Swap Button */}
          <View style={styles.swapContainer}>
            <Pressable onPress={swapCurrencies} style={styles.swapButton}>
              <AntDesign name="swap" size={24} color="#007aff" />
            </Pressable>
          </View>

          {/* To Currency */}
          <View style={styles.section}>
            <Text style={styles.label}>A</Text>
            <Pressable
              onPress={() => { handlePress(); setShowToPicker(true); }}
              style={styles.currencySelector}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencySymbolLarge}>{toCurrency.symbol}</Text>
                <View>
                  <Text style={styles.currencyCodeLarge}>{toCurrency.code}</Text>
                  <Text style={styles.currencyNameSmall}>{toCurrency.name}</Text>
                </View>
              </View>
              <AntDesign name="down" size={20} color="#666" />
            </Pressable>
          </View>

          {/* Result */}
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Risultato</Text>
            <Text style={styles.resultValue}>
              {toCurrency.symbol}{convert()}
            </Text>
            <Text style={styles.rateInfo}>
              1 {fromCurrency.code} = {(toCurrency.rate / fromCurrency.rate).toFixed(4)} {toCurrency.code}
            </Text>
          </View>

          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            {['10', '50', '100', '500', '1000'].map((value) => (
              <Pressable
                key={value}
                onPress={() => { handlePress(); setAmount(value); }}
                style={styles.quickButton}
              >
                <Text style={styles.quickButtonText}>{value}</Text>
              </Pressable>
            ))}
          </View>

          {/* Currency Pickers */}
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
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
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
  section: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 24,
    fontWeight: '600',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  currencySymbolLarge: {
    fontSize: 32,
    fontWeight: '600',
  },
  currencyCodeLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  currencyNameSmall: {
    fontSize: 12,
    color: '#666',
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  swapButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 25,
  },
  resultContainer: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#007aff',
    marginBottom: 8,
  },
  rateInfo: {
    fontSize: 12,
    color: '#666',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007aff',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCurrency: {
    backgroundColor: '#e3f2fd',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currencyName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007aff',
  },
});