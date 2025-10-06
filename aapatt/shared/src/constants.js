// Aapatt Emergency Superapp Constants

// Brand Colors
export const COLORS = {
  PRIMARY: '#E53935',      // Emergency Red
  SECONDARY: '#1565C0',    // Trust Blue
  ACCENT: '#FFEB3B',       // Alert Yellow
  SUCCESS: '#43A047',      // Safe Green
  WARNING: '#FF9800',      // Warning Orange
  DANGER: '#F44336',       // Danger Red
  INFO: '#2196F3',         // Info Blue
  LIGHT: '#F5F5F5',        // Light Gray
  DARK: '#212121',         // Dark Gray
  WHITE: '#FFFFFF',        // White
  BLACK: '#000000',        // Black
};

// Emergency Request Types
export const REQUEST_TYPES = {
  AMBULANCE: 'AMBULANCE',
  FIRE_BRIGADE: 'FIRE_BRIGADE',
  AIR_AMBULANCE: 'AIR_AMBULANCE',
  POLICE: 'POLICE',
  RESCUE: 'RESCUE',
};

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EN_ROUTE: 'EN_ROUTE',
  ARRIVED: 'ARRIVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

// User Types
export const USER_TYPES = {
  CITIZEN: 'CITIZEN',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN',
};

// Service Types
export const SERVICE_TYPES = {
  AMBULANCE: 'AMBULANCE',
  FIRE_BRIGADE: 'FIRE_BRIGADE',
  AIR_AMBULANCE: 'AIR_AMBULANCE',
  POLICE: 'POLICE',
  RESCUE: 'RESCUE',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  EMERGENCY_REQUEST: 'EMERGENCY_REQUEST',
  REQUEST_ACCEPTED: 'REQUEST_ACCEPTED',
  REQUEST_UPDATED: 'REQUEST_UPDATED',
  PROVIDER_ARRIVED: 'PROVIDER_ARRIVED',
  REQUEST_COMPLETED: 'REQUEST_COMPLETED',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
};

// Emergency Contact Numbers
export const EMERGENCY_CONTACTS = {
  AMBULANCE: '108',
  FIRE: '101',
  POLICE: '100',
  AIR_AMBULANCE: '108',
  RESCUE: '108',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    VERIFY_PHONE: '/api/auth/verify-phone',
    PROFILE: '/api/auth/profile',
  },
  REQUESTS: {
    CREATE: '/api/requests',
    GET_MY: '/api/requests',
    GET_DETAILS: '/api/requests/:id',
    UPDATE_STATUS: '/api/requests/:id/status',
    CANCEL: '/api/requests/:id/cancel',
  },
  PROVIDERS: {
    PROFILE: '/api/providers/profile',
    STATUS: '/api/providers/status',
    REQUESTS: '/api/providers/requests',
    ACCEPT: '/api/providers/requests/:id/accept',
    MY_REQUESTS: '/api/providers/my-requests',
    UPDATE_LOCATION: '/api/providers/requests/:id/location',
  },
  AI: {
    ANALYZE_INJURY: '/api/ai/analyze-injury',
    FIRST_AID: '/api/ai/first-aid-guidance',
    EMERGENCY_CONTACTS: '/api/ai/emergency-contacts',
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    LIVE_MAP: '/api/admin/live-map',
    PROVIDERS: '/api/admin/providers',
    ANALYTICS: '/api/admin/analytics',
    HEALTH: '/api/admin/health',
  },
};

// Socket.IO Events
export const SOCKET_EVENTS = {
  // Client to Server
  JOIN_USER_ROOM: 'join-user-room',
  JOIN_PROVIDER_ROOM: 'join-provider-room',
  JOIN_ADMIN_DASHBOARD: 'join-admin-dashboard',
  PROVIDER_STATUS: 'provider-status',
  LOCATION_UPDATE: 'location-update',
  EMERGENCY_REQUEST: 'emergency-request',
  REQUEST_STATUS_UPDATE: 'request-status-update',
  
  // Server to Client
  NEW_EMERGENCY_REQUEST: 'new-emergency-request',
  REQUEST_ACCEPTED: 'request-accepted',
  REQUEST_UPDATE: 'request-update',
  REQUEST_CANCELLED: 'request-cancelled',
  PROVIDER_STATUS_UPDATE: 'provider-status-update',
  PROVIDER_LOCATION_UPDATE: 'provider-location-update',
  REQUEST_STATUS_UPDATE: 'request-status-update',
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  DEFAULT_CENTER: {
    latitude: 28.6139, // New Delhi
    longitude: 77.2090,
  },
  PROVIDER_UPDATE_INTERVAL: 10000, // 10 seconds
  REQUEST_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};

// Validation Rules
export const VALIDATION_RULES = {
  PHONE_NUMBER: /^[+]?[1-9]\d{1,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  ADDRESS_MAX_LENGTH: 200,
  MESSAGE_MAX_LENGTH: 200,
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_LOCATION: 'Please provide valid location coordinates',
  REQUEST_NOT_FOUND: 'Emergency request not found',
  PROVIDER_NOT_FOUND: 'Provider not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  VALIDATION_ERROR: 'Please check your input and try again',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REQUEST_CREATED: 'Emergency request created successfully',
  REQUEST_ACCEPTED: 'Request accepted successfully',
  REQUEST_UPDATED: 'Request status updated successfully',
  REQUEST_CANCELLED: 'Request cancelled successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  STATUS_UPDATED: 'Status updated successfully',
  LOCATION_UPDATED: 'Location updated successfully',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Aapatt',
  TAGLINE: 'Saving lives through intelligent technology',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@aapatt.com',
  SUPPORT_PHONE: '+91-8000-000-000',
  WEBSITE: 'https://aapatt.com',
};

// Feature Flags
export const FEATURES = {
  AI_FIRST_AID: true,
  REAL_TIME_TRACKING: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: true,
  MULTI_LANGUAGE: false,
  VOICE_COMMANDS: false,
};

export default {
  COLORS,
  REQUEST_TYPES,
  REQUEST_STATUS,
  USER_TYPES,
  SERVICE_TYPES,
  NOTIFICATION_TYPES,
  EMERGENCY_CONTACTS,
  API_ENDPOINTS,
  SOCKET_EVENTS,
  MAP_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP_CONFIG,
  FEATURES,
};