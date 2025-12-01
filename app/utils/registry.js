/**
 * Load and save functions for persistent storage.
 * Assumes existence of "./storage" exporting loadArray and saveArray functions.
 */
import { DeviceEventEmitter } from 'react-native';
import { loadArray, saveArray } from "./storage";

const REGISTRY_IN = 'registry_in';
const REGISTRY_OUT = 'registry_out';
const REGISTRY_CHANGED_EVENT = 'registryChanged';

function notifyRegistryChange() {
  DeviceEventEmitter.emit(REGISTRY_CHANGED_EVENT);
}

const addItem = async (registry, item) => {
  try {
    const current = await loadArray(registry);
    current.push(item);
    await saveArray(registry, current);
    
    notifyRegistryChange();

  } catch (error) {
    console.error(`Errore aggiunta a ${registry}:`, error);
  }
};

const deleteIndex = async (registry, index) => {
  try {
    const current = await loadArray(registry);
    if (index >= 0 && index < current.length) {
      current.splice(index, 1);
      await saveArray(registry, current);

      notifyRegistryChange();


    }
  } catch (error) {
    console.error(`Errore eliminando indice ${index} di ${registry}:`, error);
  }
};

const modifyIndex = async (registry, index, item) => {
  try {
    const current = await loadArray(registry);
    if (index >= 0 && index < current.length) {
      current[index] = item;
      await saveArray(registry, current);

      notifyRegistryChange();

    }
  } catch (error) {
    console.error(`Errore modificando indice ${index} di ${registry}:`, error);
  }
};

const calculateTotalAmount = async (registryName) => {
  try {
    const array = await loadArray(registryName);
    return array.reduce((acc, item) => {
      const amount = typeof item.amount === 'number' ? item.amount : 0;
      return acc + amount;
    }, 0);
  } catch (error) {
    console.error(`Errore nel calcolo del totale per ${registryName}:`, error);
    throw new Error(`Errore nel calcolo del totale per ${registryName}: ${error}`);
  }
};

/**
 * Organizes registry data into months around the current month.
 * Groups and sorts transactions by month, identifying the current,
 * past, and future months relative to 'currentMonth'.
 *
 * @param {Array} registryIn
 * @param {Array} registryOut
 * @param {string} currentMonth - Format 'YYYY-MM'
 * @returns {Object}
 */
const organizeRegistry = (registryIn, registryOut, currentMonth) => {

  const groupByMonth = (records) => {
    const grouped = {};
    records.forEach(record => {
      const date = new Date(record.Date);
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!grouped[yearMonth]) grouped[yearMonth] = [];
      grouped[yearMonth].push(record);
    });
    return grouped;
  };

  const getMonthsRange = (startDate, endDate) => {
    const months = [];
    const date = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (date <= end) {
      months.push(new Date(date));
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

  const sortRecordsByDate = (records) =>
    records.slice().sort((a, b) => new Date(a.Date) - new Date(b.Date));

  const currentDate = new Date(currentMonth + "-01");
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth();

  const totalMonths = 12;
  const halfSpan = Math.floor(totalMonths / 2);

  const startRange = new Date(currentYear, currentMonthNum - halfSpan, 1);
  const endRange = new Date(currentYear, currentMonthNum + Math.ceil(totalMonths / 2) - 1, 1);

  const allMonths = getMonthsRange(startRange, endRange);

  const inGrouped = groupByMonth(sortRecordsByDate(registryIn));
  const outGrouped = groupByMonth(sortRecordsByDate(registryOut));

  const getRecordsForMonth = (grouped, label) => grouped[label] || [];

  const currentLabel = `${currentYear}-${(currentMonthNum + 1).toString().padStart(2, '0')}`;
  const currentMonthRecords = [
    ...getRecordsForMonth(inGrouped, currentLabel),
    ...getRecordsForMonth(outGrouped, currentLabel)
  ];

  const pastMonths = [];
  const futureMonths = [];

  allMonths.forEach((month) => {
    const label = `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}`;
    const inRecords = getRecordsForMonth(inGrouped, label);
    const outRecords = getRecordsForMonth(outGrouped, label);

    if (month < new Date(currentYear, currentMonthNum, 1)) {
      pastMonths.push(inRecords.concat(outRecords));
    } else if (month > new Date(currentYear, currentMonthNum, 1)) {
      futureMonths.push(inRecords.concat(outRecords));
    }
  });

  return {
    currentMonthRecords,
    pastMonths,
    futureMonths,
  };
};


const calculateTotalForMonth = async (registry,dateString) => {

  const current = await loadArray(registry);

  // Normalizziamo la data per estrarre anno e mese
  const inputDate = new Date(dateString);

  if (isNaN(inputDate.getTime())) {
    console.error("Data non valida passata a calculateTotalForMonth:", dateString);
    return 0;
  }

  const targetYear = inputDate.getFullYear();
  const targetMonth = inputDate.getMonth(); // 0-based (gennaio = 0)

  return current.reduce((total, item) => {
    try {
      
      const itemDate = new Date(item.date);

      if (isNaN(itemDate.getTime())) return total; // salta record con data corrotta

      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth();

      // Controlla se è lo stesso anno e mese
      if (itemYear === targetYear && itemMonth === targetMonth) {
        const amount = typeof item.amount === "number" ? item.amount : 0;
        return total + amount;
      }
      return total;
    } catch (err) {
      console.warn("Errore elaborazione record:", item, err);
      return total;
    }
  }, 0);
};

const add_in = (item) => addItem(REGISTRY_IN, item);
const add_out = (item) => addItem(REGISTRY_OUT, item);

const delete_in_index = (index) => deleteIndex(REGISTRY_IN, index);
const delete_out_index = (index) => deleteIndex(REGISTRY_OUT, index);

const modify_in_index = (index, item) => modifyIndex(REGISTRY_IN, index, item);
const modify_out_index = (index, item) => modifyIndex(REGISTRY_OUT, index, item);

const calculateTotalIn = () => calculateTotalAmount(REGISTRY_IN);
const calculateTotalOut = () => calculateTotalAmount(REGISTRY_OUT);

const calculateTotalForInMonth_in = (date) => calculateTotalForMonth(REGISTRY_IN,date)
const calculateTotalForInMonth_out = (date) => calculateTotalForMonth(REGISTRY_OUT,date)

export {
  add_in,
  add_out,
  calculateTotalForInMonth_in,
  calculateTotalForInMonth_out,
  calculateTotalIn,
  calculateTotalOut,
  delete_in_index,
  delete_out_index,
  modify_in_index,
  modify_out_index,
  organizeRegistry
};

export default {
  add_in,
  add_out,
};