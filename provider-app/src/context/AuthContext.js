/**
 * Provider Authentication Context
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('provider_token');
      const storedUser = await AsyncStorage.getItem('provider_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone) => {
    try {
      const response = await api.login({ phone });
      const { user, token } = response.data;

      if (user.role !== 'PROVIDER') {
        return { success: false, error: 'This account is not registered as a provider' };
      }

      await AsyncStorage.setItem('provider_token', token);
      await AsyncStorage.setItem('provider_user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      api.setAuthToken(token);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('provider_token');
    await AsyncStorage.removeItem('provider_user');
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
