/**
 * API Service
 * Handles all API calls to the backend
 */

import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

class APIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
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

  // Auth endpoints
  register(data) {
    return this.client.post('/auth/register', data);
  }

  login(data) {
    return this.client.post('/auth/login', data);
  }

  getProfile() {
    return this.client.get('/auth/profile');
  }

  // Emergency request endpoints
  createEmergencyRequest(data) {
    return this.client.post('/requests', data);
  }

  getRequest(id) {
    return this.client.get(`/requests/${id}`);
  }

  getUserRequests(status) {
    return this.client.get('/requests/user/me', {
      params: { status },
    });
  }

  cancelRequest(id) {
    return this.client.post(`/requests/${id}/cancel`);
  }

  // AI endpoints
  analyzeInjury(imageBase64) {
    return this.client.post('/ai/analyze-injury', {
      image: imageBase64,
    });
  }

  getFirstAidSteps(injuryType) {
    return this.client.get(`/ai/first-aid/${injuryType}`);
  }

  getAllFirstAidGuides() {
    return this.client.get('/ai/first-aid');
  }
}

export default new APIService();
