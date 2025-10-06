import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Button, Card, Paragraph, Snackbar } from 'react-native-paper';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createEmergencyRequest } from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Aapatt needs location access to help emergency services find you quickly.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation(currentLocation);

      // Get address from coordinates
      let address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        const formattedAddress = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''}`.trim();
        setLocation({
          ...currentLocation,
          address: formattedAddress
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      showSnackbar('Unable to get your location. Please enable location services.');
    }
  };

  const handleEmergencyRequest = (type) => {
    const emergencyTypes = {
      AMBULANCE: {
        title: '🚑 Ambulance',
        description: 'Medical emergency - Request immediate medical assistance',
        confirmMessage: 'Request an ambulance for medical emergency?'
      },
      FIRE_BRIGADE: {
        title: '🚒 Fire Brigade',
        description: 'Fire emergency - Request fire department assistance',
        confirmMessage: 'Request fire brigade for fire/rescue emergency?'
      },
      AIR_AMBULANCE: {
        title: '🚁 Air Ambulance',
        description: 'Critical emergency - Request air ambulance for urgent medical transport',
        confirmMessage: 'Request air ambulance for critical medical emergency?'
      }
    };

    const emergency = emergencyTypes[type];

    Alert.alert(
      emergency.title,
      emergency.confirmMessage,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Request Help',
          style: 'destructive',
          onPress: () => createRequest(type)
        }
      ]
    );
  };

  const createRequest = async (type) => {
    if (!location) {
      showSnackbar('Getting your location...');
      await getCurrentLocation();
      return;
    }

    setIsCreatingRequest(true);

    try {
      const requestData = {
        type,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: location.address || 'Location coordinates provided',
        description: `Emergency ${type.toLowerCase().replace('_', ' ')} request from Aapatt app`,
        severity: 'HIGH'
      };

      const response = await createEmergencyRequest(requestData);

      if (response.success) {
        showSnackbar('✅ Emergency request created! Help is on the way.');
        // Navigate to emergency tracking screen
        navigation.navigate('Emergency', { 
          requestId: response.data.requestId,
          type: type 
        });
      } else {
        throw new Error(response.message || 'Failed to create request');
      }
    } catch (error) {
      console.error('Emergency request error:', error);
      Alert.alert(
        'Request Failed',
        'Unable to create emergency request. Please try again or call emergency services directly.',
        [
          { text: 'Retry', onPress: () => createRequest(type) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsCreatingRequest(false);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const EmergencyButton = ({ type, icon, title, color, description }) => (
    <TouchableOpacity
      style={[styles.emergencyButton, { backgroundColor: color }]}
      onPress={() => handleEmergencyRequest(type)}
      disabled={isCreatingRequest}
      activeOpacity={0.8}
    >
      <Text style={styles.emergencyIcon}>{icon}</Text>
      <Text style={styles.emergencyTitle}>{title}</Text>
      <Text style={styles.emergencyDescription}>{description}</Text>
      <View style={styles.tapIndicator}>
        <Text style={styles.tapText}>TAP FOR EMERGENCY</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>🚨 Aapatt Emergency Response</Text>
        <Text style={styles.tagline}>Saving lives through intelligent technology</Text>
      </View>

      {/* Location Status */}
      <Card style={styles.locationCard}>
        <Card.Content>
          <View style={styles.locationHeader}>
            <Icon name="location-on" size={24} color="#E53935" />
            <Text style={styles.locationTitle}>Your Location</Text>
          </View>
          {location ? (
            <View>
              <Paragraph style={styles.locationText}>
                {location.address || 'Location coordinates available'}
              </Paragraph>
              <Text style={styles.coordinates}>
                {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
              </Text>
            </View>
          ) : (
            <View>
              <Paragraph style={styles.locationText}>Getting your location...</Paragraph>
              <Button 
                mode="outlined" 
                onPress={getCurrentLocation}
                style={styles.refreshButton}
              >
                Refresh Location
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Emergency Buttons */}
      <Text style={styles.sectionTitle}>Emergency Services</Text>
      
      <EmergencyButton
        type="AMBULANCE"
        icon="🚑"
        title="Ambulance"
        color="#E53935"
        description="Medical emergencies, injuries, health crises"
      />

      <EmergencyButton
        type="FIRE_BRIGADE"
        icon="🚒"
        title="Fire Brigade"
        color="#FF5722"
        description="Fires, accidents, rescues, hazardous situations"
      />

      <EmergencyButton
        type="AIR_AMBULANCE"
        icon="🚁"
        title="Air Ambulance"
        color="#D32F2F"
        description="Critical medical emergencies requiring airlift"
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('FirstAid')}
          >
            <Icon name="healing" size={32} color="#1565C0" />
            <Text style={styles.actionText}>AI First Aid</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('History')}
          >
            <Icon name="history" size={32} color="#1565C0" />
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety Tips */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Text style={styles.tipsTitle}>💡 Safety Tips</Text>
          <Text style={styles.tipsText}>
            • Stay calm during emergencies{'\n'}
            • Provide clear location information{'\n'}
            • Follow first aid guidance while waiting{'\n'}
            • Keep emergency contacts updated
          </Text>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53935',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  locationCard: {
    marginBottom: 24,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#666',
  },
  refreshButton: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emergencyButton: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emergencyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 12,
  },
  tapIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tapText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickActions: {
    marginTop: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    width: (width - 48) / 2 - 8,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#1565C0',
  },
  tipsCard: {
    marginTop: 24,
    backgroundColor: '#E8F5E8',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  snackbar: {
    backgroundColor: '#43A047',
  },
});