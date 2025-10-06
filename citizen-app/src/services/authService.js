/**
 * Aapatt Emergency Superapp - Authentication Service
 * Handles user authentication, token management, and auth state
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';
import { STORAGE_KEYS } from '../constants/storage';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState(null);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [storedUser, storedTokens] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKENS)
      ]);

      if (storedUser && storedTokens) {
        const userData = JSON.parse(storedUser);
        const tokenData = JSON.parse(storedTokens);
        
        // Check if tokens are still valid
        if (tokenData.accessToken && !isTokenExpired(tokenData.accessToken)) {
          setUser(userData);
          setTokens(tokenData);
          apiService.setAuthToken(tokenData.accessToken);
        } else {
          // Try to refresh token
          await refreshTokens(tokenData.refreshToken);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (phoneNumber) => {
    try {
      const response = await apiService.post('/auth/login', { phoneNumber });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (phoneNumber, otp, deviceId) => {
    try {
      const response = await apiService.post('/auth/verify-otp', {
        phoneNumber,
        otp,
        deviceId
      });

      const { user: userData, tokens: tokenData } = response.data.data;
      
      // Store user and tokens
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokenData))
      ]);

      setUser(userData);
      setTokens(tokenData);
      apiService.setAuthToken(tokenData.accessToken);

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const refreshTokens = async (refreshToken) => {
    try {
      const response = await apiService.post('/auth/refresh', { refreshToken });
      const { accessToken, expiresIn } = response.data.data;
      
      const newTokens = {
        ...tokens,
        accessToken,
        expiresIn
      };

      await AsyncStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
      setTokens(newTokens);
      apiService.setAuthToken(accessToken);

      return newTokens;
    } catch (error) {
      // Refresh failed, logout user
      await logout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API if tokens exist
      if (tokens?.accessToken) {
        await apiService.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKENS),
        AsyncStorage.removeItem(STORAGE_KEYS.LOCATION)
      ]);

      setUser(null);
      setTokens(null);
      apiService.setAuthToken(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.put('/auth/profile', profileData);
      const updatedUser = response.data.data.user;
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const getProfile = async () => {
    try {
      const response = await apiService.get('/auth/profile');
      const userData = response.data.data.user;
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const resendOTP = async (phoneNumber) => {
    try {
      const response = await apiService.post('/auth/resend-otp', { phoneNumber });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    verifyOTP,
    logout,
    updateProfile,
    getProfile,
    resendOTP,
    refreshTokens
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};