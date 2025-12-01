import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const GRADIENT_STORAGE_KEY = 'gradientColors';

const gradientPresets = [
  { name: 'Default', colors: ['#d7d8b6ff', '#f2edadff', '#ffffffff'] },
  { name: 'Ocean', colors: ['#667eea', '#764ba2', '#f093fb'] },
  { name: 'Sunset', colors: ['#fa709a', '#fee140', '#ffecd2'] },
  { name: 'Forest', colors: ['#134e5e', '#71b280', '#d4fc79'] },
  { name: 'Purple', colors: ['#a8edea', '#fed6e3', '#ffecd2'] },
  { name: 'Fire', colors: ['#ff6b6b', '#feca57', '#ff9ff3'] },
];

// Variabile cache locale per prestazioni migliori
let currentColors = [...gradientPresets[0].colors];

/**
 * Inizializza il gradient caricandolo da AsyncStorage
 * Deve essere chiamata all'avvio dell'app
 */
export async function initializeGradient() {
  try {
    const savedGradient = await AsyncStorage.getItem(GRADIENT_STORAGE_KEY);
    if (savedGradient) {
      currentColors = JSON.parse(savedGradient);
    } else {
      // Salva il gradient di default se non esiste
      await AsyncStorage.setItem(GRADIENT_STORAGE_KEY, JSON.stringify(currentColors));
    }
  } catch (e) {
    console.error('Errore caricamento gradient:', e);
  }
}

/**
 * Imposta il gradient corrente tramite array di colori
 * Salva in AsyncStorage e notifica tutti i componenti
 */
export async function setGradientColors(colors) {
  try {
    currentColors = [...colors];
    await AsyncStorage.setItem(GRADIENT_STORAGE_KEY, JSON.stringify(colors));
    // Emette evento per aggiornare tutti i componenti in ascolto
    DeviceEventEmitter.emit('gradientChanged', colors);
  } catch (e) {
    console.error('Errore salvataggio gradient:', e);
  }
}

/**
 * Imposta il gradient trovando il preset tramite il primo colore
 */
export async function setIndexByColor(colors) {
  await setGradientColors(colors);
}

/**
 * Restituisce il gradient corrente (sincrono per uso immediato)
 */
export function getColor() {
  return [...currentColors];
}

/**
 * Trova un gradient per nome
 */
export function getGradientByName(name) {
  const preset = gradientPresets.find(p => p.name === name);
  return preset ? [...preset.colors] : [...gradientPresets[0].colors];
}

/**
 * Trova un gradient per indice
 */
export function getGradientByIndex(index) {
  const preset = gradientPresets[index];
  return preset ? [...preset.colors] : [...gradientPresets[0].colors];
}

/**
 * Restituisce tutti i nomi dei gradient disponibili
 */
export function getAllGradientNames() {
  return gradientPresets.map(p => p.name);
}

/**
 * Restituisce tutti i gradient disponibili
 */
export function getAllGradients() {
  return gradientPresets.map(preset => ({
    ...preset,
    colors: [...preset.colors]
  }));
}

export default {
  initializeGradient,
  setGradientColors,
  setIndexByColor,
  getColor,
  getGradientByName,
  getGradientByIndex,
  getAllGradientNames,
  getAllGradients
};