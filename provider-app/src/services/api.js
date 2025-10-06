/**
 * Provider API Service
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
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Auth
  login(data) {
    return this.client.post('/auth/login', data);
  }

  registerProvider(data) {
    return this.client.post('/providers/register', data);
  }

  // Provider operations
  updateStatus(status) {
    return this.client.put('/providers/status', { status });
  }

  updateLocation(latitude, longitude, speed, accuracy) {
    return this.client.post('/providers/location', {
      latitude,
      longitude,
      speed,
      accuracy,
    });
  }

  acceptRequest(requestId) {
    return this.client.post('/providers/accept', { requestId });
  }

  declineRequest(requestId, reason) {
    return this.client.post('/providers/decline', { requestId, reason });
  }

  getProviderRequests(status) {
    return this.client.get('/providers/me/requests', {
      params: { status },
    });
  }

  getProviderStats() {
    return this.client.get('/providers/me/stats');
  }

  // Requests
  getRequest(id) {
    return this.client.get(`/requests/${id}`);
  }

  updateRequestStatus(id, status, message, latitude, longitude) {
    return this.client.put(`/requests/${id}/status`, {
      status,
      message,
      latitude,
      longitude,
    });
  }
}

export default new APIService();
