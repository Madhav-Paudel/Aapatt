/**
 * History Screen
 * Shows user's emergency request history
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const HistoryScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.getUserRequests();
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
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

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: 'time',
      ACCEPTED: 'checkmark-circle',
      EN_ROUTE: 'car',
      ARRIVED: 'location',
      COMPLETED: 'checkmark-done',
      CANCELLED: 'close-circle',
    };
    return icons[status] || 'help-circle';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} min ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // More than 24 hours
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => navigation.navigate('Emergency', { requestId: item.id })}
    >
      <View style={styles.requestHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeEmoji}>
            {item.type === 'AMBULANCE' ? '🚑' : item.type === 'FIRE_BRIGADE' ? '🚒' : '🚁'}
          </Text>
          <View>
            <Text style={styles.typeText}>{item.type.replace('_', ' ')}</Text>
            <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="#FFFFFF" />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.provider && (
        <View style={styles.providerSection}>
          <Ionicons name="person" size={16} color="#757575" />
          <Text style={styles.providerText}>{item.provider.user.name}</Text>
        </View>
      )}

      {item.address && (
        <View style={styles.addressSection}>
          <Ionicons name="location" size={16} color="#757575" />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      )}

      {item.estimatedTime && item.status !== 'COMPLETED' && (
        <View style={styles.etaSection}>
          <Ionicons name="time" size={16} color="#757575" />
          <Text style={styles.etaText}>ETA: {item.estimatedTime} minutes</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E53935"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>No emergency requests yet</Text>
            <Text style={styles.emptySubtext}>
              Your request history will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  typeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  timeText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 8,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    flex: 1,
  },
  etaSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaText: {
    fontSize: 14,
    color: '#1565C0',
    marginLeft: 8,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
  },
});

export default HistoryScreen;
