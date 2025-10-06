/**
 * Socket Context for Provider App
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:3000';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.provider) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => disconnectSocket();
  }, [user]);

  const connectSocket = () => {
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);

      newSocket.emit('authenticate', {
        userId: user.id,
        role: user.role,
        providerId: user.provider.id,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
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

  const onNewRequest = (callback) => {
    if (socket) {
      socket.on('new_request', callback);
      return () => socket.off('new_request', callback);
    }
  };

  const updateLocation = (latitude, longitude, requestId) => {
    if (socket && connected) {
      socket.emit('provider:location_update', {
        providerId: user.provider.id,
        latitude,
        longitude,
        requestId,
      });
    }
  };

  const value = {
    socket,
    connected,
    onNewRequest,
    updateLocation,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
