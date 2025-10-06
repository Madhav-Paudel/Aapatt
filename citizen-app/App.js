import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import { AuthProvider } from './src/services/AuthContext';
import { LocationProvider } from './src/services/LocationContext';
import { SocketProvider } from './src/services/SocketContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/utils/theme';
import { requestPermissions } from './src/utils/permissions';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Request permissions
        await requestPermissions();
        
        // Configure location services
        await Location.setForegroundPermissionsAsync({
          ios: 'whenInUse',
          android: 'whenInUse'
        });

        // Configure notifications
        if (Device.isDevice) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          
          if (finalStatus !== 'granted') {
            Alert.alert(
              'Permission Required',
              'Please enable notifications to receive emergency updates.'
            );
          }
        }

        setIsReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize the app. Please restart and try again.'
        );
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#E53935" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <LocationProvider>
          <SocketProvider>
            <NavigationContainer>
              <AppNavigator />
              <Toast />
            </NavigationContainer>
          </SocketProvider>
        </LocationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E53935',
  },
});