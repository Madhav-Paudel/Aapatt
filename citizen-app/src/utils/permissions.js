import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as Camera from 'expo-camera';
import * as Notifications from 'expo-notifications';

export const requestPermissions = async () => {
  const permissions = [];

  // Location permission
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      permissions.push('Location');
    }
  } catch (error) {
    console.error('Location permission error:', error);
    permissions.push('Location');
  }

  // Camera permission
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      permissions.push('Camera');
    }
  } catch (error) {
    console.error('Camera permission error:', error);
    permissions.push('Camera');
  }

  // Notification permission
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      permissions.push('Notifications');
    }
  } catch (error) {
    console.error('Notification permission error:', error);
    permissions.push('Notifications');
  }

  if (permissions.length > 0) {
    Alert.alert(
      'Permissions Required',
      `This app needs access to ${permissions.join(', ')} to function properly. Please enable them in settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
  }

  return permissions.length === 0;
};

export const checkLocationPermission = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Check location permission error:', error);
    return false;
  }
};

export const checkCameraPermission = async () => {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Check camera permission error:', error);
    return false;
  }
};

export const checkNotificationPermission = async () => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Check notification permission error:', error);
    return false;
  }
};