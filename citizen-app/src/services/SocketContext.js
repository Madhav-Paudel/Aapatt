import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const SocketContext = createContext();

const initialState = {
  socket: null,
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  lastMessage: null,
};

const socketReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload,
        isConnecting: false,
        connectionError: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        connectionError: action.payload,
        isConnecting: false,
        isConnected: false,
      };
    case 'SET_SOCKET':
      return {
        ...state,
        socket: action.payload,
      };
    case 'SET_LAST_MESSAGE':
      return {
        ...state,
        lastMessage: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        connectionError: null,
      };
    default:
      return state;
  }
};

export const SocketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(socketReducer, initialState);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || 'http://localhost:3000';

  useEffect(() => {
    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  const initializeSocket = async () => {
    try {
      dispatch({ type: 'SET_CONNECTING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create socket connection
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        timeout: 20000,
      });

      // Connection event handlers
      socket.on('connect', () => {
        console.log('Socket connected');
        dispatch({ type: 'SET_CONNECTED', payload: true });
        reconnectAttemptsRef.current = 0;
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        dispatch({ type: 'SET_CONNECTED', payload: false });
        
        // Attempt to reconnect if not manually disconnected
        if (reason !== 'io client disconnect') {
          attemptReconnect();
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        attemptReconnect();
      });

      socket.on('authenticated', (data) => {
        console.log('Socket authenticated:', data);
      });

      socket.on('auth_error', (error) => {
        console.error('Socket auth error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      });

      // Emergency request events
      socket.on('new_emergency_request', (data) => {
        console.log('New emergency request:', data);
        dispatch({ type: 'SET_LAST_MESSAGE', payload: { type: 'new_emergency_request', data } });
      });

      socket.on('request_status_update', (data) => {
        console.log('Request status update:', data);
        dispatch({ type: 'SET_LAST_MESSAGE', payload: { type: 'request_status_update', data } });
      });

      socket.on('provider_location_update', (data) => {
        console.log('Provider location update:', data);
        dispatch({ type: 'SET_LAST_MESSAGE', payload: { type: 'provider_location_update', data } });
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      });

      dispatch({ type: 'SET_SOCKET', payload: socket });
    } catch (error) {
      console.error('Socket initialization error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (state.socket) {
        state.socket.connect();
      } else {
        initializeSocket();
      }
    }, delay);
  };

  const disconnectSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (state.socket) {
      state.socket.disconnect();
      dispatch({ type: 'SET_SOCKET', payload: null });
    }
  };

  const reconnectSocket = async () => {
    disconnectSocket();
    reconnectAttemptsRef.current = 0;
    await initializeSocket();
  };

  const emitEvent = (event, data) => {
    if (state.socket && state.isConnected) {
      state.socket.emit(event, data);
      return true;
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
      return false;
    }
  };

  const onEvent = (event, callback) => {
    if (state.socket) {
      state.socket.on(event, callback);
      return () => state.socket.off(event, callback);
    }
    return () => {};
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    emitEvent,
    onEvent,
    reconnectSocket,
    disconnectSocket,
    clearError,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};