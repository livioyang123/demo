// components/voiceInputButton.tsx
import { feedback } from '@/app/utils/feedback';
import { add_in, add_out } from '@/app/utils/registry';
import TransactionConfirmModal from '@/components/TransactionConfirmModal';
import { borderRadius, iconSizes, responsive, shadows, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
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
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const [voiceModalAnimation] = useState(new Animated.Value(0));
  
  const wave1 = useRef(new Animated.Value(0.3)).current;
  const wave2 = useRef(new Animated.Value(0.5)).current;
  const wave3 = useRef(new Animated.Value(0.7)).current;
  const wave4 = useRef(new Animated.Value(0.5)).current;
  const wave5 = useRef(new Animated.Value(0.3)).current;
  
  const micScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const { accentColor, textColor } = useGradient();

  useEffect(() => {
    if (isRecording) {
      startWaveAnimations();
      startMicAnimation();
    }
  }, [isRecording]);

  const startWaveAnimations = () => {
    const waves = [wave1, wave2, wave3, wave4, wave5];
    
    waves.forEach((wave) => {
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

  const handlePressIn = () => {
    setIsFocused(true);
    Animated.spring(buttonScale, {
      toValue: 0.85,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    setIsFocused(false);
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
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
      const parsed = parseVoiceText(finalText);
      
      setParsedData(parsed);
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
      setShowConfirmModal(true);
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

  const handleConfirm = async (
    amount: number,
    type: string,
    description: string,
    isIn: boolean
  ) => {
    const transaction = {
      type,
      description,
      date: new Date(),
      amount,
    };

    if (isIn) {
      await add_in(transaction);
    } else {
      await add_out(transaction);
    }

    feedback.triggerFeedback('success');
    setShowConfirmModal(false);
    setParsedData(null);
  };

  const voiceModalTranslateY = voiceModalAnimation.interpolate({
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
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleVoiceInput}
          disabled={isRecording}
          style={[
            styles.voiceButton,
            {
              backgroundColor: isFocused ? 'white' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isFocused ? accentColor : 'transparent',
            },
          ]}
        >
          {isRecording ? (
            <ActivityIndicator size="small" color={accentColor} />
          ) : (
            <Ionicons 
              name="mic" 
              size={iconSizes.lg} 
              color={isFocused ? accentColor : accentColor} 
            />
          )}
        </Pressable>
      </Animated.View>

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

      {parsedData && (
        <TransactionConfirmModal
          visible={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setParsedData(null);
          }}
          onConfirm={handleConfirm}
          initialData={{
            amount: parsedData.amount.toString(),
            type: parsedData.type,
            description: parsedData.description,
            isIn: parsedData.isIn,
          }}
        />
      )}
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
});