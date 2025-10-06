import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear stored auth data
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
      
      // You might want to redirect to login screen here
      // navigationRef.current?.reset({
      //   index: 0,
      //   routes: [{ name: 'Login' }],
      // });
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

// Emergency request service
export const emergencyService = {
  createRequest: async (requestData) => {
    try {
      const response = await apiService.post('/requests', requestData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUserRequests: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/requests?${queryString}` : '/requests';
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getRequest: async (requestId) => {
    try {
      const response = await apiService.get(`/requests/${requestId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  cancelRequest: async (requestId) => {
    try {
      const response = await apiService.put(`/requests/${requestId}/cancel`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// AI service
export const aiService = {
  analyzeInjury: async (imageBase64, requestId) => {
    try {
      const response = await apiService.post('/ai/analyze-injury', {
        image: imageBase64,
        requestId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getFirstAidGuidance: async (injuryType) => {
    try {
      const response = await apiService.get(`/ai/first-aid/${injuryType}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getInjuryTypes: async () => {
    try {
      const response = await apiService.get('/ai/injury-types');
      return response;
    } catch (error) {
      throw error;
    }
  },

  checkEmergency: async (injuryType, severity, symptoms) => {
    try {
      const response = await apiService.post('/ai/check-emergency', {
        injuryType,
        severity,
        symptoms,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getEmergencyAssessment: async (assessmentData) => {
    try {
      const response = await apiService.post('/ai/emergency-assessment', assessmentData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// Location service
export const locationService = {
  reverseGeocode: async (latitude, longitude) => {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'Aapatt-Emergency-App/1.0'
          }
        }
      );
      
      const data = await response.json();
      return {
        success: true,
        address: data.display_name || 'Unknown location',
        components: data.address || {}
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        success: false,
        address: 'Unknown location',
        error: error.message
      };
    }
  },

  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  },

  formatDistance: (distanceInMeters) => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  },
};

export default apiService;