import { useEffect, useRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface DatePickerModalProps {
  visible: boolean;
  selectedMonth: number;
  selectedYear: number;
  months: string[];
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onClose: () => void;
  onDone: () => void;
}

export default function DatePickerModal({
  visible,
  selectedMonth,
  selectedYear,
  months,
  onMonthChange,
  onYearChange,
  onClose,
  onDone
}: DatePickerModalProps) {
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i);
  const ITEM_HEIGHT = 50;

  const scrollToMonth = (index: number) => {
    monthScrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  const scrollToYear = (year: number) => {
    const index = years.indexOf(year);
    yearScrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  const getOpacity = (index: number, selected: number) => {
    const distance = Math.abs(index - selected);
    if (distance === 0) return 1;
    if (distance === 1) return 0.6;
    if (distance === 2) return 0.3;
    return 0.15;
  };

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollToMonth(selectedMonth);
        scrollToYear(selectedYear);
      }, 100);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable 
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancelButton}>cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Select date</Text>
            <Pressable onPress={onDone}>
              <Text style={styles.doneButton}>done</Text>
            </Pressable>
          </View>
          
          <View style={styles.pickerContainer}>
            {/* Selettore Mese */}
            <View style={styles.column}>
              <ScrollView 
                ref={monthScrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {months.map((month, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.item,
                      selectedMonth === index && styles.selectedItem
                    ]}
                    onPress={() => {
                      onMonthChange(index);
                      scrollToMonth(index);
                    }}
                  >
                    <Text style={[
                      styles.itemText,
                      selectedMonth === index && styles.selectedItemText,
                      { opacity: getOpacity(index, selectedMonth) }
                    ]}>
                      {month}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.centerLine} pointerEvents="none" />
            </View>

            {/* Selettore Anno */}
            <View style={styles.column}>
              <ScrollView 
                ref={yearScrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {years.map((year, index) => (
                  <Pressable
                    key={year}
                    style={[
                      styles.item,
                      selectedYear === year && styles.selectedItem
                    ]}
                    onPress={() => {
                      onYearChange(year);
                      scrollToYear(year);
                    }}
                  >
                    <Text style={[
                      styles.itemText,
                      selectedYear === year && styles.selectedItemText,
                      { opacity: getOpacity(index, years.indexOf(selectedYear)) }
                    ]}>
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.centerLine} pointerEvents="none" />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#070707ff',
  },
  doneButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 250,
    paddingVertical: 20,
  },
  column: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 100,
    paddingHorizontal: 10,
  },
  item: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  itemText: {
    fontSize: 18,
    color: '#070707ff',
  },
  selectedItemText: {
    fontWeight: '600',
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 50,
    marginTop: -25,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
});