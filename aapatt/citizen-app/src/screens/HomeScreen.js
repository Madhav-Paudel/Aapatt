import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, FAB, Badge } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { LocationService } from '../services/LocationService';
import { EmergencyService } from '../services/EmergencyService';
import { SocketService } from '../services/SocketService';

const { width } = Dimensions.get('window');

const EMERGENCY_TYPES = [
  {
    id: 'AMBULANCE',
    title: 'Ambulance',
    subtitle: 'Medical Emergency',
    icon: 'local-hospital',
    color: '#E53935',
    gradient: ['#E53935', '#C62828'],
  },
  {
    id: 'FIRE_BRIGADE',
    title: 'Fire Brigade',
    subtitle: 'Fire & Rescue',
    icon: 'local-fire-department',
    color: '#FF9800',
    gradient: ['#FF9800', '#F57C00'],
  },
  {
    id: 'AIR_AMBULANCE',
    title: 'Air Ambulance',
    subtitle: 'Critical Cases',
    icon: 'flight',
    color: '#2196F3',
    gradient: ['#2196F3', '#1976D2'],
  },
  {
    id: 'POLICE',
    title: 'Police',
    subtitle: 'Security Alert',
    icon: 'local-police',
    color: '#1565C0',
    gradient: ['#1565C0', '#0D47A1'],
  },
];

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    getCurrentLocation();
    setupSocketListeners();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your location. Please enable location services.'
      );
    }
  };

  const setupSocketListeners = () => {
    SocketService.on('request-update', (data) => {
      setActiveRequest(data);
    });

    SocketService.on('request-accepted', (data) => {
      Alert.alert(
        'Request Accepted',
        'Your emergency request has been accepted. Help is on the way!'
      );
    });
  };

  const handleEmergencyRequest = async (type) => {
    if (!location) {
      Alert.alert(
        'Location Required',
        'Please enable location services to make an emergency request.'
      );
      return;
    }

    Alert.alert(
      'Emergency Request',
      `Are you sure you want to request ${type.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          style: 'destructive',
          onPress: () => createEmergencyRequest(type),
        },
      ]
    );
  };

  const createEmergencyRequest = async (type) => {
    setIsLoading(true);
    try {
      const requestData = {
        requestType: type.id,
        latitude: location.latitude,
        longitude: location.longitude,
        description: `Emergency ${type.title} request`,
      };

      const response = await EmergencyService.createRequest(requestData);
      setActiveRequest(response.request);
      
      Alert.alert(
        'Request Sent',
        `Your ${type.title} request has been sent. Help is on the way!`
      );

      // Navigate to emergency tracking screen
      navigation.navigate('Emergency', { request: response.request });
    } catch (error) {
      console.error('Emergency request error:', error);
      Alert.alert('Error', 'Failed to send emergency request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const EmergencyButton = ({ type, onPress }) => (
    <TouchableOpacity
      style={styles.emergencyButton}
      onPress={() => onPress(type)}
      disabled={isLoading}
    >
      <LinearGradient
        colors={type.gradient}
        style={styles.emergencyButtonGradient}
      >
        <MaterialIcons name={type.icon} size={40} color="#FFFFFF" />
        <Text style={styles.emergencyButtonTitle}>{type.title}</Text>
        <Text style={styles.emergencyButtonSubtitle}>{type.subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Emergency Services</Title>
          <Paragraph style={styles.headerSubtitle}>
            Tap the service you need
          </Paragraph>
        </View>

        {/* Location Status */}
        <Card style={styles.locationCard}>
          <Card.Content style={styles.locationContent}>
            <MaterialIcons name="location-on" size={20} color="#43A047" />
            <Text style={styles.locationText}>
              {location ? 'Location detected' : 'Getting location...'}
            </Text>
          </Card.Content>
        </Card>

        {/* Emergency Buttons */}
        <View style={styles.emergencyGrid}>
          {EMERGENCY_TYPES.map((type) => (
            <EmergencyButton
              key={type.id}
              type={type}
              onPress={handleEmergencyRequest}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Card style={styles.actionCard}>
            <Card.Content>
              <Title style={styles.actionTitle}>Quick Actions</Title>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('FirstAid')}
                >
                  <MaterialIcons name="healing" size={24} color="#E53935" />
                  <Text style={styles.actionButtonText}>First Aid</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('History')}
                >
                  <MaterialIcons name="history" size={24} color="#1565C0" />
                  <Text style={styles.actionButtonText}>History</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <MaterialIcons name="person" size={24} color="#43A047" />
                  <Text style={styles.actionButtonText}>Profile</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Active Request Status */}
        {activeRequest && (
          <Card style={styles.activeRequestCard}>
            <Card.Content>
              <View style={styles.activeRequestHeader}>
                <MaterialIcons name="warning" size={24} color="#E53935" />
                <Title style={styles.activeRequestTitle}>Active Request</Title>
              </View>
              <Paragraph style={styles.activeRequestText}>
                {activeRequest.requestType} - {activeRequest.status}
              </Paragraph>
              <TouchableOpacity
                style={styles.trackButton}
                onPress={() => navigation.navigate('Emergency', { request: activeRequest })}
              >
                <Text style={styles.trackButtonText}>Track Request</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="phone"
        onPress={() => {
          // In a real app, this would make an emergency call
          Alert.alert('Emergency Call', 'Calling emergency services...');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  locationCard: {
    marginBottom: 20,
    elevation: 2,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#43A047',
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emergencyButton: {
    width: (width - 48) / 2,
    height: 120,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  emergencyButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  emergencyButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  emergencyButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  quickActions: {
    marginBottom: 20,
  },
  actionCard: {
    elevation: 2,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeRequestCard: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
    elevation: 2,
  },
  activeRequestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeRequestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
    marginLeft: 8,
  },
  activeRequestText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  trackButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#E53935',
  },
});