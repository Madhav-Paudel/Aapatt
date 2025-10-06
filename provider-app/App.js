/**
 * Aapatt Provider App
 * For emergency service providers
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RequestDetailScreen from './src/screens/RequestDetailScreen';
import NavigationScreen from './src/screens/NavigationScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1565C0',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ title: 'Aapatt Provider' }}
            />
            <Stack.Screen 
              name="RequestDetail" 
              component={RequestDetailScreen}
              options={{ title: 'Emergency Request' }}
            />
            <Stack.Screen 
              name="Navigation" 
              component={NavigationScreen}
              options={{ title: 'Navigation' }}
            />
            <Stack.Screen 
              name="History" 
              component={HistoryScreen}
              options={{ title: 'Job History' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ title: 'Aapatt Provider Login' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </SocketProvider>
    </AuthProvider>
  );
}
