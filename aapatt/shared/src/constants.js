// App Constants
export const APP_CONFIG = {
  NAME: 'Aapatt',
  VERSION: '1.0.0',
  DESCRIPTION: 'Emergency Services at Your Fingertips',
};

// Emergency Types
export const EMERGENCY_TYPES = {
  MEDICAL: 'MEDICAL',
  FIRE: 'FIRE',
  ACCIDENT: 'ACCIDENT',
  AIR_EMERGENCY: 'AIR_EMERGENCY',
  SECURITY: 'SECURITY',
  OTHER: 'OTHER',
};

// Emergency Status
export const EMERGENCY_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  EN_ROUTE: 'EN_ROUTE',
  ARRIVED: 'ARRIVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

// Provider Types
export const PROVIDER_TYPES = {
  AMBULANCE: 'AMBULANCE',
  FIRE_BRIGADE: 'FIRE_BRIGADE',
  AIR_AMBULANCE: 'AIR_AMBULANCE',
  POLICE: 'POLICE',
};

// User Roles
export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  REQUEST_CREATED: 'REQUEST_CREATED',
  REQUEST_ASSIGNED: 'REQUEST_ASSIGNED',
  REQUEST_ACCEPTED: 'REQUEST_ACCEPTED',
  PROVIDER_EN_ROUTE: 'PROVIDER_EN_ROUTE',
  PROVIDER_ARRIVED: 'PROVIDER_ARRIVED',
  REQUEST_COMPLETED: 'REQUEST_COMPLETED',
  REQUEST_CANCELLED: 'REQUEST_CANCELLED',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
};

// Colors
export const COLORS = {
  PRIMARY: '#E53935',
  PRIMARY_DARK: '#C62828',
  SECONDARY: '#1565C0',
  ACCENT: '#FFEB3B',
  SUCCESS: '#43A047',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',

  // Text Colors
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
  TEXT_MUTED: '#999999',

  // Background Colors
  BACKGROUND: '#F5F5F5',
  BACKGROUND_WHITE: '#FFFFFF',
  BACKGROUND_GREY: '#F8F8F8',
};

// Typography
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    PRIMARY: 'Inter',
    FALLBACK: 'System',
  },
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  FONT_WEIGHT: {
    LIGHT: '300',
    NORMAL: '400',
    MEDIUM: '500',
    SEMI_BOLD: '600',
    BOLD: '700',
  },
};

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

// Border Radius
export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  XXL: 24,
  ROUND: 50,
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    REGISTER_PROVIDER: '/auth/register-provider',
  },
  REQUESTS: {
    CREATE: '/requests',
    GET_MY_REQUESTS: '/requests/my-requests',
    GET_BY_ID: '/requests/:id',
    CANCEL: '/requests/:id/cancel',
    ACTIVE_LIST: '/requests/active/list',
  },
  PROVIDERS: {
    AVAILABILITY: '/providers/availability',
    LOCATION: '/providers/location',
    ACCEPT_REQUEST: '/providers/accept-request/:requestId',
    UPDATE_STATUS: '/providers/update-status/:requestId',
    PROFILE: '/providers/profile',
    JOB_HISTORY: '/providers/jobs/history',
  },
  ADMIN: {
    DASHBOARD_STATS: '/admin/dashboard/stats',
    LIVE_EMERGENCIES: '/admin/emergencies/live',
    PROVIDERS: '/admin/providers',
    ANALYTICS: '/admin/analytics',
    ASSIGN_REQUEST: '/admin/assign-request/:requestId',
    LOGS: '/admin/logs',
  },
  AI: {
    ANALYZE_INJURY: '/ai/analyze-injury',
    FIRST_AID: '/ai/first-aid/:injuryType',
    EMERGENCY_CONTACTS: '/ai/emergency-contacts',
  },
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',

  // Location Updates
  LOCATION_UPDATE: 'location_update',
  CITIZEN_LOCATION_UPDATE: 'citizen_location_update',

  // Emergency Requests
  EMERGENCY_REQUEST: 'emergency_request',
  NEW_EMERGENCY_REQUEST: 'new_emergency_request',
  ACCEPT_REQUEST: 'accept_request',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_TAKEN: 'request_taken',

  // Status Updates
  STATUS_UPDATE: 'status_update',

  // Rooms
  JOIN_USER_ROOM: 'join_user_room',
  LEAVE_USER_ROOM: 'leave_user_room',
};

// Location Settings
export const LOCATION_SETTINGS = {
  ACCURACY: {
    LOWEST: 0,
    LOW: 1,
    BALANCED: 2,
    HIGH: 3,
    HIGHEST: 4,
    BEST_FOR_NAVIGATION: 5,
  },
  UPDATE_INTERVAL: 10000, // 10 seconds
  FASTEST_INTERVAL: 5000, // 5 seconds
  DISTANCE_INTERVAL: 10, // 10 meters
};

// Validation Rules
export const VALIDATION = {
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  OTP_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Unauthorized access. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  OTP_SENT: 'Verification code sent successfully.',
  LOGIN_SUCCESS: 'Login successful!',
  PROFILE_UPDATED: 'Profile updated successfully.',
  EMERGENCY_CREATED: 'Emergency request created successfully.',
  EMERGENCY_CANCELLED: 'Emergency request cancelled.',
};

// Emergency Contact Numbers (Country-specific)
export const EMERGENCY_CONTACTS = {
  US: {
    EMERGENCY: '911',
    AMBULANCE: '911',
    FIRE: '911',
    POLICE: '911',
    POISON_CONTROL: '1-800-222-1222',
  },
  IN: {
    EMERGENCY: '112',
    AMBULANCE: '108',
    FIRE: '101',
    POLICE: '100',
    WOMEN_HELPLINE: '1091',
  },
};

// Timeouts
export const TIMEOUTS = {
  REQUEST_TIMEOUT: 30000, // 30 seconds
  EMERGENCY_TIMEOUT: 300000, // 5 minutes
  OTP_TIMEOUT: 60000, // 1 minute
  SOCKET_TIMEOUT: 10000, // 10 seconds
};

// Animation Durations
export const ANIMATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Map Settings
export const MAP_SETTINGS = {
  DEFAULT_ZOOM: 15,
  MARKER_SIZE: 20,
  POLYLINE_WIDTH: 3,
  ANIMATION_DURATION: 1000,
};

// First Aid Categories
export const FIRST_AID_CATEGORIES = {
  BURNS: 'burns',
  CUTS: 'cuts',
  FRACTURES: 'fractures',
  CHOKING: 'choking',
  HEART_ATTACK: 'heart_attack',
  STROKE: 'stroke',
  ALLERGIC_REACTION: 'allergic_reaction',
  CONCUSSION: 'concussion',
};