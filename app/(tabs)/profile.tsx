// app/(tabs)/profile-refactored.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { getAllGradients, setIndexByColor } from '@/app/utils/bgColor';
import { feedback } from '@/app/utils/feedback';
import UnifiedButton from '@/components/ui/UnifiedButton';
import UnifiedCard from '@/components/ui/UnifiedCard';
import { borderRadius, iconSizes, responsive, spacing, typography } from '@/constants/design-system';
import { useGradient } from '@/hooks/useGradient';

interface ColorPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (colors: string[]) => void;
  currentColors: string[];
}

const gradientPresets = [...getAllGradients()];

function ColorPicker({ visible, onClose, onSelect, currentColors }: ColorPickerProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={colorPickerStyles.overlay}>
        <View style={colorPickerStyles.container}>
          <View style={colorPickerStyles.header}>
            <Text style={colorPickerStyles.title}>Scegli Gradiente</Text>
            <UnifiedButton
              icon="close"
              iconColor="#666"
              variant="ghost"
              onPress={onClose}
            />
          </View>
          <ScrollView>
            {gradientPresets.map((preset, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  feedback.triggerFeedback('light');
                  onSelect(preset.colors);
                  onClose();
                }}
                style={colorPickerStyles.presetItem}
              >
                <LinearGradient
                  colors={[preset.colors[0], preset.colors[1], preset.colors[2]]}
                  style={colorPickerStyles.gradientPreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={colorPickerStyles.presetName}>{preset.name}</Text>
                {JSON.stringify(preset.colors) === JSON.stringify(currentColors) && (
                  <Ionicons name="checkmark-circle" size={iconSizes.lg} color="#007aff" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const [username, setUsername] = useState('Utente');
  const [currency, setCurrency] = useState('EUR');
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const { colors, accentColor, textColor } = useGradient();

  useEffect(() => {
    loadSettings();


  }, []);

  const loadSettings = async () => {
    try {

      const savedUsername = await AsyncStorage.getItem('username');
      const savedCurrency = await AsyncStorage.getItem('currency');
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedBiometric = await AsyncStorage.getItem('biometric');
      const savedDarkMode = await AsyncStorage.getItem('darkMode');


      if (savedUsername) setUsername(savedUsername);
      if (savedCurrency) setCurrency(savedCurrency);
      if (savedNotifications) setNotifications(savedNotifications === 'true');
      if (savedBiometric) setBiometric(savedBiometric === 'true');
      if (savedDarkMode) setDarkMode(savedDarkMode === 'true');

    } catch (e) {
      console.error('Errore caricamento impostazioni:', e);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) {
      console.error('Errore salvataggio impostazione:', e);
    }
  };


  const saveUsername = () => {
    feedback.triggerFeedback('success');
    saveSetting('username', username);
    setIsEditingUsername(false);
  };

  const handleGradientSelect = async (newColors: string[]) => {
    await setIndexByColor(newColors);
    saveSetting('gradientColors', newColors);
    feedback.triggerFeedback('success');
  };

  const resetData = () => {
    feedback.triggerFeedback('warning');
    Alert.alert(
      'Conferma Reset',
      'Sei sicuro di voler cancellare tutti i dati? Questa azione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Cancella',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              feedback.triggerFeedback('error');
              Alert.alert('Successo', 'Tutti i dati sono stati cancellati');
              loadSettings();
            } catch (e) {
              Alert.alert('Errore', 'Impossibile cancellare i dati');
            }
          }
        }
      ]
    );
  };

  const SettingRow = ({ 
    icon, 
    label, 
    value, 
    onPress, 
    rightElement 
  }: { 
    icon: string; 
    label: string; 
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <UnifiedCard
      onPress={onPress}
      style={styles.settingRow}
      elevation="none"
      padding="md"
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={iconSizes.lg} color={accentColor} />
        <Text style={styles.settingText}>{label}</Text>
      </View>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {rightElement}
    </UnifiedCard>
  );

  return (
    <LinearGradient
      colors={[colors[0], colors[1], colors[2]]}
      locations={[0.1, 0.2, 0.9]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Profilo</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <UnifiedCard style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: accentColor + '20' }]}>
            <Ionicons name="person" size={responsive(40)} color={accentColor} />
          </View>
          {isEditingUsername ? (
            <View style={styles.usernameEdit}>
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={setUsername}
                autoFocus
              />
              <UnifiedButton
                icon="checkmark"
                iconColor={accentColor}
                variant="ghost"
                onPress={saveUsername}
                feedbackType="success"
              />
            </View>
          ) : (
            <UnifiedCard 
              onPress={() => {
                feedback.triggerFeedback('light');
                setIsEditingUsername(true);
              }}
              elevation="none"
            >
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.editHint}>Tocca per modificare</Text>
            </UnifiedCard>
          )}
        </UnifiedCard>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aspetto</Text>
          
          <SettingRow
            icon="color-palette"
            label="Gradiente"
            onPress={() => {
              feedback.triggerFeedback('light');
              setShowColorPicker(true);
            }}
            rightElement={
              <View style={styles.gradientPreview}>
                <LinearGradient
                  colors={[colors[0], colors[1], colors[2]]}
                  style={styles.miniGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons name="chevron-forward" size={iconSizes.md} color="#ccc" />
              </View>
            }
          />

          <SettingRow
            icon="moon"
            label="Modalità Scura"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={(value) => {
                  feedback.triggerFeedback('light');
                  setDarkMode(value);
                  saveSetting('darkMode', value);
                }}
                trackColor={{ false: '#767577', true: accentColor }}
                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impostazioni Generali</Text>
          
          <SettingRow
            icon="cash"
            label="Valuta"
            value={currency}
          />

          <SettingRow
            icon="notifications"
            label="Notifiche"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={(value) => {
                  feedback.triggerFeedback('light');
                  setNotifications(value);
                  saveSetting('notifications', value);
                }}
                trackColor={{ false: '#767577', true: accentColor }}
                thumbColor={notifications ? '#fff' : '#f4f3f4'}
              />
            }
          />

          <SettingRow
            icon="finger-print"
            label="Biometrico"
            rightElement={
              <Switch
                value={biometric}
                onValueChange={(value) => {
                  feedback.triggerFeedback('light');
                  setBiometric(value);
                  saveSetting('biometric', value);
                }}
                trackColor={{ false: '#767577', true: accentColor }}
                thumbColor={biometric ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestione Dati</Text>
          
          <UnifiedButton
            icon="trash"
            iconColor="#f44336"
            onPress={resetData}
            variant="ghost"
            feedbackType="warning"
          >
            <Text style={styles.dangerText}>Cancella tutti i dati</Text>
          </UnifiedButton>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Versione 1.0.0</Text>
          <Text style={styles.infoText}>© 2024 Finance Tracker</Text>
        </View>
      </ScrollView>

      <ColorPicker
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onSelect={handleGradientSelect}
        currentColors={colors}
      />
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
    ...typography.h1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  profileCard: {

    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: responsive(80),
    height: responsive(80),
    borderRadius: responsive(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  username: {
    ...typography.h3,
    color: '#333',
    textAlign: 'center',
  },
  editHint: {
    ...typography.small,
    color: '#999',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  usernameEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  usernameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#007aff',
    ...typography.h3,
    minWidth: responsive(150),
    textAlign: 'center',
  },

  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: '#333',
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingText: {
    ...typography.body,
    color: '#333',
  },
  settingValue: {
    ...typography.body,
    color: '#666',
  },
  gradientPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  miniGradient: {
    width: responsive(50),
    height: responsive(30),
    borderRadius: borderRadius.sm,
  },
  dangerText: {
    ...typography.bodyBold,
    color: '#f44336',
    marginLeft: spacing.xs,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  infoText: {
    ...typography.small,
    color: '#999',
    marginBottom: spacing.xs,
  },
});

const colorPickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    ...typography.h4,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gradientPreview: {
    width: responsive(60),
    height: responsive(40),
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  presetName: {
    flex: 1,
    ...typography.body,
    color: '#333',
  },
});