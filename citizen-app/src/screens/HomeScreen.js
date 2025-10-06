/**
 * Aapatt Emergency Superapp - Home Screen
 * Main screen with emergency buttons and quick access features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  TouchableOpacity,
  Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

import { theme, emergencyStyles } from '../theme/theme';
import { useAuth } from '../services/authService';
import { useLocation } from '../services/locationService';
import { apiService } from '../services/apiService';
import { EMERGENCY_TYPES, APP_NAME, APP_NAME_SANSKRIT } from '@aapatt/shared';
import EmergencyButton from '../components/EmergencyButton';
import LocationDisplay from '../components/LocationDisplay';
import QuickActions from '../components/QuickActions';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { location, address, isLoading: locationLoading } = useLocation();
  
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    if (location) {
      loadNearbyProviders();
    }
  }, [location]);

  useEffect(() => {
    // Check for active emergency request
    checkActiveRequest();
  }, []);

  const loadNearbyProviders = async () => {
    try {
      const response = await apiService.getNearbyProviders(location, 10);
      setNearbyProviders(response.data.data.providers || []);
    } catch (error) {
      console.error('Error loading nearby providers:', error);
    }
  };

  const checkActiveRequest = async () => {
    try {
      const response = await apiService.getMyRequests({ status: 'active' });
      const activeRequests = response.data.data.requests.filter(
        req => ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'].includes(req.status)
      );
      
      if (activeRequests.length > 0) {
        setActiveRequest(activeRequests[0]);
      }
    } catch (error) {
      console.error('Error checking active request:', error);
    }
  };

  const handleEmergencyPress = async (emergencyType) => {
    try {
      // Vibrate for emergency button press
      Vibration.vibrate([0, 100, 50, 100]);

      if (!location) {
        Alert.alert(
          'Location Required',
          'We need your location to send emergency services. Please enable location access.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enable Location', onPress: requestLocationPermission }
          ]
        );
        return;
      }

      if (activeRequest) {
        Alert.alert(
          'Active Emergency',
          'You already have an active emergency request. Do you want to view it?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'View Request', onPress: () => navigation.navigate('Emergency', { requestId: activeRequest.id }) }
          ]
        );
        return;
      }

      // Show confirmation dialog
      const emergencyInfo = EMERGENCY_TYPES[emergencyType.toUpperCase()];
      Alert.alert(
        `Request ${emergencyInfo.name}?`,
        `This will send an emergency request for ${emergencyInfo.description}. Emergency services will be notified immediately.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'CONFIRM EMERGENCY', 
            style: 'destructive',
            onPress: () => createEmergencyRequest(emergencyType)
          }
        ]
      );

    } catch (error) {
      console.error('Emergency button press error:', error);
      Alert.alert('Error', 'Failed to process emergency request. Please try again.');
    }
  };

  const createEmergencyRequest = async (emergencyType) => {
    try {
      setIsCreatingRequest(true);

      // Navigate to emergency screen to get description
      navigation.navigate('Emergency', {
        emergencyType,
        location,
        address
      });

    } catch (error) {
      console.error('Error creating emergency request:', error);
      Alert.alert('Error', 'Failed to create emergency request. Please try again.');
    } finally {
      setIsCreatingRequest(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for emergency services to find you.'
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const getProviderStats = () => {
    const stats = {
      ambulance: 0,
      fire: 0,
      air_ambulance: 0
    };

    nearbyProviders.forEach(provider => {
      if (stats.hasOwnProperty(provider.type.toLowerCase())) {
        stats[provider.type.toLowerCase()]++;
      }
    });

    return stats;
  };

  const providerStats = getProviderStats();

  if (isCreatingRequest) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Creating Emergency Request...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.appNameSanskrit}>{APP_NAME_SANSKRIT}</Text>
          <Text style={styles.tagline}>Emergency services at your fingertips</Text>
        </View>

        {/* Active Request Alert */}
        {activeRequest && (
          <Card style={[styles.card, emergencyStyles.emergencyCard]}>
            <Card.Content>
              <Text style={styles.activeRequestTitle}>Active Emergency Request</Text>
              <Text style={styles.activeRequestType}>{activeRequest.type}</Text>
              <Text style={styles.activeRequestStatus}>Status: {activeRequest.status}</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Emergency', { requestId: activeRequest.id })}
                style={styles.viewRequestButton}
              >
                View Request
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Location Display */}
        <LocationDisplay 
          location={location}
          address={address}
          isLoading={locationLoading}
        />

        {/* Emergency Buttons */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Services</Text>
          <Text style={styles.sectionSubtitle}>Tap for immediate emergency assistance</Text>
          
          <View style={styles.emergencyButtonsContainer}>
            {Object.entries(EMERGENCY_TYPES).map(([key, emergency]) => (
              <EmergencyButton
                key={key}
                type={key}
                emergency={emergency}
                onPress={handleEmergencyPress}
                availableProviders={providerStats[key.toLowerCase()] || 0}
                disabled={!location}
              />
            ))}
          </View>
        </View>

        {/* Provider Availability */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Available Emergency Services</Text>
            <View style={styles.providerStatsContainer}>
              {Object.entries(EMERGENCY_TYPES).map(([key, emergency]) => (
                <View key={key} style={styles.providerStat}>
                  <Text style={styles.providerIcon}>{emergency.icon}</Text>
                  <Text style={styles.providerCount}>
                    {providerStats[key.toLowerCase()] || 0}
                  </Text>
                  <Text style={styles.providerLabel}>Available</Text>
                </View>
              ))}
            </View>
            {nearbyProviders.length === 0 && !locationLoading && (
              <Text style={styles.noProvidersText}>
                No emergency services available in your area. Please try again or contact local authorities.
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <QuickActions navigation={navigation} />

        {/* Safety Tips */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Safety Tips</Text>
            <View style={styles.tipsContainer}>
              <Text style={styles.tip}>• Stay calm during emergencies</Text>
              <Text style={styles.tip}>• Provide clear location information</Text>
              <Text style={styles.tip}>• Follow first-aid guidance while waiting</Text>
              <Text style={styles.tip}>• Keep emergency contacts updated</Text>
            </View>
          </Card.Content>
        </Card>

        {/* User Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Account Information</Text>
            <View style={styles.userInfoContainer}>
              <Text style={styles.userInfo}>Name: {user?.name}</Text>
              <Text style={styles.userInfo}>Phone: {user?.phoneNumber}</Text>
              <Chip 
                icon="check-circle" 
                style={styles.verifiedChip}
                textStyle={styles.verifiedText}
              >
                Verified Account
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.onBackground,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    marginBottom: theme.spacing.xs,
  },
  appNameSanskrit: {
    fontSize: 18,
    color: theme.colors.onPrimary,
    opacity: 0.9,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.onPrimary,
    opacity: 0.8,
    textAlign: 'center',
  },
  emergencySection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.lg,
  },
  emergencyButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    ...emergencyStyles.card,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  activeRequestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  activeRequestType: {
    fontSize: 14,
    color: theme.colors.onErrorContainer,
    marginBottom: theme.spacing.xs,
  },
  activeRequestStatus: {
    fontSize: 14,
    color: theme.colors.onErrorContainer,
    marginBottom: theme.spacing.md,
  },
  viewRequestButton: {
    backgroundColor: theme.colors.error,
  },
  providerStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  providerStat: {
    alignItems: 'center',
    flex: 1,
  },
  providerIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  providerCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  providerLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  noProvidersText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: theme.spacing.md,
  },
  tipsContainer: {
    paddingLeft: theme.spacing.sm,
  },
  tip: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  userInfoContainer: {
    gap: theme.spacing.sm,
  },
  userInfo: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  verifiedChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.successContainer,
  },
  verifiedText: {
    color: theme.colors.onSuccessContainer,
  },
});