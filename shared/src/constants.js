/**
 * Aapatt Emergency Superapp - Shared Constants
 * Contains all application constants used across citizen, provider, and admin apps
 */

// App Branding
export const APP_NAME = 'Aapatt';
export const APP_NAME_SANSKRIT = 'आपत्ति';
export const APP_TAGLINE = 'Saving lives through intelligent technology';

// Colors (Emergency Red Theme)
export const COLORS = {
  // Primary Colors
  PRIMARY_RED: '#E53935',
  SECONDARY_BLUE: '#1565C0', 
  ACCENT_YELLOW: '#FFEB3B',
  SUCCESS_GREEN: '#43A047',
  
  // Status Colors
  EMERGENCY: '#E53935',
  WARNING: '#FF9800',
  SUCCESS: '#4CAF50',
  INFO: '#2196F3',
  
  // Neutral Colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#F5F5F5',
  GRAY_MEDIUM: '#9E9E9E',
  GRAY_DARK: '#424242',
  
  // Transparency
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  EMERGENCY_OVERLAY: 'rgba(229, 57, 53, 0.1)'
};

// Emergency Types
export const EMERGENCY_TYPES = {
  AMBULANCE: {
    id: 'ambulance',
    name: 'Ambulance',
    icon: '🚑',
    color: COLORS.PRIMARY_RED,
    description: 'Medical emergencies and health issues',
    priority: 1
  },
  FIRE: {
    id: 'fire',
    name: 'Fire Brigade', 
    icon: '🚒',
    color: COLORS.PRIMARY_RED,
    description: 'Fires, accidents, and rescue operations',
    priority: 1
  },
  AIR_AMBULANCE: {
    id: 'air_ambulance',
    name: 'Air Ambulance',
    icon: '🚁', 
    color: COLORS.PRIMARY_RED,
    description: 'Critical cases requiring airlift',
    priority: 3
  }
};

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted', 
  EN_ROUTE: 'en_route',
  ARRIVED: 'arrived',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout'
};

// Provider Status
export const PROVIDER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline', 
  BUSY: 'busy',
  UNAVAILABLE: 'unavailable'
};

// User Roles
export const USER_ROLES = {
  CITIZEN: 'citizen',
  PROVIDER: 'provider',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Emergency Requests
  NEW_EMERGENCY: 'new_emergency',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_DECLINED: 'request_declined',
  REQUEST_CANCELLED: 'request_cancelled',
  
  // Location Updates
  PROVIDER_LOCATION_UPDATE: 'provider_location_update',
  ETA_UPDATE: 'eta_update',
  
  // Status Updates
  STATUS_UPDATE: 'status_update',
  PROVIDER_STATUS_CHANGE: 'provider_status_change',
  
  // Notifications
  PUSH_NOTIFICATION: 'push_notification',
  SYSTEM_ALERT: 'system_alert'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verify-otp',
    REFRESH_TOKEN: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout'
  },
  
  // Emergency Requests
  REQUESTS: {
    CREATE: '/api/requests',
    GET_ALL: '/api/requests',
    GET_BY_ID: '/api/requests/:id',
    UPDATE_STATUS: '/api/requests/:id/status',
    CANCEL: '/api/requests/:id/cancel',
    HISTORY: '/api/requests/history'
  },
  
  // Providers
  PROVIDERS: {
    GET_ALL: '/api/providers',
    GET_BY_ID: '/api/providers/:id',
    UPDATE_STATUS: '/api/providers/:id/status',
    UPDATE_LOCATION: '/api/providers/:id/location',
    GET_NEARBY: '/api/providers/nearby'
  },
  
  // AI Services
  AI: {
    ANALYZE_INJURY: '/api/ai/analyze-injury',
    GET_FIRST_AID: '/api/ai/first-aid',
    EMERGENCY_DETECTION: '/api/ai/emergency-detection'
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    ANALYTICS: '/api/admin/analytics',
    PROVIDERS: '/api/admin/providers',
    REQUESTS: '/api/admin/requests'
  }
};

// Configuration
export const CONFIG = {
  // Location
  DEFAULT_LOCATION: {
    latitude: 28.6139, // New Delhi
    longitude: 77.2090,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  },
  
  // Timeouts (in milliseconds)
  REQUEST_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  LOCATION_UPDATE_INTERVAL: 10 * 1000, // 10 seconds
  SOCKET_RECONNECT_DELAY: 3 * 1000, // 3 seconds
  
  // Limits
  MAX_SEARCH_RADIUS: 50, // kilometers
  MAX_PROVIDERS_PER_REQUEST: 10,
  MAX_RETRY_ATTEMPTS: 3,
  
  // AI Configuration
  HUGGING_FACE: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png'],
    CONFIDENCE_THRESHOLD: 0.7
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid phone number or OTP',
  TOKEN_EXPIRED: 'Session expired. Please login again',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  
  // Location
  LOCATION_PERMISSION_DENIED: 'Location permission is required for emergency services',
  LOCATION_UNAVAILABLE: 'Unable to get your current location',
  
  // Requests
  NO_PROVIDERS_AVAILABLE: 'No emergency providers available in your area',
  REQUEST_TIMEOUT: 'Request timeout. Please try again',
  INVALID_EMERGENCY_TYPE: 'Invalid emergency type selected',
  
  // Network
  NETWORK_ERROR: 'Network connection error. Please check your internet',
  SERVER_ERROR: 'Server error. Please try again later',
  
  // General
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
  INVALID_INPUT: 'Please check your input and try again'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REQUEST_CREATED: 'Emergency request created successfully',
  REQUEST_ACCEPTED: 'Provider is on the way to your location',
  REQUEST_COMPLETED: 'Emergency request completed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  STATUS_UPDATED: 'Status updated successfully'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  EMERGENCY_REQUEST: 'emergency_request',
  STATUS_UPDATE: 'status_update',
  SYSTEM_ALERT: 'system_alert',
  MARKETING: 'marketing'
};

// First Aid Categories
export const FIRST_AID_CATEGORIES = {
  BLEEDING: {
    id: 'bleeding',
    name: 'Bleeding & Wounds',
    icon: '🩸',
    color: COLORS.PRIMARY_RED
  },
  BURNS: {
    id: 'burns', 
    name: 'Burns',
    icon: '🔥',
    color: COLORS.WARNING
  },
  FRACTURES: {
    id: 'fractures',
    name: 'Fractures & Sprains',
    icon: '🦴',
    color: COLORS.INFO
  },
  BREATHING: {
    id: 'breathing',
    name: 'Breathing Problems',
    icon: '🫁',
    color: COLORS.SECONDARY_BLUE
  },
  CARDIAC: {
    id: 'cardiac',
    name: 'Heart Problems',
    icon: '❤️',
    color: COLORS.PRIMARY_RED
  },
  POISONING: {
    id: 'poisoning',
    name: 'Poisoning',
    icon: '☠️',
    color: COLORS.WARNING
  }
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  PROVIDER_MARKER_SIZE: 40,
  USER_MARKER_SIZE: 35,
  ROUTE_COLOR: COLORS.SECONDARY_BLUE,
  ROUTE_WIDTH: 4
};

export default {
  APP_NAME,
  APP_NAME_SANSKRIT,
  APP_TAGLINE,
  COLORS,
  EMERGENCY_TYPES,
  REQUEST_STATUS,
  PROVIDER_STATUS,
  USER_ROLES,
  SOCKET_EVENTS,
  API_ENDPOINTS,
  CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NOTIFICATION_TYPES,
  FIRST_AID_CATEGORIES,
  MAP_CONFIG
};