/**
 * Aapatt - Shared Constants
 * Common constants used across all applications
 */

// Emergency Types
export const EMERGENCY_TYPES = {
  AMBULANCE: 'AMBULANCE',
  FIRE_BRIGADE: 'FIRE_BRIGADE',
  AIR_AMBULANCE: 'AIR_AMBULANCE'
};

export const EMERGENCY_LABELS = {
  [EMERGENCY_TYPES.AMBULANCE]: 'Ambulance',
  [EMERGENCY_TYPES.FIRE_BRIGADE]: 'Fire Brigade',
  [EMERGENCY_TYPES.AIR_AMBULANCE]: 'Air Ambulance'
};

export const EMERGENCY_ICONS = {
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

export const STATUS_LABELS = {
  [REQUEST_STATUS.PENDING]: 'Searching for provider...',
  [REQUEST_STATUS.ACCEPTED]: 'Provider accepted',
  [REQUEST_STATUS.EN_ROUTE]: 'Provider on the way',
  [REQUEST_STATUS.ARRIVED]: 'Provider has arrived',
  [REQUEST_STATUS.COMPLETED]: 'Emergency resolved',
  [REQUEST_STATUS.CANCELLED]: 'Request cancelled'
};

// Provider Status
export const PROVIDER_STATUS = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  BUSY: 'BUSY'
};

// User Roles
export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN'
};

// Colors (Emergency-focused palette)
export const COLORS = {
  PRIMARY: '#E53935',        // Emergency Red
  SECONDARY: '#1565C0',      // Trust Blue
  ACCENT: '#FFEB3B',         // Alert Yellow
  SUCCESS: '#43A047',        // Safe Green
  WARNING: '#FF9800',        // Warning Orange
  DANGER: '#D32F2F',         // Danger Red
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#F5F5F5',
  GRAY_MEDIUM: '#9E9E9E',
  GRAY_DARK: '#424242'
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Emergency Requests
  NEW_REQUEST: 'new_request',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_DECLINED: 'request_declined',
  REQUEST_UPDATED: 'request_updated',
  REQUEST_CANCELLED: 'request_cancelled',
  REQUEST_COMPLETED: 'request_completed',
  
  // Location Updates
  PROVIDER_LOCATION_UPDATE: 'provider_location_update',
  ETA_UPDATE: 'eta_update',
  
  // Provider Status
  PROVIDER_STATUS_CHANGE: 'provider_status_change',
  PROVIDER_ONLINE: 'provider_online',
  PROVIDER_OFFLINE: 'provider_offline'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  VERIFY_OTP: '/api/auth/verify-otp',
  LOGOUT: '/api/auth/logout',
  
  // Requests
  CREATE_REQUEST: '/api/requests',
  GET_REQUEST: '/api/requests/:id',
  UPDATE_REQUEST: '/api/requests/:id',
  CANCEL_REQUEST: '/api/requests/:id/cancel',
  GET_USER_REQUESTS: '/api/requests/user/:userId',
  
  // Providers
  GET_PROVIDERS: '/api/providers',
  GET_PROVIDER: '/api/providers/:id',
  UPDATE_PROVIDER_STATUS: '/api/providers/:id/status',
  UPDATE_PROVIDER_LOCATION: '/api/providers/:id/location',
  ACCEPT_REQUEST: '/api/providers/:id/accept',
  DECLINE_REQUEST: '/api/providers/:id/decline',
  
  // AI First Aid
  ANALYZE_INJURY: '/api/ai/analyze-injury',
  GET_FIRST_AID_STEPS: '/api/ai/first-aid/:injuryType',
  
  // Admin
  GET_DASHBOARD_STATS: '/api/admin/stats',
  GET_ALL_REQUESTS: '/api/admin/requests',
  GET_ALL_PROVIDERS: '/api/admin/providers',
  ASSIGN_REQUEST: '/api/admin/requests/:id/assign'
};

// Configuration
export const CONFIG = {
  // Location
  DEFAULT_RADIUS_KM: 10,
  MAX_SEARCH_RADIUS_KM: 50,
  LOCATION_UPDATE_INTERVAL_MS: 10000,
  
  // Timeouts
  REQUEST_TIMEOUT_MINUTES: 5,
  PROVIDER_RESPONSE_TIMEOUT_SECONDS: 30,
  
  // Limits
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_FILE_SIZE_MB: 5,
  
  // AI
  AI_CONFIDENCE_THRESHOLD: 0.7,
  AUTO_CALL_911_THRESHOLD: 0.9
};

export default {
  EMERGENCY_TYPES,
  EMERGENCY_LABELS,
  EMERGENCY_ICONS,
  REQUEST_STATUS,
  STATUS_LABELS,
  PROVIDER_STATUS,
  USER_ROLES,
  COLORS,
  SOCKET_EVENTS,
  API_ENDPOINTS,
  CONFIG
};
