// Aapatt Emergency Superapp Constants

// App Configuration
export const APP_CONFIG = {
  NAME: 'Aapatt',
  TAGLINE: 'Saving lives through intelligent technology',
  VERSION: '1.0.0',
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000'
};

// Brand Colors
export const COLORS = {
  PRIMARY: '#E53935',        // Emergency Red
  SECONDARY: '#1565C0',      // Trust Blue
  ACCENT: '#FFEB3B',         // Alert Yellow
  SUCCESS: '#43A047',        // Safe Green
  WARNING: '#FF9800',        // Warning Orange
  DANGER: '#D32F2F',         // Danger Red
  INFO: '#2196F3',           // Info Blue
  LIGHT: '#F5F5F5',          // Light Gray
  DARK: '#212121',           // Dark Gray
  WHITE: '#FFFFFF',
  BLACK: '#000000'
};

// Service Types
export const SERVICE_TYPES = {
  AMBULANCE: {
    key: 'AMBULANCE',
    label: 'Ambulance',
    icon: '🚑',
    color: COLORS.PRIMARY,
    description: 'Medical emergencies requiring ambulance service'
  },
  FIRE_BRIGADE: {
    key: 'FIRE_BRIGADE',
    label: 'Fire Brigade',
    icon: '🚒',
    color: '#FF5722',
    description: 'Fire, accidents, and rescue operations'
  },
  AIR_AMBULANCE: {
    key: 'AIR_AMBULANCE',
    label: 'Air Ambulance',
    icon: '🚁',
    color: '#9C27B0',
    description: 'Critical cases requiring airlift'
  },
  POLICE: {
    key: 'POLICE',
    label: 'Police',
    icon: '👮',
    color: '#3F51B5',
    description: 'Law enforcement and security'
  },
  SECURITY: {
    key: 'SECURITY',
    label: 'Security',
    icon: '🛡️',
    color: '#607D8B',
    description: 'Private security services'
  }
};

// Request Status
export const REQUEST_STATUS = {
  PENDING: {
    key: 'PENDING',
    label: 'Pending',
    color: COLORS.WARNING,
    description: 'Waiting for provider to accept'
  },
  ACCEPTED: {
    key: 'ACCEPTED',
    label: 'Accepted',
    color: COLORS.INFO,
    description: 'Provider has accepted the request'
  },
  EN_ROUTE: {
    key: 'EN_ROUTE',
    label: 'En Route',
    color: COLORS.SECONDARY,
    description: 'Provider is on the way'
  },
  ARRIVED: {
    key: 'ARRIVED',
    label: 'Arrived',
    color: COLORS.SUCCESS,
    description: 'Provider has arrived at location'
  },
  COMPLETED: {
    key: 'COMPLETED',
    label: 'Completed',
    color: COLORS.SUCCESS,
    description: 'Request has been completed'
  },
  CANCELLED: {
    key: 'CANCELLED',
    label: 'Cancelled',
    color: COLORS.DANGER,
    description: 'Request was cancelled'
  },
  EXPIRED: {
    key: 'EXPIRED',
    label: 'Expired',
    color: COLORS.DARK,
    description: 'Request expired without response'
  }
};

// Priority Levels
export const PRIORITY = {
  LOW: {
    key: 'LOW',
    label: 'Low',
    color: COLORS.SUCCESS,
    value: 1
  },
  MEDIUM: {
    key: 'MEDIUM',
    label: 'Medium',
    color: COLORS.WARNING,
    value: 2
  },
  HIGH: {
    key: 'HIGH',
    label: 'High',
    color: COLORS.DANGER,
    value: 3
  },
  CRITICAL: {
    key: 'CRITICAL',
    label: 'Critical',
    color: COLORS.PRIMARY,
    value: 4
  }
};

// Severity Levels
export const SEVERITY = {
  MINOR: {
    key: 'MINOR',
    label: 'Minor',
    color: COLORS.SUCCESS,
    description: 'Minor injury or condition'
  },
  MODERATE: {
    key: 'MODERATE',
    label: 'Moderate',
    color: COLORS.WARNING,
    description: 'Moderate injury requiring attention'
  },
  SEVERE: {
    key: 'SEVERE',
    label: 'Severe',
    color: COLORS.DANGER,
    description: 'Severe injury requiring immediate care'
  },
  CRITICAL: {
    key: 'CRITICAL',
    label: 'Critical',
    color: COLORS.PRIMARY,
    description: 'Critical condition requiring emergency care'
  },
  FATAL: {
    key: 'FATAL',
    label: 'Fatal',
    color: COLORS.BLACK,
    description: 'Life-threatening condition'
  }
};

// User Types
export const USER_TYPES = {
  CITIZEN: {
    key: 'CITIZEN',
    label: 'Citizen',
    description: 'Regular users who can request emergency services'
  },
  PROVIDER: {
    key: 'PROVIDER',
    label: 'Service Provider',
    description: 'Emergency service providers (ambulance, fire, etc.)'
  },
  ADMIN: {
    key: 'ADMIN',
    label: 'Administrator',
    description: 'System administrators and coordinators'
  }
};

// Notification Types
export const NOTIFICATION_TYPES = {
  EMERGENCY_REQUEST: {
    key: 'EMERGENCY_REQUEST',
    title: 'New Emergency Request',
    icon: '🚨',
    color: COLORS.PRIMARY
  },
  REQUEST_ACCEPTED: {
    key: 'REQUEST_ACCEPTED',
    title: 'Request Accepted',
    icon: '✅',
    color: COLORS.SUCCESS
  },
  PROVIDER_EN_ROUTE: {
    key: 'PROVIDER_EN_ROUTE',
    title: 'Provider En Route',
    icon: '🚗',
    color: COLORS.INFO
  },
  PROVIDER_ARRIVED: {
    key: 'PROVIDER_ARRIVED',
    title: 'Provider Arrived',
    icon: '📍',
    color: COLORS.SUCCESS
  },
  REQUEST_COMPLETED: {
    key: 'REQUEST_COMPLETED',
    title: 'Request Completed',
    icon: '✅',
    color: COLORS.SUCCESS
  },
  REQUEST_CANCELLED: {
    key: 'REQUEST_CANCELLED',
    title: 'Request Cancelled',
    icon: '❌',
    color: COLORS.DANGER
  },
  SYSTEM_ALERT: {
    key: 'SYSTEM_ALERT',
    title: 'System Alert',
    icon: '⚠️',
    color: COLORS.WARNING
  },
  FIRST_AID_GUIDANCE: {
    key: 'FIRST_AID_GUIDANCE',
    title: 'First Aid Guidance',
    icon: '🏥',
    color: COLORS.INFO
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout'
  },
  REQUESTS: {
    CREATE: '/requests',
    LIST: '/requests',
    GET: '/requests/:id',
    CANCEL: '/requests/:id/cancel',
    UPDATE_STATUS: '/requests/:id/status'
  },
  PROVIDERS: {
    PROFILE: '/providers/profile',
    LOCATION: '/providers/location',
    STATUS: '/providers/status',
    REQUESTS: '/providers/requests',
    ACCEPT: '/providers/requests/:id/accept',
    HISTORY: '/providers/history'
  },
  AI: {
    ANALYZE_INJURY: '/ai/analyze-injury',
    FIRST_AID: '/ai/first-aid/:type',
    INJURY_TYPES: '/ai/injury-types',
    CHECK_EMERGENCY: '/ai/check-emergency',
    ASSESSMENT: '/ai/emergency-assessment'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    REQUESTS: '/admin/requests',
    PROVIDERS: '/admin/providers',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics'
  }
};

// Socket Events
export const SOCKET_EVENTS = {
  // Client to Server
  AUTHENTICATE: 'authenticate',
  LOCATION_UPDATE: 'location_update',
  PROVIDER_STATUS_UPDATE: 'provider_status_update',
  JOIN_ADMIN_DASHBOARD: 'join_admin_dashboard',
  
  // Server to Client
  AUTHENTICATED: 'authenticated',
  AUTH_ERROR: 'auth_error',
  NEW_EMERGENCY_REQUEST: 'new_emergency_request',
  REQUEST_STATUS_UPDATE: 'request_status_update',
  PROVIDER_LOCATION_UPDATE: 'provider_location_update',
  PROVIDER_STATUS_CHANGED: 'provider_status_changed',
  ERROR: 'error'
};

// Validation Rules
export const VALIDATION_RULES = {
  PHONE_NUMBER: /^\+?[1-9]\d{1,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  OTP: /^\d{6}$/,
  COORDINATES: {
    LATITUDE: { min: -90, max: 90 },
    LONGITUDE: { min: -180, max: 180 }
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  INVALID_CREDENTIALS: 'Invalid phone number or OTP.',
  REQUEST_FAILED: 'Failed to process request. Please try again.',
  LOCATION_ERROR: 'Unable to get your location. Please enable location services.',
  PERMISSION_DENIED: 'Permission denied. Please check your app permissions.',
  NO_PROVIDERS: 'No providers available in your area.',
  REQUEST_EXPIRED: 'This request has expired.',
  INVALID_REQUEST: 'Invalid request data provided.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REQUEST_CREATED: 'Emergency request created successfully.',
  REQUEST_ACCEPTED: 'Request accepted successfully.',
  LOCATION_UPDATED: 'Location updated successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  OTP_SENT: 'OTP sent to your phone number.',
  LOGIN_SUCCESS: 'Login successful.'
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  EMERGENCY_ZOOM: 18,
  PROVIDER_ZOOM: 16,
  DEFAULT_CENTER: {
    latitude: 28.6139, // Delhi, India
    longitude: 77.2090
  }
};

// Time Constants
export const TIME_CONSTANTS = {
  OTP_EXPIRY: 5 * 60 * 1000, // 5 minutes
  REQUEST_TIMEOUT: 10 * 60 * 1000, // 10 minutes
  LOCATION_UPDATE_INTERVAL: 10 * 1000, // 10 seconds
  HEARTBEAT_INTERVAL: 30 * 1000, // 30 seconds
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGE_DIMENSION: 2048
};

export default {
  APP_CONFIG,
  COLORS,
  SERVICE_TYPES,
  REQUEST_STATUS,
  PRIORITY,
  SEVERITY,
  USER_TYPES,
  NOTIFICATION_TYPES,
  API_ENDPOINTS,
  SOCKET_EVENTS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MAP_CONFIG,
  TIME_CONSTANTS,
  UPLOAD_LIMITS
};