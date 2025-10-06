import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const NavigationScreen = ({ route, navigation }) => {
  const { requestId } = route.params;
  const [request, setRequest] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [status, setStatus] = useState('EN_ROUTE');
  const { updateLocation } = useSocket();

  useEffect(() => {
    loadRequest();
    startLocationTracking();
  }, []);

  const loadRequest = async () => {
    try {
      const response = await api.getRequest(requestId);
      setRequest(response.data.request);
    } catch (error) {
      console.error('Failed to load request:', error);
    }
  };

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 50,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
        updateLocation(latitude, longitude, requestId);
        api.updateLocation(latitude, longitude);
      }
    );

    return () => subscription.remove();
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.updateRequestStatus(requestId, newStatus, null, currentLocation?.latitude, currentLocation?.longitude);
      setStatus(newStatus);
      if (newStatus === 'COMPLETED') {
        navigation.popToTop();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={currentLocation ? {
          ...currentLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        } : undefined}
      >
        {request && (
          <Marker
            coordinate={{ latitude: request.latitude, longitude: request.longitude }}
            title="Destination"
            pinColor="#E53935"
          />
        )}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor="#1565C0"
          />
        )}
      </MapView>

      <View style={styles.controls}>
        <Text style={styles.statusText}>Status: {status}</Text>
        {status === 'EN_ROUTE' && (
          <TouchableOpacity style={styles.button} onPress={() => updateStatus('ARRIVED')}>
            <Text style={styles.buttonText}>Mark as Arrived</Text>
          </TouchableOpacity>
        )}
        {status === 'ARRIVED' && (
          <TouchableOpacity style={styles.button} onPress={() => updateStatus('COMPLETED')}>
            <Text style={styles.buttonText}>Complete Job</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controls: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statusText: { fontSize: 18, fontWeight: 'bold', color: '#424242', marginBottom: 16 },
  button: { backgroundColor: '#1565C0', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default NavigationScreen;
