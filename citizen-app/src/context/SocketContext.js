/**
 * Socket Context
 * Manages real-time Socket.IO connections
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:3000';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user]);

  const connectSocket = () => {
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);

      // Authenticate socket
      newSocket.emit('authenticate', {
        userId: user.id,
        role: user.role,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  };

  const joinRequest = (requestId) => {
    if (socket && connected) {
      socket.emit('join_request', requestId);
    }
  };

  const leaveRequest = (requestId) => {
    if (socket && connected) {
      socket.emit('leave_request', requestId);
    }
  };

  const onRequestUpdate = (callback) => {
    if (socket) {
      socket.on('request_updated', callback);
      return () => socket.off('request_updated', callback);
    }
  };

  const onProviderLocationUpdate = (callback) => {
    if (socket) {
      socket.on('provider_location_update', callback);
      return () => socket.off('provider_location_update', callback);
    }
  };

  const onETAUpdate = (callback) => {
    if (socket) {
      socket.on('eta_update', callback);
      return () => socket.off('eta_update', callback);
    }
  };

  const value = {
    socket,
    connected,
    joinRequest,
    leaveRequest,
    onRequestUpdate,
    onProviderLocationUpdate,
    onETAUpdate,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
