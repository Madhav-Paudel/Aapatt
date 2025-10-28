import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';
import { socketService } from './socketService';

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber) {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      const response = await apiService.post('/auth/send-otp', {
        phone: phoneNumber,
      });

      return response;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  // Verify OTP and login
  async verifyOTP(phoneNumber, otp) {
    try {
      // Validate inputs
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      if (!otp || otp.length !== 6) {
        throw new Error('OTP must be 6 digits');
      }

      const response = await apiService.post('/auth/verify-otp', {
        phone: phoneNumber,
        otp,
      });

      if (response.success && response.token) {
        // Store auth token and user data
        await this.storeAuthData(response.token, response.user);

        // Connect to socket for real-time features
        await socketService.connect();
        socketService.authenticate(response.user.id, response.user.role);

        return response;
      } else {
        throw new Error(response.error || 'OTP verification failed');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userProfile = await AsyncStorage.getItem('userProfile');

      if (!token || !userProfile) {
        return false;
      }

      // Check if token is still valid (you might want to verify with server)
      const user = JSON.parse(userProfile);
      this.currentUser = user;

      // Set auth token in API service
      apiService.setAuthToken(token);

      return true;
    } catch (error) {
      console.error('Check authentication error:', error);
      return false;
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      if (this.currentUser) {
        return this.currentUser;
      }

      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        this.currentUser = JSON.parse(userProfile);
        return this.currentUser;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put('/auth/profile', profileData);

      if (response.success) {
        // Update stored user profile
        this.currentUser = { ...this.currentUser, ...response.user };
        await AsyncStorage.setItem('userProfile', JSON.stringify(this.currentUser));
        return response;
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Register as provider
  async registerAsProvider(providerData) {
    try {
      const response = await apiService.post('/auth/register-provider', providerData);

      if (response.success) {
        // Update user role in stored profile
        this.currentUser = { ...this.currentUser, role: 'PROVIDER' };
        await AsyncStorage.setItem('userProfile', JSON.stringify(this.currentUser));
        return response;
      } else {
        throw new Error(response.error || 'Failed to register as provider');
      }
    } catch (error) {
      console.error('Register provider error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      // Disconnect socket
      socketService.disconnect();

      // Clear stored data
      await AsyncStorage.multiRemove(['authToken', 'userProfile', 'activeEmergency']);

      // Clear current user
      this.currentUser = null;

      // Clear auth token from API service
      apiService.clearAuthToken();

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // Refresh auth token
  async refreshToken() {
    try {
      const response = await apiService.post('/auth/refresh');

      if (response.success && response.token) {
        await this.storeAuthData(response.token, this.currentUser);
        return response.token;
      } else {
        throw new Error(response.error || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  // Store auth data in storage
  async storeAuthData(token, user) {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));

      // Set auth token in API service
      apiService.setAuthToken(token);

      // Store current user
      this.currentUser = user;
    } catch (error) {
      console.error('Store auth data error:', error);
      throw error;
    }
  }

  // Validate phone number format
  isValidPhoneNumber(phone) {
    // Basic validation for international format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // Format phone number for display
  formatPhoneNumber(phone) {
    if (!phone) return '';

    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // Return as-is for international numbers
    return phone;
  }

  // Check if user is a provider
  isProvider() {
    return this.currentUser && this.currentUser.role === 'PROVIDER';
  }

  // Check if user is admin
  isAdmin() {
    return this.currentUser && (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'SUPER_ADMIN');
  }
}

// Create singleton instance
const authService = new AuthService();

export { authService };