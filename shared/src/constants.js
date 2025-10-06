// Aapatt Emergency Response System - Shared Constants

// App Information
export const APP_NAME = 'Aapatt';
export const APP_TAGLINE = 'Saving lives through intelligent technology';
export const APP_VERSION = '1.0.0';

// Emergency Types
export const EMERGENCY_TYPES = {
  AMBULANCE: 'AMBULANCE',
  FIRE_BRIGADE: 'FIRE_BRIGADE',
  AIR_AMBULANCE: 'AIR_AMBULANCE'
};

export const EMERGENCY_TYPE_LABELS = {
  [EMERGENCY_TYPES.AMBULANCE]: 'Ambulance',
  [EMERGENCY_TYPES.FIRE_BRIGADE]: 'Fire Brigade',
  [EMERGENCY_TYPES.AIR_AMBULANCE]: 'Air Ambulance'
};

export const EMERGENCY_TYPE_ICONS = {
  [EMERGENCY_TYPES.AMBULANCE]: '🚑',
  [EMERGENCY_TYPES.FIRE_BRIGADE]: '🚒',
  [EMERGENCY_TYPES.AIR_AMBULANCE]: '🚁'
};

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EN_ROUTE: 'EN_ROUTE',
  ARRIVED: 'ARRIVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const REQUEST_STATUS_LABELS = {
  [REQUEST_STATUS.PENDING]: 'Searching for provider',
  [REQUEST_STATUS.ACCEPTED]: 'Provider assigned',
  [REQUEST_STATUS.EN_ROUTE]: 'Provider en route',
  [REQUEST_STATUS.ARRIVED]: 'Provider arrived',
  [REQUEST_STATUS.COMPLETED]: 'Request completed',
  [REQUEST_STATUS.CANCELLED]: 'Request cancelled'
};

export const REQUEST_STATUS_COLORS = {
  [REQUEST_STATUS.PENDING]: '#FF9800',
  [REQUEST_STATUS.ACCEPTED]: '#2196F3',
  [REQUEST_STATUS.EN_ROUTE]: '#9C27B0',
  [REQUEST_STATUS.ARRIVED]: '#FF5722',
  [REQUEST_STATUS.COMPLETED]: '#4CAF50',
  [REQUEST_STATUS.CANCELLED]: '#757575'
};

// Severity Levels
export const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const SEVERITY_LABELS = {
  [SEVERITY_LEVELS.LOW]: 'Low Priority',
  [SEVERITY_LEVELS.MEDIUM]: 'Medium Priority',
  [SEVERITY_LEVELS.HIGH]: 'High Priority',
  [SEVERITY_LEVELS.CRITICAL]: 'Critical'
};

export const SEVERITY_COLORS = {
  [SEVERITY_LEVELS.LOW]: '#4CAF50',
  [SEVERITY_LEVELS.MEDIUM]: '#FF9800',
  [SEVERITY_LEVELS.HIGH]: '#FF5722',
  [SEVERITY_LEVELS.CRITICAL]: '#F44336'
};

// Provider Types
export const PROVIDER_TYPES = EMERGENCY_TYPES; // Same as emergency types

export const PROVIDER_STATUS = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  BUSY: 'BUSY',
  UNAVAILABLE: 'UNAVAILABLE'
};

// User Types
export const USER_TYPES = {
  CITIZEN: 'citizen',
  PROVIDER: 'provider',
  ADMIN: 'admin'
};

// Admin Roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR'
};

// Colors (Aapatt Brand Guidelines)
export const COLORS = {
  PRIMARY: '#E53935',        // Emergency Red
  SECONDARY: '#1565C0',      // Trust Blue
  ACCENT: '#FFEB3B',         // Alert Yellow
  SUCCESS: '#43A047',        // Safe Green
  WARNING: '#FF9800',        // Warning Orange
  ERROR: '#F44336',          // Error Red
  INFO: '#2196F3',           // Info Blue
  
  // Grayscale
  WHITE: '#FFFFFF',
  LIGHT_GRAY: '#F5F5F5',
  GRAY: '#9E9E9E',
  DARK_GRAY: '#424242',
  BLACK: '#000000'
};

// Socket Events
export const SOCKET_EVENTS = {
  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  
  // Emergency Requests
  EMERGENCY_REQUEST_CREATED: 'emergency_request_created',
  NEW_EMERGENCY_REQUEST: 'new_emergency_request',
  REQUEST_STATUS_UPDATE: 'request_status_update',
  REQUEST_TAKEN: 'request_taken',
  
  // Provider Events
  PROVIDER_RESPONSE: 'provider_response',
  PROVIDER_LOCATION_UPDATE: 'provider_location_update',
  PROVIDER_STATUS_CHANGE: 'provider_status_change',
  
  // Admin Events
  ADMIN_ASSIGN_PROVIDER: 'admin_assign_provider',
  MANUAL_ASSIGNMENT: 'manual_assignment',
  
  // AI Events
  AI_ANALYSIS_REQUEST: 'ai_analysis_request',
  AI_ANALYSIS_RESULT: 'ai_analysis_result',
  
  // System Events
  EMERGENCY_BROADCAST: 'emergency_broadcast',
  SYSTEM_ALERT: 'system_alert'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  EMERGENCY: 'EMERGENCY',
  SYSTEM: 'SYSTEM',
  UPDATE: 'UPDATE',
  MAINTENANCE: 'MAINTENANCE'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH_CITIZEN: '/api/auth/citizen',
  AUTH_PROVIDER: '/api/auth/provider',
  AUTH_ADMIN: '/api/auth/admin',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_VERIFY: '/api/auth/verify',
  AUTH_LOGOUT: '/api/auth/logout',
  
  // Emergency Requests
  REQUESTS: '/api/requests',
  REQUEST_HISTORY: '/api/requests/history',
  ACTIVE_REQUESTS: '/api/requests/active',
  
  // Providers
  PROVIDERS: '/api/providers',
  PROVIDER_STATUS: '/api/providers/status',
  PROVIDER_LOCATION: '/api/providers/location',
  
  // AI Services
  AI_ANALYZE: '/api/ai/analyze-injury',
  AI_FIRST_AID: '/api/ai/first-aid',
  
  // Admin
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_ANALYTICS: '/api/admin/analytics',
  ADMIN_PROVIDERS: '/api/admin/providers',
  
  // System
  HEALTH: '/health',
  VERSION: '/version'
};

// Default Settings
export const DEFAULT_SETTINGS = {
  SEARCH_RADIUS_KM: 10,
  MAX_PROVIDERS_TO_NOTIFY: 10,
  REQUEST_TIMEOUT_MINUTES: 5,
  LOCATION_UPDATE_INTERVAL_SECONDS: 10,
  AUTO_REFRESH_INTERVAL_SECONDS: 30
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please log in again.',
  LOCATION_PERMISSION_DENIED: 'Location permission denied. Please enable location services.',
  CAMERA_PERMISSION_DENIED: 'Camera permission denied. Please enable camera access.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NO_PROVIDERS_AVAILABLE: 'No providers available in your area. Please try again later.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REQUEST_CREATED: 'Emergency request created successfully. Help is on the way!',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  STATUS_UPDATED: 'Status updated successfully.'
};

// Validation Rules
export const VALIDATION = {
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  
  // Location bounds (example for India)
  LATITUDE_MIN: 6.0,
  LATITUDE_MAX: 37.0,
  LONGITUDE_MIN: 68.0,
  LONGITUDE_MAX: 98.0
};

// Feature Flags
export const FEATURES = {
  AI_FIRST_AID: true,
  VOICE_COMMANDS: false,
  VIDEO_CALLS: false,
  OFFLINE_MODE: true,
  DARK_MODE: true,
  PUSH_NOTIFICATIONS: true
};

// External Service URLs
export const EXTERNAL_SERVICES = {
  HUGGING_FACE_API: 'https://api-inference.huggingface.co',
  OSRM_API: 'http://router.project-osrm.org',
  OPENSTREETMAP_TILES: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};

export default {
  APP_NAME,
  APP_TAGLINE,
  APP_VERSION,
  EMERGENCY_TYPES,
  EMERGENCY_TYPE_LABELS,
  EMERGENCY_TYPE_ICONS,
  REQUEST_STATUS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  SEVERITY_LEVELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  PROVIDER_TYPES,
  PROVIDER_STATUS,
  USER_TYPES,
  ADMIN_ROLES,
  COLORS,
  SOCKET_EVENTS,
  NOTIFICATION_TYPES,
  API_ENDPOINTS,
  DEFAULT_SETTINGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  FEATURES,
  EXTERNAL_SERVICES
};