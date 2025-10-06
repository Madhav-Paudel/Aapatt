import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
import { useLocation } from '../services/LocationContext';
import { useSocket } from '../services/SocketContext';
import { emergencyService } from '../services/apiService';
import { colors, serviceColors } from '../utils/theme';
import EmergencyButton from '../components/EmergencyButton';
import LocationStatus from '../components/LocationStatus';
import QuickActions from '../components/QuickActions';
import RecentRequests from '../components/RecentRequests';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const { currentLocation, isLocationEnabled } = useLocation();
  const { isConnected } = useSocket();
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadRecentRequests();
    }
  }, [isAuthenticated]);

  const loadRecentRequests = async () => {
    try {
      const response = await emergencyService.getUserRequests({ limit: 5 });
      if (response.success) {
        setRecentRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error loading recent requests:', error);
    }
  };

  const handleEmergencyRequest = async (serviceType) => {
    if (!isLocationEnabled) {
      Alert.alert(
        'Location Required',
        'Please enable location services to send emergency requests.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable Location', onPress: () => navigation.navigate('Settings') }
        ]
      );
      return;
    }

    if (!isConnected) {
      Alert.alert(
        'Connection Error',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      
      const requestData = {
        serviceType,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        description: `${serviceType} emergency request`,
        isSecurityAlert: false,
      };

      const response = await emergencyService.createRequest(requestData);
      
      if (response.success) {
        navigation.navigate('EmergencyTracking', {
          requestId: response.data.request.id,
          request: response.data.request,
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to create emergency request');
      }
    } catch (error) {
      console.error('Emergency request error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create emergency request'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const emergencyServices = [
    {
      type: 'AMBULANCE',
      title: 'Ambulance',
      subtitle: 'Medical Emergency',
      icon: '🚑',
      color: serviceColors.AMBULANCE,
      onPress: () => handleEmergencyRequest('AMBULANCE'),
    },
    {
      type: 'FIRE_BRIGADE',
      title: 'Fire Brigade',
      subtitle: 'Fire & Rescue',
      icon: '🚒',
      color: serviceColors.FIRE_BRIGADE,
      onPress: () => handleEmergencyRequest('FIRE_BRIGADE'),
    },
    {
      type: 'AIR_AMBULANCE',
      title: 'Air Ambulance',
      subtitle: 'Critical Cases',
      icon: '🚁',
      color: serviceColors.AIR_AMBULANCE,
      onPress: () => handleEmergencyRequest('AIR_AMBULANCE'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
          <Text style={styles.subtitle}>How can we help you today?</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Status */}
        <LocationStatus />

        {/* Emergency Buttons */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Services</Text>
          <Text style={styles.sectionSubtitle}>
            Tap the service you need in an emergency
          </Text>
          
          <View style={styles.emergencyButtons}>
            {emergencyServices.map((service) => (
              <EmergencyButton
                key={service.type}
                {...service}
                disabled={isLoading || !isLocationEnabled}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <QuickActions navigation={navigation} />

        {/* Recent Requests */}
        {recentRequests.length > 0 && (
          <RecentRequests
            requests={recentRequests}
            onRequestPress={(request) =>
              navigation.navigate('EmergencyTracking', { requestId: request.id })
            }
          />
        )}

        {/* Connection Status */}
        {!isConnected && (
          <View style={styles.connectionWarning}>
            <Text style={styles.warningText}>
              ⚠️ No internet connection. Some features may not work.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
    color: colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: colors.light,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  emergencySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 20,
  },
  emergencyButtons: {
    gap: 15,
  },
  connectionWarning: {
    backgroundColor: colors.warning,
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  warningText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;