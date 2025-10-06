import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors, statusColors } from '../utils/theme';
import { formatTimeAgo } from '../utils/formatTime';

const RecentRequests = ({ requests, onRequestPress }) => {
  const getStatusColor = (status) => {
    return statusColors[status] || colors.gray;
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Pending',
      ACCEPTED: 'Accepted',
      EN_ROUTE: 'En Route',
      ARRIVED: 'Arrived',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      EXPIRED: 'Expired',
    };
    return statusMap[status] || status;
  };

  const getServiceIcon = (serviceType) => {
    const iconMap = {
      AMBULANCE: '🚑',
      FIRE_BRIGADE: '🚒',
      AIR_AMBULANCE: '🚁',
      POLICE: '👮',
      SECURITY: '🛡️',
    };
    return iconMap[serviceType] || '🚨';
  };

  const renderRequest = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => onRequestPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.requestHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceIcon}>
            {getServiceIcon(item.serviceType)}
          </Text>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceType}>{item.serviceType}</Text>
            <Text style={styles.requestTime}>
              {formatTimeAgo(item.requestedAt)}
            </Text>
          </View>
        </View>
        
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.provider && (
        <View style={styles.providerInfo}>
          <Text style={styles.providerLabel}>Provider:</Text>
          <Text style={styles.providerName}>
            {item.provider.name || 'Unknown'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (requests.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Requests</Text>
      
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 15,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 12,
    color: colors.gray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
    lineHeight: 20,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerLabel: {
    fontSize: 12,
    color: colors.gray,
    marginRight: 5,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.dark,
  },
});

export default RecentRequests;