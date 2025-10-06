import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Location permissions and services
export const requestLocationPermissions = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Foreground location permission denied');
      return false;
    }

    // Request background location permission for emergency tracking
    let backgroundStatus = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus.status !== 'granted') {
      console.log('Background location permission denied');
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

// Get current location with high accuracy
export const getCurrentLocation = async () => {
  try {
    const hasPermission = await checkLocationPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 10000,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

// Check if location permissions are granted
export const checkLocationPermissions = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permissions:', error);
    return false;
  }
};

// Watch position for real-time tracking (used during emergencies)
export const watchUserLocation = (callback, options = {}) => {
  const defaultOptions = {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000, // Update every 5 seconds
    distanceInterval: 10, // Update every 10 meters
    ...options
  };

  return Location.watchPositionAsync(defaultOptions, (location) => {
    const locationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
      heading: location.coords.heading,
      speed: location.coords.speed
    };
    
    callback(locationData);
  });
};

// Reverse geocoding to get address from coordinates
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });

    if (reverseGeocode && reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      return {
        formattedAddress: `${address.name || ''} ${address.street || ''}, ${address.city || ''}, ${address.region || ''}`,
        street: address.street,
        city: address.city,
        region: address.region,
        country: address.country,
        postalCode: address.postalCode,
        name: address.name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Save location to storage for offline use
export const saveLocationToStorage = async (location) => {
  try {
    await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(location));
  } catch (error) {
    console.error('Error saving location to storage:', error);
  }
};

// Get last known location from storage
export const getLastKnownLocation = async () => {
  try {
    const location = await AsyncStorage.getItem('lastKnownLocation');
    return location ? JSON.parse(location) : null;
  } catch (error) {
    console.error('Error getting last known location:', error);
    return null;
  }
};

// Check if location services are enabled
export const isLocationEnabled = async () => {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
};

// Start background location updates (for emergency tracking)
export const startBackgroundLocationUpdates = async (taskName = 'emergency-location-tracking') => {
  try {
    const hasPermission = await checkLocationPermissions();
    if (!hasPermission) {
      throw new Error('Location permission required for background tracking');
    }

    const isLocationServiceEnabled = await isLocationEnabled();
    if (!isLocationServiceEnabled) {
      throw new Error('Location services are disabled');
    }

    await Location.startLocationUpdatesAsync(taskName, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // Every 10 seconds
      distanceInterval: 20, // Every 20 meters
      deferredUpdatesInterval: 30000, // Send batch updates every 30 seconds
      foregroundService: {
        notificationTitle: 'Aapatt Emergency Tracking',
        notificationBody: 'Location is being tracked for your safety during emergency',
        notificationColor: '#ff0000'
      }
    });

    console.log('Background location tracking started');
    return true;
  } catch (error) {
    console.error('Error starting background location updates:', error);
    return false;
  }
};

// Stop background location updates
export const stopBackgroundLocationUpdates = async (taskName = 'emergency-location-tracking') => {
  try {
    const isTaskDefined = await Location.hasStartedLocationUpdatesAsync(taskName);
    if (isTaskDefined) {
      await Location.stopLocationUpdatesAsync(taskName);
      console.log('Background location tracking stopped');
    }
    return true;
  } catch (error) {
    console.error('Error stopping background location updates:', error);
    return false;
  }
};

// Format location for display
export const formatLocationForDisplay = (location) => {
  if (!location) return 'Location unavailable';
  
  const { latitude, longitude, accuracy } = location;
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`;
};

// Check if location is within emergency service area
export const isLocationInServiceArea = (userLocation, serviceAreas) => {
  if (!userLocation || !serviceAreas || serviceAreas.length === 0) {
    return false;
  }

  // Check if user location is within any of the service areas
  for (const area of serviceAreas) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      area.latitude,
      area.longitude
    );
    
    if (distance <= area.radius) {
      return true;
    }
  }
  
  return false;
};

export default {
  requestLocationPermissions,
  getCurrentLocation,
  checkLocationPermissions,
  watchUserLocation,
  getAddressFromCoordinates,
  calculateDistance,
  saveLocationToStorage,
  getLastKnownLocation,
  isLocationEnabled,
  startBackgroundLocationUpdates,
  stopBackgroundLocationUpdates,
  formatLocationForDisplay,
  isLocationInServiceArea
};