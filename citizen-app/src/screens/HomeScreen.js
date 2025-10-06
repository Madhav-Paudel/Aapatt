/**
 * Home Screen
 * Main screen with emergency request buttons
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmergencyButton from '../components/EmergencyButton';
import locationService from '../services/location';
import api from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Getting your location...');
  const [loading, setLoading] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);

  useEffect(() => {
    checkActiveRequest();
    getCurrentLocation();
  }, []);

  const checkActiveRequest = async () => {
    try {
      const response = await api.getUserRequests();
      const activeStatuses = ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'];
      const active = response.data.requests.some(req => 
        activeStatuses.includes(req.status)
      );
      setHasActiveRequest(active);
    } catch (error) {
      console.error('Failed to check active request:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
      
      const addr = await locationService.reverseGeocode(loc.latitude, loc.longitude);
      setAddress(addr);
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your location. Please enable location services.');
    }
  };

  const handleEmergencyRequest = async (type) => {
    if (hasActiveRequest) {
      Alert.alert(
        'Active Request',
        'You already have an active emergency request. Please wait for it to complete.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Getting your location. Please try again.');
      getCurrentLocation();
      return;
    }

    Alert.alert(
      'Emergency Request',
      `Request ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request',
          style: 'destructive',
          onPress: () => createEmergencyRequest(type)
        }
      ]
    );
  };

  const createEmergencyRequest = async (type) => {
    setLoading(true);
    try {
      const response = await api.createEmergencyRequest({
        type: type.toUpperCase().replace(' ', '_'),
        latitude: location.latitude,
        longitude: location.longitude,
        address,
        requiresSecurity: false,
      });

      const request = response.data.request;
      navigation.navigate('Emergency', { requestId: request.id });
    } catch (error) {
      Alert.alert(
        'Request Failed',
        error.response?.data?.error || 'Unable to create emergency request'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Services</Text>
        <Text style={styles.subtitle}>Select the type of emergency</Text>
      </View>

      {/* Location Display */}
      <View style={styles.locationCard}>
        <Ionicons name="location" size={24} color="#E53935" />
        <View style={styles.locationText}>
          <Text style={styles.locationLabel}>Your Location</Text>
          <Text style={styles.locationAddress}>{address}</Text>
        </View>
        <TouchableOpacity onPress={getCurrentLocation}>
          <Ionicons name="refresh" size={24} color="#1565C0" />
        </TouchableOpacity>
      </View>

      {/* Emergency Buttons */}
      <View style={styles.buttonsContainer}>
        <EmergencyButton
          type="Ambulance"
          icon="🚑"
          onPress={handleEmergencyRequest}
          disabled={loading || !location}
        />
        <EmergencyButton
          type="Fire Brigade"
          icon="🚒"
          onPress={handleEmergencyRequest}
          disabled={loading || !location}
        />
        <EmergencyButton
          type="Air Ambulance"
          icon="🚁"
          onPress={handleEmergencyRequest}
          disabled={loading || !location}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Creating emergency request...</Text>
        </View>
      )}

      {/* Info Section */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#1565C0" />
        <Text style={styles.infoText}>
          Your location will be shared with the nearest available emergency service provider.
          Help is on the way!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#424242',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },
  loadingOverlay: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});

export default HomeScreen;
