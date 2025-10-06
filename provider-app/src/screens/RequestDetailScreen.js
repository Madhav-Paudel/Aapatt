import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const RequestDetailScreen = ({ route, navigation }) => {
  const { requestId } = route.params;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const response = await api.getRequest(requestId);
      setRequest(response.data.request);
    } catch (error) {
      Alert.alert('Error', 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this emergency request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Accept',
          onPress: async () => {
            setAccepting(true);
            try {
              await api.acceptRequest(requestId);
              navigation.navigate('Navigation', { requestId });
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to accept request');
            } finally {
              setAccepting(false);
            }
          },
        },
      ]
    );
  };

  const handleDecline = async () => {
    try {
      await api.declineRequest(requestId);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to decline request');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: request.latitude,
          longitude: request.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: request.latitude,
            longitude: request.longitude,
          }}
          title="Emergency Location"
          pinColor="#E53935"
        />
      </MapView>

      <View style={styles.infoContainer}>
        <View style={styles.typeCard}>
          <Text style={styles.typeEmoji}>
            {request.type === 'AMBULANCE' ? '🚑' : request.type === 'FIRE_BRIGADE' ? '🚒' : '🚁'}
          </Text>
          <View style={styles.typeInfo}>
            <Text style={styles.typeText}>{request.type.replace('_', ' ')}</Text>
            <Text style={styles.distanceText}>{request.distance?.toFixed(1)}km away</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={20} color="#757575" />
            <Text style={styles.detailText}>{request.user.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call" size={20} color="#757575" />
            <Text style={styles.detailText}>{request.user.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#757575" />
            <Text style={styles.detailText}>{request.address}</Text>
          </View>
          {request.description && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text" size={20} color="#757575" />
              <Text style={styles.detailText}>{request.description}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Ionicons name="time" size={20} color="#757575" />
            <Text style={styles.detailText}>
              ETA: ~{request.estimatedTime || 0} minutes
            </Text>
          </View>
        </View>

        {request.status === 'PENDING' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={handleDecline}
              disabled={accepting}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { height: 300 },
  infoContainer: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  typeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  typeEmoji: { fontSize: 48, marginRight: 16 },
  typeInfo: { flex: 1 },
  typeText: { fontSize: 20, fontWeight: 'bold', color: '#E53935' },
  distanceText: { fontSize: 16, color: '#1565C0', marginTop: 4 },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: { fontSize: 14, color: '#424242', marginLeft: 12, flex: 1 },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: { backgroundColor: '#43A047' },
  declineButton: { backgroundColor: '#757575' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default RequestDetailScreen;
