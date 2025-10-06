import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Card, Title, Paragraph, Chip, Button, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { getEmergencyHistory } from '../services/api';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterEmergencies();
  }, [emergencies, searchQuery]);

  const loadHistory = async () => {
    try {
      const history = await getEmergencyHistory();
      setEmergencies(history);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const filterEmergencies = () => {
    if (!searchQuery) {
      setFilteredEmergencies(emergencies);
      return;
    }

    const filtered = emergencies.filter(emergency =>
      emergency.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emergency.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emergency.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEmergencies(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return '#4CAF50';
      case 'CANCELLED':
        return '#757575';
      case 'PENDING':
        return '#FFA726';
      default:
        return '#2196F3';
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

  const viewEmergencyDetails = (emergency) => {
    if (emergency.status !== 'COMPLETED' && emergency.status !== 'CANCELLED') {
      navigation.navigate('Emergency', {
        emergencyId: emergency.id,
        emergencyType: emergency.type
      });
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search emergency history..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredEmergencies.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="history" size={64} color="#ccc" />
              <Title style={styles.emptyTitle}>No Emergency History</Title>
              <Paragraph style={styles.emptyText}>
                Your emergency requests will appear here once you make them.
              </Paragraph>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Home')}
                style={styles.homeButton}
              >
                Request Emergency Help
              </Button>
            </Card.Content>
          </Card>
        ) : (
          filteredEmergencies.map((emergency) => (
            <Card 
              key={emergency.id} 
              style={styles.emergencyCard}
              onPress={() => viewEmergencyDetails(emergency)}
            >
              <Card.Content>
                <View style={styles.emergencyHeader}>
                  <View style={styles.emergencyTitleRow}>
                    <Text style={styles.emergencyIcon}>
                      {getEmergencyIcon(emergency.type)}
                    </Text>
                    <View style={styles.emergencyInfo}>
                      <Title style={styles.emergencyTitle}>
                        {emergency.type.replace('_', ' ')}
                      </Title>
                      <Text style={styles.emergencyDate}>
                        {new Date(emergency.createdAt).toLocaleDateString()} at{' '}
                        {new Date(emergency.createdAt).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Chip 
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(emergency.status) + '20' }
                      ]}
                      textStyle={[
                        styles.statusText,
                        { color: getStatusColor(emergency.status) }
                      ]}
                    >
                      {emergency.status}
                    </Chip>
                  </View>
                </View>

                <View style={styles.emergencyDetails}>
                  {emergency.address && (
                    <View style={styles.detailRow}>
                      <Icon name="location-on" size={16} color="#666" />
                      <Text style={styles.detailText}>{emergency.address}</Text>
                    </View>
                  )}

                  {emergency.provider && (
                    <View style={styles.detailRow}>
                      <Icon name="person" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Handled by: {emergency.provider.name}
                      </Text>
                    </View>
                  )}

                  {emergency.responseTime && (
                    <View style={styles.detailRow}>
                      <Icon name="access-time" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Response time: {emergency.responseTime} minutes
                      </Text>
                    </View>
                  )}

                  {emergency.description && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionText}>
                        "{emergency.description}"
                      </Text>
                    </View>
                  )}
                </View>

                {emergency.status !== 'COMPLETED' && emergency.status !== 'CANCELLED' && (
                  <View style={styles.actionContainer}>
                    <Button 
                      mode="outlined" 
                      onPress={() => viewEmergencyDetails(emergency)}
                      icon="visibility"
                    >
                      View Details
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  emptyCard: {
    margin: 16,
    elevation: 4,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  homeButton: {
    marginTop: 16,
    backgroundColor: '#E53935',
  },
  emergencyCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  emergencyHeader: {
    marginBottom: 12,
  },
  emergencyTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  emergencyDate: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emergencyDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E53935',
  },
  descriptionText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
  },
  actionContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default HistoryScreen;