import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

class ApiService {
  constructor() {
    this.baseURL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
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

    // Response interceptor to handle common errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        const errorResponse = {
          success: false,
          error: this.getErrorMessage(error),
          status: error.response?.status,
        };

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.handleUnauthorized();
        }

        return Promise.reject(errorResponse);
      }
    );
  }

  getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    if (error.message === 'Network Error') {
      return 'Network error. Please check your internet connection.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }

    return 'An unexpected error occurred. Please try again.';
  }

  async handleUnauthorized() {
    try {
      // Clear stored auth data
      await AsyncStorage.multiRemove(['authToken', 'userProfile']);
      // You might want to trigger a navigation to login screen here
    } catch (error) {
      console.error('Error handling unauthorized:', error);
    }
  }

  // Generic GET request
  async get(endpoint, params = {}) {
    try {
      const response = await this.axiosInstance.get(endpoint, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Generic POST request
  async post(endpoint, data = {}) {
    try {
      const response = await this.axiosInstance.post(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Generic PUT request
  async put(endpoint, data = {}) {
    try {
      const response = await this.axiosInstance.put(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Generic DELETE request
  async delete(endpoint) {
    try {
      const response = await this.axiosInstance.delete(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload file (for images, etc.)
  async uploadFile(endpoint, file, fieldName = 'file') {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await this.axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Set auth token manually (for login)
  setAuthToken(token) {
    this.axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
  }

  // Clear auth token (for logout)
  clearAuthToken() {
    delete this.axiosInstance.defaults.headers.Authorization;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.axiosInstance.get('/health');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Retry mechanism for failed requests
  async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          console.log(`Request failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError;
  }
}

// Create singleton instance
const apiService = new ApiService();

export { apiService };