import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import FirstAidScreen from './src/screens/FirstAidScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';

// Services
import { initializeNotifications } from './src/services/notifications';
import { initializeSocket } from './src/services/socket';
import { checkAuthToken } from './src/services/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tabs for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Emergency') {
            iconName = 'local-hospital';
          } else if (route.name === 'FirstAid') {
            iconName = 'healing';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#E53935',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Aapatt - Emergency',
          headerTitle: '🚨 Aapatt Emergency'
        }}
      />
      <Tab.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{
          title: 'Active Request',
          headerTitle: 'Emergency Status'
        }}
      />
      <Tab.Screen 
        name="FirstAid" 
        component={FirstAidScreen}
        options={{
          title: 'First Aid',
          headerTitle: 'AI First Aid Assistant'
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          title: 'History',
          headerTitle: 'Request History'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'My Profile'
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize notifications
      await initializeNotifications();

      // Check authentication
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const isValid = await checkAuthToken(token);
        setIsAuthenticated(isValid);
        
        if (isValid) {
          // Initialize socket connection for authenticated users
          initializeSocket(token);
        }
      }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (token) => {
    setIsAuthenticated(true);
    initializeSocket(token);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    AsyncStorage.removeItem('authToken');
  };

  if (isLoading) {
    return null; // Or a loading screen component
  }

  const theme = {
    colors: {
      primary: '#E53935',
      accent: '#1565C0',
      background: '#f5f5f5',
      surface: '#ffffff',
      text: '#000000',
      disabled: '#9e9e9e',
      placeholder: '#757575',
      backdrop: 'rgba(0, 0, 0, 0.5)',
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#E53935" />
          {isAuthenticated ? (
            <MainTabs />
          ) : (
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#E53935',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="Login" 
                options={{
                  title: '🚨 Aapatt - Emergency Response',
                  headerTitle: 'Aapatt Emergency System'
                }}
              >
                {(props) => (
                  <LoginScreen {...props} onLogin={handleLogin} />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}