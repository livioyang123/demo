import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { StyleSheet } from 'react-native';


export default function HomeScreen() {
  
  const router = useRouter();
  return (
    <LinearGradient
      colors={['#d7d8b6ff', '#f2edadff', '#ffffffff']}
      locations={[0.1, 0.2, 0.9]}
      style={styles.container}
    >
      
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
});