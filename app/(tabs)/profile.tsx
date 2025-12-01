// app/(tabs)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, DeviceEventEmitter, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, Vibration, View } from 'react-native';

import { getAllGradients, setIndexByColor } from '@/app/utils/bgColor';

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
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
          </View>
          <ScrollView>
            {gradientPresets.map((preset, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  Vibration.vibrate(10);
                  onSelect(preset.colors);
                  onClose();
                }}
                style={colorPickerStyles.presetItem}
              >
                <LinearGradient
                  colors={[preset.colors[0], preset.colors[1], preset.colors[2]]} // modifield
                  style={colorPickerStyles.gradientPreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={colorPickerStyles.presetName}>{preset.name}</Text>
                {JSON.stringify(preset.colors) === JSON.stringify(currentColors) && (
                  <Ionicons name="checkmark-circle" size={24} color="#007aff" />
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
  const [gradientColors, setGradientColors] = useState(['#d7d8b6ff', '#f2edadff', '#ffffffff']);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  useEffect(() => {
    loadSettings();

    const listener = DeviceEventEmitter.addListener('gradientChanged', (colors) => {
    setGradientColors(colors);
  });
  
  return () => listener.remove();
  }, []);

  const loadSettings = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem('username');
      const savedCurrency = await AsyncStorage.getItem('currency');
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedBiometric = await AsyncStorage.getItem('biometric');
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedGradient = await AsyncStorage.getItem('gradientColors');

      if (savedUsername) setUsername(savedUsername);
      if (savedCurrency) setCurrency(savedCurrency);
      if (savedNotifications) setNotifications(savedNotifications === 'true');
      if (savedBiometric) setBiometric(savedBiometric === 'true');
      if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
      if (savedGradient) setGradientColors(JSON.parse(savedGradient));
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

  const handlePress = () => {
    Vibration.vibrate(10);
  };

  const saveUsername = () => {
    handlePress();
    saveSetting('username', username);
    setIsEditingUsername(false);
  };

  const handleGradientSelect = async (colors: string[]) => {
    await setIndexByColor(colors);
    setGradientColors(colors);
    saveSetting('gradientColors', colors);
  };

  const resetData = () => {
    handlePress();
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

  return (
    <LinearGradient
      colors={[gradientColors[0],gradientColors[1],gradientColors[2]]}// modifield
      locations={[0.1, 0.2, 0.9]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profilo</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#007aff" />
          </View>
          {isEditingUsername ? (
            <View style={styles.usernameEdit}>
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={setUsername}
                autoFocus
              />
              <Pressable onPress={saveUsername} style={styles.saveButton}>
                <Ionicons name="checkmark" size={24} color="#007aff" />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => { handlePress(); setIsEditingUsername(true); }}>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.editHint}>Tocca per modificare</Text>
            </Pressable>
          )}
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aspetto</Text>
          
          <Pressable
            onPress={() => { handlePress(); setShowColorPicker(true); }}
            style={styles.settingItem}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette" size={24} color="#007aff" />
              <Text style={styles.settingText}>Gradiente</Text>
            </View>
            <View style={styles.gradientPreview}>
              <LinearGradient
                colors={[gradientColors[0], gradientColors[1], gradientColors[2]]} // modifield
                style={styles.miniGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </Pressable>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={24} color="#007aff" />
              <Text style={styles.settingText}>Modalità Scura</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                handlePress();
                setDarkMode(value);
                saveSetting('darkMode', value);
              }}
            />
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impostazioni Generali</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="cash" size={24} color="#007aff" />
              <Text style={styles.settingText}>Valuta</Text>
            </View>
            <Text style={styles.settingValue}>{currency}</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color="#007aff" />
              <Text style={styles.settingText}>Notifiche</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={(value) => {
                handlePress();
                setNotifications(value);
                saveSetting('notifications', value);
              }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="finger-print" size={24} color="#007aff" />
              <Text style={styles.settingText}>Biometrico</Text>
            </View>
            <Switch
              value={biometric}
              onValueChange={(value) => {
                handlePress();
                setBiometric(value);
                saveSetting('biometric', value);
              }}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestione Dati</Text>
          
          <Pressable onPress={resetData} style={styles.dangerItem}>
            <Ionicons name="trash" size={24} color="#f44336" />
            <Text style={styles.dangerText}>Cancella tutti i dati</Text>
          </Pressable>
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
        currentColors={gradientColors}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#070707ff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  editHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  usernameEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  usernameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#007aff',
    fontSize: 24,
    fontWeight: '600',
    minWidth: 150,
    textAlign: 'center',
  },
  saveButton: {
    padding: 5,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  gradientPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniGradient: {
    width: 50,
    height: 30,
    borderRadius: 6,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 12,
  },
  dangerText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gradientPreview: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginRight: 15,
  },
  presetName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});