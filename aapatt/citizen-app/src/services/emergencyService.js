import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';
import { socketService } from './socketService';

class EmergencyService {
  constructor() {
    this.activeEmergency = null;
    this.socketListeners = [];
  }

  // Create emergency request
  async createEmergencyRequest(type, location, description, priority = 'MEDIUM', securityAlert = false) {
    try {
      // Get address from coordinates if not provided
      let address = null;
      if (location.latitude && location.longitude) {
        address = await this.getAddressFromLocation(location);
      }

      const emergencyData = {
        type,
        description,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        address,
        priority,
        securityAlert,
      };

      const response = await apiService.post('/requests', emergencyData);

      if (response.success) {
        this.activeEmergency = {
          id: response.request.id,
          type: response.request.type,
          status: response.request.status,
          createdAt: response.request.createdAt,
          nearestProviders: response.nearestProviders,
          location,
        };

        // Store active emergency locally
        await AsyncStorage.setItem('activeEmergency', JSON.stringify(this.activeEmergency));

        // Setup socket listeners for real-time updates
        this.setupSocketListeners();

        return this.activeEmergency;
      } else {
        throw new Error(response.error || 'Failed to create emergency request');
      }
    } catch (error) {
      console.error('Create emergency request error:', error);
      throw error;
    }
  }

  // Get active emergency
  async getActiveEmergency() {
    try {
      if (this.activeEmergency) {
        return this.activeEmergency;
      }

      const stored = await AsyncStorage.getItem('activeEmergency');
      if (stored) {
        this.activeEmergency = JSON.parse(stored);

        // Check if emergency is still active (not completed or cancelled)
        if (this.isEmergencyActive(this.activeEmergency)) {
          this.setupSocketListeners();
          return this.activeEmergency;
        } else {
          // Clear old emergency
          await this.clearActiveEmergency();
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Get active emergency error:', error);
      return null;
    }
  }

  // Update emergency status
  async updateEmergencyStatus(requestId, status, message) {
    try {
      const response = await apiService.post(`/requests/${requestId}/status`, {
        status,
        message,
      });

      if (response.success) {
        // Update local emergency
        if (this.activeEmergency && this.activeEmergency.id === requestId) {
          this.activeEmergency.status = status;
          this.activeEmergency.lastUpdate = new Date();

          await AsyncStorage.setItem('activeEmergency', JSON.stringify(this.activeEmergency));
        }

        return response;
      } else {
        throw new Error(response.error || 'Failed to update emergency status');
      }
    } catch (error) {
      console.error('Update emergency status error:', error);
      throw error;
    }
  }

  // Cancel emergency request
  async cancelEmergencyRequest(requestId) {
    try {
      const response = await apiService.post(`/requests/${requestId}/cancel`);

      if (response.success) {
        // Clear active emergency
        await this.clearActiveEmergency();
        return response;
      } else {
        throw new Error(response.error || 'Failed to cancel emergency request');
      }
    } catch (error) {
      console.error('Cancel emergency request error:', error);
      throw error;
    }
  }

  // Get emergency history
  async getEmergencyHistory(limit = 20, offset = 0) {
    try {
      const response = await apiService.get('/requests/my-requests', {
        limit,
        offset,
      });

      if (response.success) {
        return response.requests;
      } else {
        throw new Error(response.error || 'Failed to get emergency history');
      }
    } catch (error) {
      console.error('Get emergency history error:', error);
      throw error;
    }
  }

  // Get emergency details
  async getEmergencyDetails(requestId) {
    try {
      const response = await apiService.get(`/requests/${requestId}`);

      if (response.success) {
        return response.request;
      } else {
        throw new Error(response.error || 'Failed to get emergency details');
      }
    } catch (error) {
      console.error('Get emergency details error:', error);
      throw error;
    }
  }

  // Setup socket listeners for real-time updates
  setupSocketListeners() {
    if (!socketService.isConnected()) {
      console.warn('Socket not connected, cannot setup listeners');
      return;
    }

    // Remove existing listeners
    this.removeSocketListeners();

    // Listen for provider location updates
    const locationListener = socketService.on('provider_location_update', (data) => {
      if (this.activeEmergency && data.userId === this.activeEmergency.providerId) {
        this.activeEmergency.providerLocation = data.location;
        this.activeEmergency.lastLocationUpdate = new Date();

        // Emit event for components to listen to
        if (this.onLocationUpdate) {
          this.onLocationUpdate(data);
        }
      }
    });

    // Listen for status updates
    const statusListener = socketService.on('status_update', (data) => {
      if (this.activeEmergency && data.requestId === this.activeEmergency.id) {
        this.activeEmergency.status = data.status;
        this.activeEmergency.lastUpdate = new Date();

        await AsyncStorage.setItem('activeEmergency', JSON.stringify(this.activeEmergency));

        // Emit event for components to listen to
        if (this.onStatusUpdate) {
          this.onStatusUpdate(data);
        }
      }
    });

    // Listen for request acceptance
    const acceptanceListener = socketService.on('request_accepted', (data) => {
      if (this.activeEmergency && data.requestId === this.activeEmergency.id) {
        this.activeEmergency.providerId = data.providerId;
        this.activeEmergency.status = 'ACCEPTED';
        this.activeEmergency.acceptedAt = new Date();

        await AsyncStorage.setItem('activeEmergency', JSON.stringify(this.activeEmergency));

        // Emit event for components to listen to
        if (this.onRequestAccepted) {
          this.onRequestAccepted(data);
        }
      }
    });

    this.socketListeners.push(locationListener, statusListener, acceptanceListener);
  }

  // Remove socket listeners
  removeSocketListeners() {
    this.socketListeners.forEach(listener => {
      if (listener && listener.remove) {
        listener.remove();
      }
    });
    this.socketListeners = [];
  }

  // Check if emergency is still active
  isEmergencyActive(emergency) {
    if (!emergency) return false;

    const completedStatuses = ['COMPLETED', 'CANCELLED', 'EXPIRED'];
    return !completedStatuses.includes(emergency.status);
  }

  // Clear active emergency
  async clearActiveEmergency() {
    this.activeEmergency = null;
    this.removeSocketListeners();
    await AsyncStorage.removeItem('activeEmergency');
  }

  // Get address from location coordinates
  async getAddressFromLocation(location) {
    try {
      // This would typically use a geocoding service
      // For now, return a placeholder
      return `Location at ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Calculate ETA based on provider location
  calculateETA(providerLocation, userLocation) {
    if (!providerLocation || !userLocation) return null;

    const distance = this.calculateDistance(
      providerLocation.latitude,
      providerLocation.longitude,
      userLocation.latitude,
      userLocation.longitude
    );

    // Assume average speed of 30 km/h for emergency vehicles in city
    const averageSpeed = 30; // km/h
    const timeInHours = distance / averageSpeed;
    const etaInMinutes = Math.ceil(timeInHours * 60);

    return {
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      eta: etaInMinutes,
      unit: 'minutes'
    };
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Helper function to convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Event listeners for real-time updates
  onLocationUpdate = null;
  onStatusUpdate = null;
  onRequestAccepted = null;
}

// Create singleton instance
const emergencyService = new EmergencyService();

export { emergencyService };