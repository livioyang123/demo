import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';

import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { DeviceEventEmitter, Pressable, StyleSheet, Text, View } from 'react-native';

import { calculateTotalForInMonth_in, calculateTotalForInMonth_out } from '@/app/utils/registry';
import DatePickerModal from '@/components/DatePickerModal';
import Navbar from '@/components/Navbar';
import TransactionsList from '@/components/TransactionalList';
import { months } from '../../constants/months';

export default function HomeScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPicker, setShowPicker] = useState(false);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  const formatNumber = (num: number, type: "int" | "float" = "int") => {
    const values = num.toString().split('.');
    if (type === "int") {
      return values[0];
    }
    else {
      return values.length > 1 ? values[1] : '00';
    }
  }

  const formatDate = (mode = "full") => {
    const month = months[selectedMonth];
    const year = selectedYear;

    if (mode === "month") return month;
    if (mode === "year") return year;

    return `${month} ${year}`;
  };

  const handleDone = () => {
    setShowPicker(false);
  };

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const router = useRouter();

  useEffect(() => {
    async function fetchTotals() {
      try {
        const inValue = await calculateTotalForInMonth_in(selectedYear + "-" + (selectedMonth + 1));
        const outValue = await calculateTotalForInMonth_out(selectedYear + "-" + (selectedMonth + 1));

        setTotalIn(inValue);
        setTotalOut(outValue);
      } catch (e) {
        console.error('Errore nel calcolo dei totali:', e);
      }
    }

    fetchTotals();

    const updateListener = () => {
      fetchTotals();
    }

    const listener = DeviceEventEmitter.addListener('registryChanged', updateListener);

    return () => {
      listener.remove();
    };
  }, [selectedMonth, selectedYear]);

  return (
    <LinearGradient
      colors={['#d7d8b6ff', '#f2edadff', '#ffffffff']}
      locations={[0.1, 0.2, 0.9]}
      style={styles.mainContainer}
    >
      <View style={styles.appName}>
        <Text style={styles.text}>L</Text>
      </View>

      <View style={styles.header}>

        <View style={styles.overView}>

          <View style={styles.dataSelector}>

            <Text style={styles.selectedText}>{selectedYear}</Text>

            <Pressable
              style={styles.dateButton}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.dateText}>
                {formatDate("month")} <AntDesign name="caret-down" size={20} color="black" />
              </Text>
            </Pressable>

          </View>

          <View style={styles.info}>

            <View style={styles.infoIn}>
              <Text style={styles.infoText}>In</Text>
              <Pressable style={styles.infoButton} >
                <Text style={styles.text}>
                  {formatNumber(totalIn)}<Text>.</Text><Text style={styles.smallNumber}>{formatNumber(totalIn, "float")}</Text>
                </Text>
              </Pressable >
            </View>

            <View style={styles.infoOut}>

              <Text style={styles.infoText}>Out</Text>
              <Pressable style={styles.infoButton}>
                <Text style={styles.text}>
                  {formatNumber(totalOut)}<Text>.</Text><Text style={styles.smallNumber}>{formatNumber(totalOut, "float")}</Text>
                </Text>
              </Pressable>

            </View>

          </View>

        </View>

        <View style={styles.navbar}>

          <Navbar />

        </View>

      </View>

      <View style={styles.body}>
        <TransactionsList
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
        />
      </View>

      <DatePickerModal
        visible={showPicker}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        months={months}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onClose={() => setShowPicker(false)}
        onDone={handleDone}
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    flexDirection: "column",

  },
  appName: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '4%',

  },
  text: {
    marginBottom: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#070707ff',
    fontFamily: "sans-serif-condensed",
  },

  header: {
    width: '96%',
    position: 'absolute',
    top: "10%",
    flexDirection: "column",
    margin: 10,
  },
  overView: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    width: '98%',
  },
  dataSelector: {
    marginLeft: 10,
    position: "absolute",
    left: 0,
  },
  info: {
    position: "absolute",
    right: 0,
    width: '70%',
    textAlign: "left",
    flexDirection: "row",
    justifyContent: "space-around",

  },
  infoIn: {
    position: "absolute",
    left: 0,
    width: '50%',

  },
  infoOut: {
    position: "absolute",
    right: 0,
    width: '50%',
  },
  infoText: {
    fontSize: 16,
    color: '#070707ff',
    marginBottom: 5,
  },
  infoButton: {
    elevation: 3,

  },
  navbar: {
    width: '98%',
    position: "absolute",
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    top: 60,
    height: 60,

    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 10,
  },
  body: {
    flex: 1,
    overflow: "hidden",
    width: '98%',
    position: "relative",
    top: 130,
    backgroundColor: "white",
    borderRadius: 15,
    borderColor: "#d3d3d3",
    borderWidth: 1,
    maxHeight:600,
    marginTop:30,

  },

  dateButton: {
    elevation: 3,

  },
  dateText: {
    marginTop: 5,
    fontSize: 20,
    color: '#070707ff',
    fontWeight: '600',

  },
  selectedText: {
    fontSize: 16,
    color: '#070707ff',
  },
  openButton: {
    marginTop: 30,
    backgroundColor: '#007aff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  openButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  smallNumber: {
    color: '#887070ff',
    fontSize: 14,
  },
});  
