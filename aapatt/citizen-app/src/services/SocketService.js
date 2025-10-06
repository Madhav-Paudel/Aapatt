import io from 'socket.io-client';
import { AuthService } from './AuthService';

class SocketServiceClass {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  async connect(userId) {
    try {
      if (this.socket && this.isConnected) {
        return;
      }

      this.socket = io('http://localhost:3000', {
        transports: ['websocket'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isConnected = true;
        this.socket.emit('join-user-room', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
      });

      // Set up event listeners
      this.setupEventListeners();

    } catch (error) {
      console.error('Socket connection error:', error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Request updates
    this.socket.on('request-update', (data) => {
      this.emit('request-update', data);
    });

    this.socket.on('request-accepted', (data) => {
      this.emit('request-accepted', data);
    });

    this.socket.on('request-cancelled', (data) => {
      this.emit('request-cancelled', data);
    });

    // Provider updates
    this.socket.on('provider-status-update', (data) => {
      this.emit('provider-status-update', data);
    });

    this.socket.on('provider-location-update', (data) => {
      this.emit('provider-location-update', data);
    });

    // System alerts
    this.socket.on('system-alert', (data) => {
      this.emit('system-alert', data);
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  async disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}

export const SocketService = new SocketServiceClass();