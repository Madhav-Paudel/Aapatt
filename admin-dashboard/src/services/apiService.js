import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
}

// Admin API service
export const adminService = {
  getDashboard: async (period = '24h') => {
    try {
      const response = await apiService.get(`/admin/dashboard?period=${period}`)
      return response
    } catch (error) {
      throw error
    }
  },

  getRequests: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/admin/requests?${queryString}` : '/admin/requests'
      const response = await apiService.get(url)
      return response
    } catch (error) {
      throw error
    }
  },

  getProviders: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/admin/providers?${queryString}` : '/admin/providers'
      const response = await apiService.get(url)
      return response
    } catch (error) {
      throw error
    }
  },

  updateProviderVerification: async (providerId, isVerified) => {
    try {
      const response = await apiService.put(`/admin/providers/${providerId}/verify`, {
        isVerified,
      })
      return response
    } catch (error) {
      throw error
    }
  },

  createUser: async (userData) => {
    try {
      const response = await apiService.post('/admin/users', userData)
      return response
    } catch (error) {
      throw error
    }
  },

  getAnalytics: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/admin/analytics?${queryString}` : '/admin/analytics'
      const response = await apiService.get(url)
      return response
    } catch (error) {
      throw error
    }
  },
}

export default apiService