// components/VoiceInputButton.tsx
import { feedback } from '@/app/utils/feedback';
import { add_in, add_out } from '@/app/utils/registry';
import { borderRadius, iconSizes, responsive, shadows, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

interface ParsedData {
  amount: number;
  type: string;
  description: string;
  isIn: boolean;
}

export default function VoiceInputButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [modalAnimation] = useState(new Animated.Value(0));

  const { accentColor, textColor } = useGradient();

  // Riconoscimento vocale e parsing con AI
  const handleVoiceInput = async () => {
    feedback.triggerFeedback('medium');
    setIsRecording(true);

    try {
      // TODO: Implementare riconoscimento vocale reale
      // Per ora simula con esempio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockText = "ho speso 20 euro per il pranzo";
      
      // Parsing con regex semplice
      const amountMatch = mockText.match(/(\d+(?:\.\d+)?)\s*euro/i);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      
      const isIn = mockText.toLowerCase().includes('ricevuto') || 
                   mockText.toLowerCase().includes('guadagnato') ||
                   mockText.toLowerCase().includes('entrata');
      
      let type = 'Other';
      let description = mockText;
      
      // Rileva categoria
      if (mockText.toLowerCase().includes('pranzo') || mockText.toLowerCase().includes('cibo')) {
        type = 'Food';
        description = 'pranzo';
      } else if (mockText.toLowerCase().includes('trasporto') || mockText.toLowerCase().includes('benzina')) {
        type = 'Transport';
      } else if (mockText.toLowerCase().includes('shopping') || mockText.toLowerCase().includes('acquisto')) {
        type = 'Shopping';
      }

      const mockParsed: ParsedData = {
        amount,
        type,
        description,
        isIn
      };

      setParsedData(mockParsed);
      setEditAmount(mockParsed.amount.toString());
      setEditType(mockParsed.type);
      setEditDescription(mockParsed.description);
      showModalWithAnimation();
    } catch (error) {
      console.error('Errore nel riconoscimento vocale:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const showModalWithAnimation = () => {
    setShowModal(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const hideModalWithAnimation = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      setParsedData(null);
    });
  };

  const handleConfirm = async () => {
    if (!parsedData) return;

    const transaction = {
      type: editType,
      description: editDescription,
      date: new Date(),
      amount: parseFloat(editAmount),
    };

    if (parsedData.isIn) {
      await add_in(transaction);
    } else {
      await add_out(transaction);
    }

    feedback.triggerFeedback('success');
    hideModalWithAnimation();
  };

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <>
      {/* Pulsante Voice Input */}
      <Pressable
        onPress={handleVoiceInput}
        disabled={isRecording}
        style={({ pressed }) => [
          styles.voiceButton,
          {
            borderColor: accentColor,
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        {isRecording ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <Ionicons name="mic" size={iconSizes.lg} color={accentColor} />
        )}
      </Pressable>

      {/* Modal di Conferma */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={hideModalWithAnimation}
      >
        <Pressable style={styles.modalOverlay} onPress={hideModalWithAnimation}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: modalTranslateY }],
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Conferma Transazione
              </Text>
              <Pressable onPress={hideModalWithAnimation}>
                <Ionicons name="close" size={iconSizes.lg} color={textColor} />
              </Pressable>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Importo</Text>
                <TextInput
                  style={[styles.input, { borderColor: accentColor }]}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria</Text>
                <TextInput
                  style={[styles.input, { borderColor: accentColor }]}
                  value={editType}
                  onChangeText={setEditType}
                  placeholder="Es. Food, Transport..."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrizione</Text>
                <TextInput
                  style={[styles.input, { borderColor: accentColor }]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Note aggiuntive..."
                />
              </View>

              <View style={styles.typeSelector}>
                <Pressable
                  onPress={() =>
                    setParsedData(prev => (prev ? { ...prev, isIn: false } : null))
                  }
                  style={[
                    styles.typeButton,
                    !parsedData?.isIn && {
                      backgroundColor: accentColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      !parsedData?.isIn && styles.typeButtonTextActive,
                    ]}
                  >
                    Uscita
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    setParsedData(prev => (prev ? { ...prev, isIn: true } : null))
                  }
                  style={[
                    styles.typeButton,
                    parsedData?.isIn && {
                      backgroundColor: accentColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      parsedData?.isIn && styles.typeButtonTextActive,
                    ]}
                  >
                    Entrata
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                onPress={hideModalWithAnimation}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>Annulla</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                style={[styles.button, { backgroundColor: accentColor }]}
              >
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  Conferma
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  voiceButton: {
    position: 'absolute',
    bottom: responsive(100),
    right: spacing.lg,
    width: responsive(60),
    height: responsive(60),
    borderRadius: responsive(30),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '60%',
    backgroundColor: 'white',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    ...typography.h4,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: '#666',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    ...typography.body,
    backgroundColor: '#f9f9f9',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
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
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    ...typography.bodyBold,
    color: '#333',
  },
});