/**
 * Socket Service Provider
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import Constants from 'expo-constants';
import { useAuth } from './authService';

const SocketContext = createContext({});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { tokens } = useAuth();

  useEffect(() => {
    if (tokens?.accessToken) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => disconnectSocket();
  }, [tokens]);

  const connectSocket = () => {
    const socketUrl = Constants.expoConfig?.extra?.socketUrl || 'http://localhost:3000';
    
    const newSocket = io(socketUrl, {
      auth: {
        token: tokens.accessToken
      },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected
    }}>
      {children}
    </SocketContext.Provider>
  );
};