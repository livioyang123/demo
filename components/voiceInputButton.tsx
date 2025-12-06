// components/voiceInputButton.tsx
import { feedback } from '@/app/utils/feedback';
import { add_in, add_out } from '@/app/utils/registry';
import { borderRadius, iconSizes, responsive, shadows, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
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
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const [currentText, setCurrentText] = useState('');
  
  const [modalAnimation] = useState(new Animated.Value(0));
  const [voiceModalAnimation] = useState(new Animated.Value(0));
  
  // Animazioni per le onde sonore
  const wave1 = useRef(new Animated.Value(0.3)).current;
  const wave2 = useRef(new Animated.Value(0.5)).current;
  const wave3 = useRef(new Animated.Value(0.7)).current;
  const wave4 = useRef(new Animated.Value(0.5)).current;
  const wave5 = useRef(new Animated.Value(0.3)).current;
  
  const micScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { accentColor, textColor } = useGradient();

  useEffect(() => {
    if (isRecording) {
      startWaveAnimations();
      startMicAnimation();
    }
  }, [isRecording]);

  const startWaveAnimations = () => {
    const waves = [wave1, wave2, wave3, wave4, wave5];
    const delays = [0, 100, 200, 300, 400];
    
    waves.forEach((wave, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave, {
            toValue: 1,
            duration: 400 + Math.random() * 200,
            useNativeDriver: true,
          }),
          Animated.timing(wave, {
            toValue: 0.2,
            duration: 400 + Math.random() * 200,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      ).start();
    });
  };

  const startMicAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.spring(micScale, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 50,
          friction: 3,
        }),
        Animated.spring(micScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 3,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleVoiceInput = async () => {
    feedback.triggerFeedback('medium');
    setIsRecording(true);
    setShowVoiceModal(true);
    setCurrentText('');
    
    Animated.spring(voiceModalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    try {
      // Simula riconoscimento vocale progressivo
      const mockPhrases = [
        "ho",
        "ho speso",
        "ho speso 20",
        "ho speso 20 euro",
        "ho speso 20 euro per",
        "ho speso 20 euro per il",
        "ho speso 20 euro per il pranzo"
      ];

      for (let i = 0; i < mockPhrases.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setCurrentText(mockPhrases[i]);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      const finalText = mockPhrases[mockPhrases.length - 1];
      setRecognizedText(finalText);
      
      const parsedData = parseVoiceText(finalText);
      
      setParsedData(parsedData);
      setEditAmount(parsedData.amount.toString());
      setEditType(parsedData.type);
      setEditDescription(parsedData.description);
      
      // Chiudi modal vocale e apri modal conferma
      hideVoiceModalAndShowConfirm();
      
    } catch (error) {
      console.error('Errore nel riconoscimento vocale:', error);
      setShowVoiceModal(false);
    } finally {
      setIsRecording(false);
      wave1.stopAnimation();
      wave2.stopAnimation();
      wave3.stopAnimation();
      wave4.stopAnimation();
      wave5.stopAnimation();
      micScale.stopAnimation();
      pulseAnim.stopAnimation();
    }
  };

  const parseVoiceText = (text: string): ParsedData => {
    const lowerText = text.toLowerCase();
    
    const amountMatch = lowerText.match(/(\d+(?:[.,]\d+)?)\s*euro/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
    
    const isIn = lowerText.includes('ricevuto') || 
                 lowerText.includes('guadagnat') ||
                 lowerText.includes('entrat') ||
                 lowerText.includes('stipendio') ||
                 lowerText.includes('salario');
    
    let type = 'Other';
    let description = text;
    
    const categories = [
      { keywords: ['pranzo', 'cena', 'colazione', 'cibo', 'ristorante', 'pizza', 'bar'], type: 'Food' },
      { keywords: ['benzina', 'trasporto', 'bus', 'metro', 'taxi', 'treno'], type: 'Transport' },
      { keywords: ['shopping', 'acquisto', 'vestiti', 'scarpe', 'negozio'], type: 'Shopping' },
      { keywords: ['affitto', 'casa', 'bolletta', 'utenze'], type: 'Bills' },
      { keywords: ['stipendio', 'salario', 'lavoro', 'paga'], type: 'Salary' },
      { keywords: ['spesa', 'supermercato', 'alimentari'], type: 'Groceries' },
      { keywords: ['cinema', 'teatro', 'concerto', 'divertimento'], type: 'Entertainment' },
      { keywords: ['palestra', 'sport', 'fitness'], type: 'Health' },
    ];
    
    for (const cat of categories) {
      if (cat.keywords.some(keyword => lowerText.includes(keyword))) {
        type = cat.type;
        const keywordFound = cat.keywords.find(k => lowerText.includes(k));
        description = keywordFound || type;
        break;
      }
    }
    
    return { amount, type, description, isIn };
  };

  const hideVoiceModalAndShowConfirm = () => {
    Animated.timing(voiceModalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowVoiceModal(false);
      showModalWithAnimation();
    });
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
      setRecognizedText('');
    });
  };

  const cancelVoiceInput = () => {
    setIsRecording(false);
    Animated.timing(voiceModalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowVoiceModal(false);
      setCurrentText('');
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

  const voiceModalTranslateY = voiceModalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const getWaveHeight = (wave: Animated.Value) => {
    return wave.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 80],
    });
  };

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [1, 1.3],
    outputRange: [0.3, 0],
  });

  return (
    <>
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

      {/* Modal Riconoscimento Vocale */}
      <Modal
        visible={showVoiceModal}
        transparent
        animationType="none"
        onRequestClose={cancelVoiceInput}
      >
        <View style={styles.voiceModalOverlay}>
          <Animated.View
            style={[
              styles.voiceModalContent,
              { transform: [{ translateY: voiceModalTranslateY }] },
            ]}
          >
            <View style={styles.voiceHeader}>
              <Text style={[styles.voiceTitle, { color: textColor }]}>Sto ascoltando...</Text>
              <Pressable onPress={cancelVoiceInput}>
                <Ionicons name="close" size={iconSizes.lg} color={textColor} />
              </Pressable>
            </View>

            {/* Animazione microfono pulsante */}
            <View style={styles.micContainer}>
              <Animated.View
                style={[
                  styles.pulsatingCircle,
                  {
                    backgroundColor: accentColor,
                    opacity: pulseOpacity,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.micCircle,
                  {
                    backgroundColor: accentColor,
                    transform: [{ scale: micScale }],
                  },
                ]}
              >
                <Ionicons name="mic" size={iconSizes.xl} color="white" />
              </Animated.View>
            </View>

            {/* Onde sonore */}
            <View style={styles.waveContainer}>
              {[wave1, wave2, wave3, wave4, wave5].map((wave, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.wave,
                    {
                      backgroundColor: accentColor,
                      height: getWaveHeight(wave),
                      opacity: wave.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ]}
                />
              ))}
            </View>

            {/* Testo riconosciuto */}
            <View style={styles.textContainer}>
              <Text style={[styles.recognizedLiveText, { color: textColor }]}>
                {currentText || 'Inizia a parlare...'}
              </Text>
            </View>

            <Pressable
              onPress={cancelVoiceInput}
              style={[styles.cancelVoiceButton, { borderColor: accentColor }]}
            >
              <Text style={[styles.cancelVoiceText, { color: accentColor }]}>Annulla</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal Conferma */}
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
              { transform: [{ translateY: modalTranslateY }] },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Conferma Transazione
              </Text>
              <Pressable onPress={hideModalWithAnimation}>
                <Ionicons name="close" size={iconSizes.lg} color={textColor} />
              </Pressable>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              {recognizedText && (
                <View style={[styles.recognizedBox, { backgroundColor: accentColor + '15' }]}>
                  <Ionicons name="mic" size={iconSizes.sm} color={accentColor} />
                  <Text style={styles.recognizedText}>`&quot;`{recognizedText}`&quot;`</Text>
                </View>
              )}

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
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo</Text>
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
                    <Ionicons 
                      name="arrow-up" 
                      size={iconSizes.md} 
                      color={!parsedData?.isIn ? 'white' : '#666'} 
                    />
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
                    <Ionicons 
                      name="arrow-down" 
                      size={iconSizes.md} 
                      color={parsedData?.isIn ? 'white' : '#666'} 
                    />
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
            </ScrollView>

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
  voiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  voiceModalContent: {
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  voiceTitle: {
    ...typography.h4,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: responsive(120),
    marginBottom: spacing.lg,
  },
  pulsatingCircle: {
    position: 'absolute',
    width: responsive(100),
    height: responsive(100),
    borderRadius: responsive(50),
  },
  micCircle: {
    width: responsive(80),
    height: responsive(80),
    borderRadius: responsive(40),
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  waveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: responsive(100),
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  wave: {
    width: responsive(8),
    borderRadius: borderRadius.sm,
  },
  textContainer: {
    minHeight: responsive(60),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  recognizedLiveText: {
    ...typography.h4,
    textAlign: 'center',
  },
  cancelVoiceButton: {
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelVoiceText: {
    ...typography.bodyBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
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
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    ...typography.h4,
  },
  form: {
    flex: 1,
    marginBottom: spacing.md,
  },
  recognizedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  recognizedText: {
    ...typography.caption,
    flex: 1,
    fontStyle: 'italic',
    color: '#666',
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