import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket = null;

export const connectSocket = (userId = null) => {
  try {
    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }

    // Connect to backend socket server
    socket = io('http://localhost:3000', {
      transports: ['websocket'],
      timeout: 20000,
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
      
      // Join user room if userId provided
      if (userId) {
        socket.emit('joinUser', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  } catch (error) {
    console.error('Error connecting to socket:', error);
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const initializeSocket = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const userProfile = await AsyncStorage.getItem('userProfile');
    
    if (token && userProfile) {
      const user = JSON.parse(userProfile);
      return connectSocket(user.id);
    }
    
    return null;
  } catch (error) {
    console.error('Error initializing socket:', error);
    return null;
  }
};

// Emergency-specific socket events
export const joinEmergencyRoom = (emergencyId) => {
  if (socket) {
    socket.emit('joinEmergency', emergencyId);
  }
};

export const leaveEmergencyRoom = (emergencyId) => {
  if (socket) {
    socket.emit('leaveEmergency', emergencyId);
  }
};

export const sendLocationUpdate = (location) => {
  if (socket) {
    socket.emit('locationUpdate', location);
  }
};

// Event listeners
export const onProviderAccepted = (callback) => {
  if (socket) {
    socket.on('providerAccepted', callback);
  }
};

export const onProviderLocationUpdate = (callback) => {
  if (socket) {
    socket.on('providerLocationUpdate', callback);
  }
};

export const onEmergencyStatusUpdate = (callback) => {
  if (socket) {
    socket.on('emergencyStatusUpdate', callback);
  }
};

export const onProviderMessage = (callback) => {
  if (socket) {
    socket.on('providerMessage', callback);
  }
};

// Clean up listeners
export const removeAllListeners = () => {
  if (socket) {
    socket.removeAllListeners();
  }
};

export const getSocket = () => socket;

export default {
  connectSocket,
  disconnectSocket,
  initializeSocket,
  joinEmergencyRoom,
  leaveEmergencyRoom,
  sendLocationUpdate,
  onProviderAccepted,
  onProviderLocationUpdate,
  onEmergencyStatusUpdate,
  onProviderMessage,
  removeAllListeners,
  getSocket
};