import { useGradient } from '@/hooks/useGradient';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {

  const { colors, accentColor, textColor } = useGradient();
  
  return (
    <LinearGradient
      colors={[colors[0],colors[1], colors[2]]}
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