// components/TransactionConfirmModal.tsx
import iconsIn from '@/assets/icons/in/index';
import iconsOut from '@/assets/icons/out/index';
import { borderRadius, iconSizes, responsive, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface TransactionConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: number, type: string, description: string, isIn: boolean) => void;
  initialData?: {
    amount?: string;
    type?: string;
    description?: string;
    isIn?: boolean;
  };
}

export default function TransactionConfirmModal({
  visible,
  onClose,
  onConfirm,
  initialData = {},
}: TransactionConfirmModalProps) {
  const [amount, setAmount] = useState(initialData.amount || '');
  const [selectedType, setSelectedType] = useState(initialData.type || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [isIn, setIsIn] = useState(initialData.isIn ?? false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const { accentColor, textColor } = useGradient();

  const iconNamesIn = Object.keys(iconsIn);
  const iconNamesOut = Object.keys(iconsOut);
  const availableTypes = isIn ? iconNamesIn : iconNamesOut;

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Inserisci un importo valido');
      return;
    }
    if (!selectedType) {
      alert('Seleziona una categoria');
      return;
    }

    onConfirm(parsedAmount, selectedType, description, isIn);
    
    // Reset
    setAmount('');
    setSelectedType('');
    setDescription('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Conferma Transazione</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={iconSizes.lg} color={textColor} />
            </Pressable>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Importo</Text>
              <TextInput
                style={[styles.input, { borderColor: accentColor, color: textColor }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria</Text>
              <Pressable
                onPress={() => setShowTypePicker(!showTypePicker)}
                style={[styles.input, { borderColor: accentColor, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              >
                <Text style={[styles.typeText, { color: selectedType ? textColor : '#999' }]}>
                  {selectedType || 'Seleziona categoria...'}
                </Text>
                <Ionicons name="chevron-down" size={iconSizes.sm} color={accentColor} />
              </Pressable>

              {showTypePicker && (
                <View style={[styles.typePicker, { borderColor: accentColor }]}>
                  <ScrollView style={styles.typeList} nestedScrollEnabled>
                    {availableTypes.map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => {
                          setSelectedType(type);
                          setShowTypePicker(false);
                        }}
                        style={[
                          styles.typeItem,
                          selectedType === type && { backgroundColor: accentColor + '20' }
                        ]}
                      >
                        <Text style={[styles.typeItemText, { color: textColor }]}>{type}</Text>
                        {selectedType === type && (
                          <Ionicons name="checkmark" size={iconSizes.md} color={accentColor} />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrizione</Text>
              <TextInput
                style={[styles.input, { borderColor: accentColor, color: textColor }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Note aggiuntive..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo</Text>
              <View style={styles.typeSelector}>
                <Pressable
                  onPress={() => {
                    setIsIn(false);
                    setSelectedType('');
                  }}
                  style={[
                    styles.typeButton,
                    !isIn && { backgroundColor: accentColor },
                  ]}
                >
                  <Ionicons
                    name="arrow-up"
                    size={iconSizes.md}
                    color={!isIn ? 'white' : '#666'}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      !isIn && styles.typeButtonTextActive,
                    ]}
                  >
                    Uscita
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setIsIn(true);
                    setSelectedType('');
                  }}
                  style={[
                    styles.typeButton,
                    isIn && { backgroundColor: accentColor },
                  ]}
                >
                  <Ionicons
                    name="arrow-down"
                    size={iconSizes.md}
                    color={isIn ? 'white' : '#666'}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      isIn && styles.typeButtonTextActive,
                    ]}
                  >
                    Entrata
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.buttonText}>Annulla</Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              style={[styles.button, { backgroundColor: accentColor }]}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Conferma</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '70%',
    backgroundColor: 'white',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    ...typography.h4,
  },
  form: {
    flex: 1,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: '#666',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    ...typography.body,
    backgroundColor: '#f9f9f9',
  },
  typeText: {
    ...typography.body,
  },
  typePicker: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    backgroundColor: '#fafafa',
    maxHeight: responsive(200),
  },
  typeList: {
    padding: spacing.xs,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs / 2,
  },
  typeItemText: {
    ...typography.body,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  typeButtonText: {
    ...typography.bodyBold,
    color: '#666',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    ...typography.bodyBold,
    color: '#333',
  },
});