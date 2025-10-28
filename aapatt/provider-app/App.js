import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { io } from 'socket.io-client';
import * as Location from 'expo-location';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const socket = io(API_URL, { transports: ['websocket'] });

export default function App() {
  async function goOnline() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    await fetch(`${API_URL}/providers/demo-provider/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: true, latitude: loc.coords.latitude, longitude: loc.coords.longitude })
    });
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 28, color: '#1565C0', fontWeight: 'bold' }}>Aapatt Provider</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#43A047' }]} onPress={goOnline}>
        <Text style={styles.btnText}>Go Online</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  btn: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12 },
  btnText: { color: 'white', fontSize: 20, fontWeight: 'bold' }
});
