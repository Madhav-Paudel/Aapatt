import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
  }

  // Request location permissions
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Also request background location for continuous tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission denied');
      }

      return status === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      throw error;
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      // Check if permissions are granted
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        await this.requestPermissions();
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Get current location error:', error);
      throw error;
    }
  }

  // Start location tracking
  async startLocationTracking(callback) {
    try {
      const hasPermission = await this.requestPermissions();

      if (!hasPermission) {
        throw new Error('Location permission required for tracking');
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };

          if (callback) {
            callback(this.currentLocation);
          }
        }
      );

      return this.watchId;
    } catch (error) {
      console.error('Start location tracking error:', error);
      throw error;
    }
  }

  // Stop location tracking
  async stopLocationTracking() {
    try {
      if (this.watchId) {
        await this.watchId.remove();
        this.watchId = null;
      }
    } catch (error) {
      console.error('Stop location tracking error:', error);
    }
  }

  // Get location address from coordinates
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address.length > 0) {
        const { street, city, region, postalCode, country } = address[0];
        return {
          street,
          city,
          region,
          postalCode,
          country,
          formatted: `${street || ''} ${city || ''} ${region || ''}`.trim(),
        };
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  // Calculate estimated time of arrival (in minutes)
  calculateETA(distance, averageSpeed = 30) {
    // Average speed in km/h for emergency vehicles
    const timeInHours = distance / averageSpeed;
    return Math.ceil(timeInHours * 60); // Convert to minutes
  }

  // Helper function to convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get current location (cached)
  getCachedLocation() {
    return this.currentLocation;
  }

  // Check if location is recent (within last 5 minutes)
  isLocationRecent() {
    if (!this.currentLocation) return false;

    const now = Date.now();
    const locationTime = this.currentLocation.timestamp;
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    return (now - locationTime) < fiveMinutes;
  }

  // Get location accuracy description
  getAccuracyDescription(accuracy) {
    if (accuracy < 10) return 'Excellent';
    if (accuracy < 50) return 'Good';
    if (accuracy < 100) return 'Fair';
    return 'Poor';
  }
}

// Create singleton instance
const locationService = new LocationService();

export { locationService };