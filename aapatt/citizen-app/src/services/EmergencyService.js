import axios from 'axios';
import { AuthService } from './AuthService';

const API_BASE_URL = 'http://localhost:3000';

class EmergencyServiceClass {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(async (config) => {
      const token = await AuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        throw error;
      }
    );
  }

  async createRequest(requestData) {
    try {
      const response = await this.api.post('/api/requests', requestData);
      return response.data;
    } catch (error) {
      console.error('Create request error:', error);
      throw error;
    }
  }

  async getMyRequests(params = {}) {
    try {
      const response = await this.api.get('/api/requests', { params });
      return response.data;
    } catch (error) {
      console.error('Get requests error:', error);
      throw error;
    }
  }

  async getRequestDetails(requestId) {
    try {
      const response = await this.api.get(`/api/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Get request details error:', error);
      throw error;
    }
  }

  async updateRequestStatus(requestId, statusData) {
    try {
      const response = await this.api.put(`/api/requests/${requestId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Update request status error:', error);
      throw error;
    }
  }

  async cancelRequest(requestId) {
    try {
      const response = await this.api.post(`/api/requests/${requestId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Cancel request error:', error);
      throw error;
    }
  }

  async analyzeInjury(imageBase64) {
    try {
      const response = await this.api.post('/api/ai/analyze-injury', {
        imageBase64,
      });
      return response.data;
    } catch (error) {
      console.error('Analyze injury error:', error);
      throw error;
    }
  }

  async getFirstAidGuidance(injuryType, severity) {
    try {
      const response = await this.api.get('/api/ai/first-aid-guidance', {
        params: { injuryType, severity },
      });
      return response.data;
    } catch (error) {
      console.error('Get first aid guidance error:', error);
      throw error;
    }
  }

  async getEmergencyContacts(latitude, longitude) {
    try {
      const response = await this.api.get('/api/ai/emergency-contacts', {
        params: { latitude, longitude },
      });
      return response.data;
    } catch (error) {
      console.error('Get emergency contacts error:', error);
      throw error;
    }
  }
}

export const EmergencyService = new EmergencyServiceClass();