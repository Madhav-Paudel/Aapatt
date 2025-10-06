import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

const LocationContext = createContext();

const initialState = {
  currentLocation: null,
  isLocationEnabled: false,
  isLocationLoading: false,
  locationError: null,
  watchId: null,
};

const locationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLocationLoading: action.payload };
    case 'SET_LOCATION':
      return {
        ...state,
        currentLocation: action.payload,
        isLocationEnabled: true,
        isLocationLoading: false,
        locationError: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        locationError: action.payload,
        isLocationLoading: false,
        isLocationEnabled: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        locationError: null,
      };
    case 'SET_WATCH_ID':
      return {
        ...state,
        watchId: action.payload,
      };
    case 'CLEAR_WATCH':
      return {
        ...state,
        watchId: null,
      };
    default:
      return state;
  }
};

export const LocationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  useEffect(() => {
    getCurrentLocation();
    return () => {
      stopLocationWatching();
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Location services are disabled');
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 10000,
      });

      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      dispatch({ type: 'SET_LOCATION', payload: currentLocation });
      return { success: true, location: currentLocation };
    } catch (error) {
      console.error('Get current location error:', error);
      const errorMessage = error.message || 'Failed to get current location';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please enable location services and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: getCurrentLocation }
        ]
      );
      
      return { success: false, error: errorMessage };
    }
  };

  const startLocationWatching = async () => {
    try {
      // Check permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Start watching location
      const watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          dispatch({ type: 'SET_LOCATION', payload: currentLocation });
        }
      );

      dispatch({ type: 'SET_WATCH_ID', payload: watchId });
      return { success: true, watchId };
    } catch (error) {
      console.error('Start location watching error:', error);
      const errorMessage = error.message || 'Failed to start location tracking';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const stopLocationWatching = () => {
    if (state.watchId) {
      Location.stopWatchPositionAsync(state.watchId);
      dispatch({ type: 'CLEAR_WATCH' });
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        return { success: true };
      } else {
        throw new Error('Location permission denied');
      }
    } catch (error) {
      console.error('Request location permission error:', error);
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    getCurrentLocation,
    startLocationWatching,
    stopLocationWatching,
    requestLocationPermission,
    clearError,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};