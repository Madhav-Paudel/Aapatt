import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { onNewRequest } = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboard();
    
    const unsubscribe = onNewRequest((request) => {
      Alert.alert(
        'New Emergency Request',
        `${request.type} - ${request.distance?.toFixed(1)}km away`,
        [
          { text: 'Ignore', style: 'cancel' },
          { text: 'View', onPress: () => navigation.navigate('RequestDetail', { requestId: request.id }) }
        ]
      );
    });

    return unsubscribe;
  }, []);

  const loadDashboard = async () => {
    try {
      const [requestsRes, statsRes] = await Promise.all([
        api.getProviderRequests('PENDING'),
        api.getProviderStats()
      ]);
      setRequests(requestsRes.data.requests);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const toggleOnlineStatus = async (value) => {
    try {
      await api.updateStatus(value ? 'ONLINE' : 'OFFLINE');
      setIsOnline(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestType}>{item.type.replace('_', ' ')}</Text>
        <Text style={styles.requestDistance}>{item.distance?.toFixed(1)}km</Text>
      </View>
      <Text style={styles.requestAddress} numberOfLines={2}>{item.address}</Text>
      <View style={styles.requestFooter}>
        <Text style={styles.requestTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        <Ionicons name="chevron-forward" size={20} color="#1565C0" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <View>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={[styles.statusText, { color: isOnline ? '#43A047' : '#757575' }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnlineStatus}
          trackColor={{ false: '#757575', true: '#43A047' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completedJobs}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Emergencies</Text>
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#BDBDBD" />
              <Text style={styles.emptyText}>No emergency requests nearby</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('History')}
      >
        <Ionicons name="time" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusLabel: { fontSize: 14, color: '#757575' },
  statusText: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#1565C0' },
  statLabel: { fontSize: 14, color: '#757575', marginTop: 4 },
  section: { flex: 1, padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#424242', marginBottom: 16 },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  requestType: { fontSize: 16, fontWeight: 'bold', color: '#E53935' },
  requestDistance: { fontSize: 14, color: '#1565C0' },
  requestAddress: { fontSize: 14, color: '#757575', marginBottom: 8 },
  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestTime: { fontSize: 12, color: '#9E9E9E' },
  emptyContainer: { alignItems: 'center', paddingTop: 50 },
  emptyText: { fontSize: 16, color: '#757575', marginTop: 16 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default DashboardScreen;
