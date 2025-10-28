import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { io } from 'socket.io-client';
import * as Location from 'expo-location';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const socket = io(API_URL, { transports: ['websocket'] });

export default function App() {
  async function request(type) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    const res = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: type === 'Ambulance' ? 'AMBULANCE' : type === 'Fire Brigade' ? 'FIRE' : 'AIR',
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        description: 'Help needed',
        citizenId: 'demo-citizen'
      })
    });
    const data = await res.json();
    socket.emit('join:request', data.id);
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 28, color: '#E53935', fontWeight: 'bold' }}>Aapatt</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#E53935' }]} onPress={() => request('Ambulance')}>
        <Text style={styles.btnText}>🚑 Ambulance</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#E53935' }]} onPress={() => request('Fire Brigade')}>
        <Text style={styles.btnText}>🚒 Fire Brigade</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#E53935' }]} onPress={() => request('Air Ambulance')}>
        <Text style={styles.btnText}>🚁 Air Ambulance</Text>
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
