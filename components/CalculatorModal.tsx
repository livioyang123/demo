// src/components/CalculatorModal.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { months } from '../constants/months';
import DatePickerModal from './DatePickerModal';

interface CalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  onDone: (amount: number, description: string, date: Date, operation?: 'add' | 'subtract') => void;
}

export default function CalculatorModal({ visible, onClose, onDone }: CalculatorModalProps) {
  const [displayValue, setDisplayValue] = useState('0.00');
  const [description, setDescription] = useState('');
  const [operation, setOperation] = useState<'add' | 'subtract' | null>(null);
  const [firstValue, setFirstValue] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleNumberPress = (num: string) => {
    if (displayValue === '0.00') {
      setDisplayValue(num === '.' ? '0.' : num);
    } else {
      const parts = displayValue.split('.');
      if (num === '.' && displayValue.includes('.')) return;
      if (parts[1] && parts[1].length >= 2 && num !== '.') return;
      setDisplayValue(displayValue + num);
    }
  };

  const handleDelete = () => {
    if (displayValue.length === 1 || displayValue === '0.00') {
      setDisplayValue('0.00');
    } else {
      const newValue = displayValue.slice(0, -1);
      setDisplayValue(newValue || '0.00');
    }
  };

  const handleOperation = (op: 'add' | 'subtract') => {
    if (operation === null) {
      setFirstValue(parseFloat(displayValue));
      setOperation(op);
      setDisplayValue('0.00');
      setShowResult(false);
    }
  };

  const handleEquals = () => {
    if (operation && firstValue !== null) {
      let result = 0;
      const secondValue = parseFloat(displayValue);
      
      if (operation === 'add') {
        result = firstValue + secondValue;
      } else if (operation === 'subtract') {
        result = firstValue - secondValue;
      }
      
      setDisplayValue(result.toFixed(2));
      setShowResult(true);
    }
  };

  const handleDone = () => {
    let finalAmount = parseFloat(displayValue);

    onDone(finalAmount, description, selectedDate, operation || undefined);
    
    // Reset
    setDisplayValue('0.00');
    setDescription('');
    setOperation(null);
    setFirstValue(null);
    setShowResult(false);
  };

  const handleDateDone = () => {
    const newDate = new Date(selectedYear, selectedMonth, 1);
    setSelectedDate(newDate);
    setDatePickerVisible(false);
  };

  const getDisplayText = () => {
    if (operation && firstValue !== null && !showResult) {
      const opSymbol = operation === 'add' ? '+' : '−';
      return `${firstValue.toFixed(2)} ${opSymbol} ${parseFloat(displayValue).toFixed(2)}`;
    }
    const num = parseFloat(displayValue);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←'];

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Display Value - 15% */}
            <View style={styles.displayContainer}>
              <Text style={styles.displayValue}>{getDisplayText()}</Text>
            </View>

            {/* Input Description - 15% */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description:</Text>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Add note..."
                placeholderTextColor="#999"
              />
            </View>

            {/* Main Content - 70% */}
            <View style={styles.mainContent}>
              {/* Numeric Keypad - 75% width */}
              <View style={styles.keypadContainer}>
                {numbers.map((num, index) => (
                  <Pressable
                    key={index}
                    style={styles.numButton}
                    onPress={() => {
                      if (num === '←') {
                        handleDelete();
                      } else {
                        handleNumberPress(num);
                      }
                    }}
                  >
                    <Text style={styles.numButtonText}>{num}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Right Column - 25% width */}
              <View style={styles.rightColumn}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => setDatePickerVisible(true)}
                >
                  <Ionicons name="calendar-outline" size={24} color="#070707" />
                  <Text style={styles.dateText}>
                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.iconButton, operation === 'add' && styles.activeOperation]}
                  onPress={() => handleOperation('add')}
                >
                  <Text style={styles.operationText}>+</Text>
                </Pressable>

                <Pressable
                  style={[styles.iconButton, operation === 'subtract' && styles.activeOperation]}
                  onPress={() => handleOperation('subtract')}
                >
                  <Text style={styles.operationText}>−</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.doneButton,
                    operation && !showResult && styles.equalsButton
                  ]}
                  onPress={() => {
                    if (operation && !showResult) {
                      handleEquals();
                    } else {
                      handleDone();
                    }
                  }}
                >
                  <Text style={styles.doneButtonText}>
                    {operation && !showResult ? '=' : '✓'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <DatePickerModal
        visible={datePickerVisible}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        months={months}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onClose={() => setDatePickerVisible(false)}
        onDone={handleDateDone}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    height: '40%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  displayContainer: {
    height: '15%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  displayValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#070707',
  },
  descriptionContainer: {
    height: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '96%',
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  descriptionLabel: {
    fontSize: 14,
    color: '#070707',
    marginRight: 8,
    fontWeight: '500',
  },
  descriptionInput: {
    flex: 1,
    fontSize: 14,
    color: '#070707',
  },
  mainContent: {
    height: '70%',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  keypadContainer: {
    width: '75%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingRight: 5,
  },
  numButton: {
    width: '33.33%',
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  numButtonText: {
    fontSize: 24,
    color: '#070707',
    fontWeight: '500',
  },
  rightColumn: {
    width: '25%',
    justifyContent: 'space-between',
    paddingLeft: 5,
  },
  iconButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginVertical: 3,
  },
  activeOperation: {
    backgroundColor: '#007AFF',
  },
  dateText: {
    fontSize: 10,
    color: '#070707',
    marginTop: 2,
  },
  operationText: {
    fontSize: 28,
    color: '#070707',
    fontWeight: '600',
  },
  doneButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34C759',
    borderRadius: 10,
    marginVertical: 3,
  },
  equalsButton: {
    backgroundColor: '#007AFF',
  },
  doneButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});