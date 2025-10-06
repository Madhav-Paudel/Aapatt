/**
 * Emergency Screen
 * Real-time tracking of emergency request
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const EmergencyScreen = ({ route, navigation }) => {
  const { requestId } = route.params;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerLocation, setProviderLocation] = useState(null);
  const { joinRequest, leaveRequest, onRequestUpdate, onProviderLocationUpdate } = useSocket();

  useEffect(() => {
    loadRequest();
    joinRequest(requestId);

    // Listen for updates
    const unsubscribeUpdate = onRequestUpdate((data) => {
      if (data.requestId === requestId) {
        loadRequest();
      }
    });

    const unsubscribeLocation = onProviderLocationUpdate((data) => {
      if (request?.providerId === data.providerId) {
        setProviderLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    });

    return () => {
      leaveRequest(requestId);
      if (unsubscribeUpdate) unsubscribeUpdate();
      if (unsubscribeLocation) unsubscribeLocation();
    };
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const response = await api.getRequest(requestId);
      setRequest(response.data.request);
      
      if (response.data.request.provider?.latitude) {
        setProviderLocation({
          latitude: response.data.request.provider.latitude,
          longitude: response.data.request.provider.longitude,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load emergency request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this emergency request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.cancelRequest(requestId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel request');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#FF9800',
      ACCEPTED: '#2196F3',
      EN_ROUTE: '#1565C0',
      ARRIVED: '#43A047',
      COMPLETED: '#4CAF50',
      CANCELLED: '#757575',
    };
    return colors[status] || '#9E9E9E';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Searching for provider...',
      ACCEPTED: 'Provider accepted',
      EN_ROUTE: 'Provider on the way',
      ARRIVED: 'Provider has arrived',
      COMPLETED: 'Emergency resolved',
      CANCELLED: 'Request cancelled',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: request.latitude,
          longitude: request.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* User location */}
        <Marker
          coordinate={{
            latitude: request.latitude,
            longitude: request.longitude,
          }}
          title="Your Location"
          pinColor="#E53935"
        />

        {/* Provider location */}
        {providerLocation && (
          <Marker
            coordinate={providerLocation}
            title={request.provider?.user?.name || 'Provider'}
            pinColor="#1565C0"
          />
        )}

        {/* Route line */}
        {providerLocation && (
          <Polyline
            coordinates={[
              { latitude: request.latitude, longitude: request.longitude },
              providerLocation,
            ]}
            strokeColor="#1565C0"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Status Info */}
      <ScrollView style={styles.infoContainer}>
        {/* Status */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(request.status) }]}>
          <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
          {request.estimatedTime && request.status !== 'COMPLETED' && (
            <Text style={styles.etaText}>ETA: {request.estimatedTime} minutes</Text>
          )}
        </View>

        {/* Provider Info */}
        {request.provider && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Provider Details</Text>
            <View style={styles.providerInfo}>
              <Ionicons name="person" size={24} color="#1565C0" />
              <View style={styles.providerText}>
                <Text style={styles.providerName}>{request.provider.user.name}</Text>
                <Text style={styles.providerDetail}>
                  {request.provider.serviceType.replace('_', ' ')}
                </Text>
                <Text style={styles.providerDetail}>
                  Vehicle: {request.provider.vehicleNumber}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Request Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Request Details</Text>
          <Text style={styles.detailText}>Type: {request.type.replace('_', ' ')}</Text>
          {request.description && (
            <Text style={styles.detailText}>Description: {request.description}</Text>
          )}
          <Text style={styles.detailText}>
            Time: {new Date(request.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* Cancel Button */}
        {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    height: 300,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusCard: {
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  etaText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  providerText: {
    marginLeft: 12,
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  providerDetail: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmergencyScreen;
