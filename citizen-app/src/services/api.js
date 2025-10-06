import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API Configuration
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      // You might want to redirect to login here
    }
    
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Network error',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Authentication APIs
export const authenticateCitizen = async (phoneNumber, otpToken, firebaseUid, name, deviceToken) => {
  try {
    const response = await api.post('/api/auth/citizen', {
      phoneNumber,
      otpToken,
      firebaseUid,
      name,
      deviceToken
    });
    
    if (response.success && response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export const checkAuthToken = async (token) => {
  try {
    const response = await api.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.success;
  } catch (error) {
    return false;
  }
};

export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    return true;
  } catch (error) {
    // Even if API call fails, clear local storage
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    return true;
  }
};

// Emergency Request APIs
export const createEmergencyRequest = async (requestData) => {
  try {
    const response = await api.post('/api/requests', requestData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getEmergencyRequest = async (requestId) => {
  try {
    const response = await api.get(`/api/requests/${requestId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getRequestHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/api/requests/history?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateRequestStatus = async (requestId, status, message) => {
  try {
    const response = await api.patch(`/api/requests/${requestId}/status`, {
      status,
      message
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// AI First Aid APIs
export const analyzeInjury = async (imageBase64, description) => {
  try {
    const response = await api.post('/api/ai/analyze-injury', {
      image: imageBase64,
      description
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getFirstAidSteps = async (injuryType) => {
  try {
    const response = await api.get(`/api/ai/first-aid/${injuryType}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// User Profile APIs
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/user/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/api/user/profile', profileData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateEmergencyContacts = async (contacts) => {
  try {
    const response = await api.put('/api/user/emergency-contacts', {
      emergencyContacts: contacts
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Utility functions
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  } catch (error) {
    return false;
  }
};

// Export api instance for custom requests
export { api };

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw error;
  }
};