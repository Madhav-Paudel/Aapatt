import { io } from 'socket.io-client';
import Constants from 'expo-constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.serverURL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
  }

  // Connect to socket server
  async connect() {
    try {
      if (this.socket && this.isConnected) {
        return;
      }

      this.socket = io(this.serverURL, {
        transports: ['websocket'],
        timeout: 10000,
      });

      return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          console.log('Socket connected:', this.socket.id);
          this.isConnected = true;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.isConnected = false;
        });

        // Set connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Socket connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('Socket connection error:', error);
      throw error;
    }
  }

  // Disconnect from socket server
  disconnect() {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
        this.listeners.clear();
      }
    } catch (error) {
      console.error('Socket disconnect error:', error);
    }
  }

  // Authenticate socket connection
  authenticate(userId, role = 'CITIZEN') {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot authenticate');
      return;
    }

    this.socket.emit('authenticate', { userId, role });
  }

  // Emit event to server
  emit(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot emit event:', event);
      return false;
    }

    try {
      this.socket.emit(event, data);
      return true;
    } catch (error) {
      console.error('Socket emit error:', error);
      return false;
    }
  }

  // Listen for events from server
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return null;
    }

    try {
      const listener = (data) => callback(data);
      this.socket.on(event, listener);

      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(listener);

      return {
        remove: () => {
          this.socket.off(event, listener);
          const eventListeners = this.listeners.get(event);
          if (eventListeners) {
            const index = eventListeners.indexOf(listener);
            if (index > -1) {
              eventListeners.splice(index, 1);
            }
          }
        }
      };
    } catch (error) {
      console.error('Socket listener error:', error);
      return null;
    }
  }

  // Remove all listeners for an event
  off(event) {
    if (!this.socket) {
      return;
    }

    try {
      this.socket.off(event);
      this.listeners.delete(event);
    } catch (error) {
      console.error('Socket off error:', error);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (!this.socket) {
      return;
    }

    try {
      this.socket.removeAllListeners();
      this.listeners.clear();
    } catch (error) {
      console.error('Socket remove all listeners error:', error);
    }
  }

  // Send location update (for citizens)
  sendLocationUpdate(location) {
    return this.emit('citizen_location_update', {
      location,
      timestamp: new Date(),
    });
  }

  // Send emergency request notification
  sendEmergencyRequest(requestId) {
    return this.emit('emergency_request', {
      requestId,
      timestamp: new Date(),
    });
  }

  // Join user-specific room
  joinUserRoom(userId) {
    if (!this.socket || !this.isConnected) {
      return false;
    }

    try {
      this.socket.emit('join_user_room', { userId });
      return true;
    } catch (error) {
      console.error('Join user room error:', error);
      return false;
    }
  }

  // Leave user-specific room
  leaveUserRoom(userId) {
    if (!this.socket || !this.isConnected) {
      return false;
    }

    try {
      this.socket.emit('leave_user_room', { userId });
      return true;
    } catch (error) {
      console.error('Leave user room error:', error);
      return false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      serverURL: this.serverURL,
    };
  }

  // Reconnect to server
  async reconnect() {
    try {
      this.disconnect();
      await this.connect();
    } catch (error) {
      console.error('Socket reconnect error:', error);
      throw error;
    }
  }

  // Handle app going to background/foreground
  handleAppStateChange(appState) {
    if (appState === 'background') {
      // App went to background - disconnect socket to save battery
      if (this.isConnected) {
        console.log('App went to background, disconnecting socket');
        this.disconnect();
      }
    } else if (appState === 'active') {
      // App came to foreground - reconnect if needed
      if (!this.isConnected) {
        console.log('App came to foreground, reconnecting socket');
        this.connect().catch(error => {
          console.error('Failed to reconnect socket:', error);
        });
      }
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export { socketService };