import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

// Import services
import { emergencyService } from '../services/emergencyService';
import { locationService } from '../services/locationService';

const { width, height } = Dimensions.get('window');

const EmergencyButton = ({ type, icon, color, description, onPress }) => (
  <TouchableOpacity
    style={[styles.emergencyButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={[color, `${color}CC`]}
      style={styles.buttonGradient}
    >
      <Ionicons name={icon} size={60} color="#FFFFFF" />
      <Text style={styles.buttonTitle}>{type}</Text>
      <Text style={styles.buttonDescription}>{description}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [activeEmergency, setActiveEmergency] = useState(null);

  useEffect(() => {
    initializeLocation();
    checkActiveEmergency();
  }, []);

  const initializeLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Required',
        'Please enable location services to use emergency features.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const checkActiveEmergency = async () => {
    try {
      const active = await emergencyService.getActiveEmergency();
      setActiveEmergency(active);
    } catch (error) {
      console.error('Check active emergency error:', error);
    }
  };

  const handleEmergencyPress = async (emergencyType) => {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if (!currentLocation) {
        Alert.alert(
          'Location Required',
          'Please enable location services to request emergency assistance.',
          [
            { text: 'Enable Location', onPress: initializeLocation },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      // Check if there's already an active emergency
      if (activeEmergency) {
        Alert.alert(
          'Active Emergency',
          'You already have an active emergency request. Please wait for assistance or contact emergency services directly.',
          [
            { text: 'View Emergency', onPress: () => navigation.navigate('Emergency') },
            { text: 'Call 911', onPress: () => Linking.openURL('tel:911') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      // Create emergency request
      Alert.alert(
        `${emergencyType} Emergency`,
        `Are you sure you want to request ${emergencyType.toLowerCase()} assistance? This will notify emergency services in your area.`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Confirm Emergency',
            style: 'destructive',
            onPress: async () => {
              try {
                const emergencyRequest = await emergencyService.createEmergencyRequest(
                  emergencyType,
                  currentLocation,
                  `Emergency assistance needed for ${emergencyType.toLowerCase()}`
                );

                setActiveEmergency(emergencyRequest);
                navigation.navigate('Emergency');
              } catch (error) {
                console.error('Create emergency error:', error);
                Alert.alert(
                  'Error',
                  'Failed to create emergency request. Please try again or call 911 directly.',
                  [
                    { text: 'Try Again', onPress: () => handleEmergencyPress(emergencyType) },
                    { text: 'Call 911', onPress: () => Linking.openURL('tel:911') }
                  ]
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Emergency button error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const emergencyButtons = [
    {
      type: 'Ambulance',
      icon: 'medical',
      color: '#E53935',
      description: 'Medical emergency, injury, or illness'
    },
    {
      type: 'Fire Brigade',
      icon: 'flame',
      color: '#FF5722',
      description: 'Fire, smoke, or hazardous materials'
    },
    {
      type: 'Air Ambulance',
      icon: 'airplane',
      color: '#2196F3',
      description: 'Critical cases needing air transport'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#E53935" />

      {/* Header */}
      <LinearGradient
        colors={['#E53935', '#C62828']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>आपत्ति</Text>
          <Text style={styles.headerSubtitle}>Emergency Services</Text>
          {currentLocation && (
            <Text style={styles.locationText}>
              📍 Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
            </Text>
          )}
        </View>
      </LinearGradient>

      {/* Emergency Buttons */}
      <View style={styles.buttonsContainer}>
        {emergencyButtons.map((button, index) => (
          <EmergencyButton
            key={index}
            type={button.type}
            icon={button.icon}
            color={button.color}
            description={button.description}
            onPress={() => handleEmergencyPress(button.type)}
          />
        ))}
      </View>

      {/* Security Alert Toggle */}
      <View style={styles.securityContainer}>
        <TouchableOpacity style={styles.securityButton}>
          <Ionicons name="shield-checkmark" size={24} color="#E53935" />
          <Text style={styles.securityText}>Security Alert Active</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>
          In case of emergency, tap the appropriate button above.{'\n'}
          Help is on the way!
        </Text>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Linking.openURL('tel:911')}
        >
          <Ionicons name="call" size={20} color="#E53935" />
          <Text style={styles.callText}>Call 911 Directly</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  buttonsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  emergencyButton: {
    borderRadius: 16,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 16,
  },
  buttonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  securityContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E53935',
  },
  securityText: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E53935',
  },
  callText: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '600',
    marginLeft: 8,
  },
});