import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocation } from '../services/LocationContext';
import { colors } from '../utils/theme';

const LocationStatus = () => {
  const { currentLocation, isLocationEnabled, locationError, getCurrentLocation } = useLocation();

  const handleRetry = () => {
    getCurrentLocation();
  };

  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📍</Text>
        <View style={styles.errorTextContainer}>
          <Text style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.errorMessage}>
            {locationError}
          </Text>
        </View>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLocationEnabled) {
    return (
      <View style={styles.warningContainer}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <View style={styles.warningTextContainer}>
          <Text style={styles.warningTitle}>Location Disabled</Text>
          <Text style={styles.warningMessage}>
            Enable location services to send emergency requests
          </Text>
        </View>
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🔄</Text>
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.successContainer}>
      <Text style={styles.successIcon}>✅</Text>
      <View style={styles.successTextContainer}>
        <Text style={styles.successTitle}>Location Ready</Text>
        <Text style={styles.successMessage}>
          Accuracy: {Math.round(currentLocation.accuracy)}m
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  errorIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  errorMessage: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  warningMessage: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info,
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  loadingIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  successIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  successMessage: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
});

export default LocationStatus;