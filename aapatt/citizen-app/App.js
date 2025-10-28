import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import FirstAidScreen from './src/screens/FirstAidScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';

// Import services
import { authService } from './src/services/authService';
import { socketService } from './src/services/socketService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E53935' }}>
    <ActivityIndicator size="large" color="#FFFFFF" />
    <Text style={{ color: '#FFFFFF', marginTop: 16, fontSize: 16 }}>Loading Aapatt...</Text>
  </View>
);

const EmergencyStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="EmergencyHome"
      component={EmergencyScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Emergency') {
          iconName = focused ? 'medical' : 'medical-outline';
        } else if (route.name === 'FirstAid') {
          iconName = focused ? 'camera' : 'camera-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'time' : 'time-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#E53935',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E8E8E8',
        paddingBottom: 5,
        paddingTop: 5,
      },
      headerStyle: {
        backgroundColor: '#E53935',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Aapatt - Emergency Services' }}
    />
    <Tab.Screen
      name="Emergency"
      component={EmergencyStack}
      options={{ title: 'Active Emergency' }}
    />
    <Tab.Screen
      name="FirstAid"
      component={FirstAidScreen}
      options={{ title: 'AI First Aid' }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{ title: 'Emergency History' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is already authenticated
      const isLoggedIn = await authService.isAuthenticated();
      setIsAuthenticated(isLoggedIn);

      if (isLoggedIn) {
        // Initialize socket connection
        await socketService.connect();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#E53935" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}