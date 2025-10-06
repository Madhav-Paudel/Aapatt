/**
 * Aapatt Emergency Superapp - API Service
 * HTTP client for API communication with error handling and interceptors
 */

import axios from 'axios';
import Constants from 'expo-constants';
import { parseApiError } from '@aapatt/shared';

// Get API URL from app config
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        
        // Parse error using shared utility
        const parsedError = parseApiError(error);
        
        // Create consistent error object
        const apiError = new Error(parsedError.message);
        apiError.code = parsedError.code;
        apiError.details = parsedError.details;
        apiError.originalError = error;
        
        return Promise.reject(apiError);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // HTTP Methods
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  // Emergency Requests
  async createEmergencyRequest(requestData) {
    return this.post('/requests', requestData);
  }

  async getMyRequests(params = {}) {
    return this.get('/requests/my-requests', { params });
  }

  async getRequestById(requestId) {
    return this.get(`/requests/${requestId}`);
  }

  async cancelRequest(requestId, reason) {
    return this.patch(`/requests/${requestId}/status`, {
      status: 'CANCELLED',
      notes: reason
    });
  }

  // Providers
  async getNearbyProviders(location, radius = 10, type = null) {
    const params = {
      latitude: location.latitude,
      longitude: location.longitude,
      radius,
      ...(type && { type })
    };
    return this.get('/providers/nearby', { params });
  }

  // AI Services
  async analyzeInjury(imageData, imageType = 'jpg') {
    return this.post('/ai/analyze-injury', {
      image: imageData,
      imageType
    });
  }

  async getFirstAidGuide(category) {
    return this.get(`/ai/first-aid/${category}`);
  }

  async detectEmergency(description) {
    return this.post('/ai/emergency-detection', { description });
  }

  // File Upload
  async uploadFile(file, type, category) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('category', category);

    return this.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Health Check
  async healthCheck() {
    return this.get('/health', {
      baseURL: API_BASE_URL // Use base URL without /api prefix
    });
  }
}

export const apiService = new ApiService();