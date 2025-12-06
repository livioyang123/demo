// components/ReceiptScanner.tsx
import { feedback } from '@/app/utils/feedback';
import { add_out } from '@/app/utils/registry';
import TransactionConfirmModal from '@/components/TransactionConfirmModal';
import { borderRadius, iconSizes, responsive, shadows, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface ReceiptData {
  amount: number;
  type: string;
  description: string;
  merchant?: string;
  date?: string;
}

export default function ReceiptScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { accentColor } = useGradient();

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Necessitiamo del permesso per accedere alla fotocamera');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Necessitiamo del permesso per accedere alla galleria');
      return false;
    }
    return true;
  };

  const analyzeReceiptWithOpenAI = async (imageBase64: string): Promise<ReceiptData> => {
    try {
      // Qui andrebbe implementata la chiamata a OpenAI Vision API
      // Per ora simulo una risposta
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulazione risposta OpenAI
      const mockResponse: ReceiptData = {
        amount: 25.50,
        type: 'Food',
        description: 'Spesa supermercato',
        merchant: 'Conad',
        date: new Date().toISOString(),
      };

      return mockResponse;
    } catch (error) {
      console.error('Errore analisi scontrino:', error);
      throw new Error('Impossibile analizzare lo scontrino');
    }
  };

  const handleImageCapture = async (source: 'camera' | 'library') => {
    try {
      let result;

      if (source === 'camera') {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });
      } else {
        const hasPermission = await requestMediaLibraryPermission();
        if (!hasPermission) return;

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const imageBase64 = result.assets[0].base64;

        setPreviewImage(imageUri);
        setShowPreview(true);
        setIsScanning(true);

        if (imageBase64) {
          const data = await analyzeReceiptWithOpenAI(imageBase64);
          setReceiptData(data);
          setIsScanning(false);
          
          // Dopo 1 secondo chiudi preview e mostra conferma
          setTimeout(() => {
            setShowPreview(false);
            setShowConfirmModal(true);
          }, 1000);
        }
      }
    } catch (error) {
      setIsScanning(false);
      setShowPreview(false);
      Alert.alert('Errore', 'Impossibile elaborare l\'immagine');
      console.error('Errore scansione:', error);
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert(
      'Scansiona Scontrino',
      'Scegli la sorgente dell\'immagine',
      [
        {
          text: 'Fotocamera',
          onPress: () => handleImageCapture('camera'),
        },
        {
          text: 'Galleria',
          onPress: () => handleImageCapture('library'),
        },
        {
          text: 'Annulla',
          style: 'cancel',
        },
      ]
    );
  };

  const handlePressIn = () => {
    setIsFocused(true);
    feedback.triggerFeedback('light');
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
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

    await add_out(transaction);
    feedback.triggerFeedback('success');
    setShowConfirmModal(false);
    setReceiptData(null);
    setPreviewImage(null);
  };

  return (
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={showImageSourceOptions}
          style={[
            styles.scanButton,
            {
              backgroundColor: isFocused ? 'white' : accentColor,
              borderColor: isFocused ? accentColor : 'white',
            },
          ]}
        >
          <Ionicons 
            name="receipt" 
            size={iconSizes.lg} 
            color={isFocused ? accentColor : 'white'} 
          />
        </Pressable>
      </Animated.View>

      <Modal visible={showPreview} transparent animationType="fade">
        <View style={styles.previewOverlay}>
          <View style={[styles.previewContainer, { borderColor: accentColor }]}>
            {previewImage && (
              <Image source={{ uri: previewImage }} style={styles.previewImage} />
            )}
            
            {isScanning && (
              <View style={styles.scanningOverlay}>
                <ActivityIndicator size="large" color={accentColor} />
                <Text style={[styles.scanningText, { color: accentColor }]}>
                  Analisi scontrino in corso...
                </Text>
              </View>
            )}

            {!isScanning && (
              <View style={[styles.successOverlay, { backgroundColor: accentColor + '90' }]}>
                <Ionicons name="checkmark-circle" size={responsive(60)} color="white" />
                <Text style={styles.successText}>Scontrino analizzato!</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {receiptData && (
        <TransactionConfirmModal
          visible={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setReceiptData(null);
            setPreviewImage(null);
          }}
          onConfirm={handleConfirm}
          initialData={{
            amount: receiptData.amount.toString(),
            type: receiptData.type,
            description: receiptData.description,
            isIn: false,
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    position: 'absolute',
    top: responsive(480),
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
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '90%',
    height: '70%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 3,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scanningText: {
    ...typography.h4,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  successText: {
    ...typography.h3,
    color: 'white',
    fontWeight: '700',
  },
});