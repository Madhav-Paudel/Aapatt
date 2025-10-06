import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Button, Card, Title, Paragraph, ActivityIndicator, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';

import { getEmergencyStatus, cancelEmergencyRequest } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { getCurrentLocation } from '../services/location';

const EmergencyScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { emergencyId, emergencyType } = route.params || {};

  const [emergency, setEmergency] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    initializeEmergencyTracking();
    return () => {
      disconnectSocket();
    };
  }, [emergencyId]);

  const initializeEmergencyTracking = async () => {
    try {
      // Get user location
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Connect to socket for real-time updates
      const socket = connectSocket();
      
      // Join emergency room
      socket.emit('joinEmergency', emergencyId);
      
      // Listen for provider updates
      socket.on('providerAccepted', (data) => {
        setProvider(data.provider);
        setEta(data.eta);
        Alert.alert(
          'Emergency Response Accepted!',
          `${data.provider.name} is on the way. ETA: ${data.eta} minutes`,
          [{ text: 'OK' }]
        );
      });

      socket.on('providerLocationUpdate', (data) => {
        setProvider(prev => ({ ...prev, location: data.location }));
        setEta(data.eta);
      });

      socket.on('emergencyStatusUpdate', (data) => {
        setEmergency(prev => ({ ...prev, status: data.status }));
        
        if (data.status === 'ARRIVED') {
          Alert.alert(
            'Help Has Arrived!',
            'Your emergency responder has arrived at your location.',
            [{ text: 'OK' }]
          );
        } else if (data.status === 'COMPLETED') {
          Alert.alert(
            'Emergency Completed',
            'Your emergency has been marked as completed. We hope you are safe.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Home')
              }
            ]
          );
        }
      });

      // Get emergency details
      const emergencyData = await getEmergencyStatus(emergencyId);
      setEmergency(emergencyData);
      
      if (emergencyData.provider) {
        setProvider(emergencyData.provider);
        setEta(emergencyData.eta);
      }

    } catch (error) {
      console.error('Error initializing emergency tracking:', error);
      Alert.alert('Error', 'Unable to load emergency details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEmergency = () => {
    Alert.alert(
      'Cancel Emergency Request',
      'Are you sure you want to cancel this emergency request? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelEmergencyRequest(emergencyId);
              Alert.alert(
                'Request Cancelled',
                'Your emergency request has been cancelled.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Home')
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Unable to cancel emergency request');
            }
          }
        }
      ]
    );
  };

  const handleCallProvider = () => {
    if (provider?.phone) {
      Linking.openURL(`tel:${provider.phone}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return 'hourglass-empty';
      case 'ACCEPTED':
        return 'check-circle';
      case 'EN_ROUTE':
        return 'directions-car';
      case 'ARRIVED':
        return 'location-on';
      case 'COMPLETED':
        return 'done-all';
      default:
        return 'help';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#FFA726';
      case 'ACCEPTED':
        return '#66BB6A';
      case 'EN_ROUTE':
        return '#42A5F5';
      case 'ARRIVED':
        return '#AB47BC';
      case 'COMPLETED':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const getEmergencyIcon = (type) => {
    switch (type) {
      case 'AMBULANCE':
        return '🚑';
      case 'FIRE_BRIGADE':
        return '🚒';
      case 'AIR_AMBULANCE':
        return '🚁';
      default:
        return '🚨';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading emergency details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Emergency Header */}
      <Card style={styles.emergencyCard}>
        <Card.Content>
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyIcon}>
              {getEmergencyIcon(emergency?.type)}
            </Text>
            <View style={styles.emergencyInfo}>
              <Title style={styles.emergencyTitle}>
                {emergency?.type?.replace('_', ' ')}
              </Title>
              <View style={styles.statusContainer}>
                <Icon 
                  name={getStatusIcon(emergency?.status)} 
                  size={20} 
                  color={getStatusColor(emergency?.status)} 
                />
                <Text style={[styles.statusText, { color: getStatusColor(emergency?.status) }]}>
                  {emergency?.status?.replace('_', ' ')}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Provider Information */}
      {provider ? (
        <Card style={styles.providerCard}>
          <Card.Content>
            <Title>Your Emergency Responder</Title>
            <View style={styles.providerInfo}>
              <Icon name="person" size={40} color="#1565C0" />
              <View style={styles.providerDetails}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerUnit}>{provider.unit || 'Emergency Unit'}</Text>
                {eta && (
                  <Chip mode="outlined" icon="access-time" style={styles.etaChip}>
                    ETA: {eta} minutes
                  </Chip>
                )}
              </View>
            </View>
            <View style={styles.providerActions}>
              <Button 
                mode="contained" 
                icon="phone" 
                onPress={handleCallProvider}
                style={styles.callButton}
              >
                Call Provider
              </Button>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.waitingCard}>
          <Card.Content>
            <View style={styles.waitingContent}>
              <ActivityIndicator size="large" color="#E53935" />
              <Title style={styles.waitingTitle}>Finding Nearest Provider</Title>
              <Paragraph style={styles.waitingText}>
                We're locating the nearest emergency responder in your area. 
                This usually takes 1-2 minutes.
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Map View */}
      {userLocation && (
        <Card style={styles.mapCard}>
          <Card.Content>
            <Title>Live Tracking</Title>
          </Card.Content>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {/* User location marker */}
            <Marker
              coordinate={userLocation}
              title="Your Location"
              description="Emergency location"
              pinColor="#E53935"
            />
            
            {/* Provider location marker */}
            {provider?.location && (
              <>
                <Marker
                  coordinate={provider.location}
                  title={provider.name}
                  description="Emergency Responder"
                  pinColor="#1565C0"
                />
                
                {/* Route line */}
                <Polyline
                  coordinates={[userLocation, provider.location]}
                  strokeColor="#1565C0"
                  strokeWidth={3}
                />
              </>
            )}
          </MapView>
        </Card>
      )}

      {/* Emergency Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Title>Emergency Details</Title>
          <View style={styles.detailRow}>
            <Icon name="access-time" size={20} color="#666" />
            <Text style={styles.detailText}>
              Requested: {emergency?.createdAt ? new Date(emergency.createdAt).toLocaleString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#666" />
            <Text style={styles.detailText}>
              {emergency?.address || 'Current location'}
            </Text>
          </View>
          {emergency?.description && (
            <View style={styles.detailRow}>
              <Icon name="description" size={20} color="#666" />
              <Text style={styles.detailText}>{emergency.description}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Cancel Button */}
      {emergency?.status === 'PENDING' && (
        <View style={styles.cancelContainer}>
          <Button 
            mode="outlined" 
            onPress={handleCancelEmergency}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonText}
          >
            Cancel Emergency Request
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emergencyCard: {
    margin: 16,
    elevation: 4,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  providerCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  providerDetails: {
    marginLeft: 16,
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  providerUnit: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  etaChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  providerActions: {
    marginTop: 16,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  waitingCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  waitingContent: {
    alignItems: 'center',
    padding: 16,
  },
  waitingTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  waitingText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  mapCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    overflow: 'hidden',
  },
  map: {
    height: 200,
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  cancelContainer: {
    margin: 16,
    marginTop: 0,
  },
  cancelButton: {
    borderColor: '#E53935',
  },
  cancelButtonText: {
    color: '#E53935',
  },
});

export default EmergencyScreen;