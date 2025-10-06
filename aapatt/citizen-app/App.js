import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import FirstAidScreen from './src/screens/FirstAidScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import services
import { AuthService } from './src/services/AuthService';
import { LocationService } from './src/services/LocationService';
import { NotificationService } from './src/services/NotificationService';
import { SocketService } from './src/services/SocketService';

// Import theme
import { theme } from './src/theme';

const Stack = createStackNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request permissions
      await requestPermissions();
      
      // Initialize services
      await LocationService.initialize();
      await NotificationService.initialize();
      
      // Check authentication
      const authUser = await AuthService.getCurrentUser();
      if (authUser) {
        setUser(authUser);
        setIsAuthenticated(true);
        await SocketService.connect(authUser.id);
      }
      
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert('Error', 'Failed to initialize app. Please restart.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      // Location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required for emergency services.');
      }

      // Camera permission
      const { status: cameraStatus } = await Location.requestForegroundPermissionsAsync();
      if (cameraStatus !== 'granted') {
        console.log('Camera permission not granted');
      }

      // Notification permission
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        console.log('Notification permission not granted');
      }

    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    await SocketService.connect(userData.id);
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      await SocketService.disconnect();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#E53935" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#E53935',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 20,
              },
            }}
          >
            {!isAuthenticated ? (
              <Stack.Screen
                name="Auth"
                component={AuthScreen}
                options={{ headerShown: false }}
                initialParams={{ onAuthSuccess: handleAuthSuccess }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    title: 'Aapatt',
                    headerLeft: null,
                  }}
                />
                <Stack.Screen
                  name="Emergency"
                  component={EmergencyScreen}
                  options={{
                    title: 'Emergency Request',
                    headerBackTitle: 'Back',
                  }}
                />
                <Stack.Screen
                  name="FirstAid"
                  component={FirstAidScreen}
                  options={{
                    title: 'First Aid Assistant',
                    headerBackTitle: 'Back',
                  }}
                />
                <Stack.Screen
                  name="History"
                  component={HistoryScreen}
                  options={{
                    title: 'Request History',
                    headerBackTitle: 'Back',
                  }}
                />
                <Stack.Screen
                  name="Profile"
                  component={ProfileScreen}
                  options={{
                    title: 'Profile',
                    headerBackTitle: 'Back',
                  }}
                  initialParams={{ onLogout: handleLogout }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}