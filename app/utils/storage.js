import AsyncStorage from '@react-native-async-storage/async-storage';



// Funzione per salvare un array
const saveArray = async (key, array) => {
  try {
    const jsonValue = JSON.stringify(array);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Errore durante il salvataggio:', e);
  }
};

// Funzione per leggere un array
const loadArray = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);

    if (jsonValue === null) {
      await saveArray(key, []); 
      return [];
    }else
      return JSON.parse(jsonValue);

  } catch (e) {

    console.error('Errore durante il caricamento:', e);
    await saveArray(key, []); 
    return [];
    
  }
};

export { loadArray, saveArray };

