export const EMERGENCY_TYPES = {
  AMBULANCE: 'ambulance',
  FIRE_BRIGADE: 'fire_brigade', 
  AIR_AMBULANCE: 'air_ambulance'
} as const;

export const REQUEST_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  ENROUTE: 'enroute',
  ARRIVED: 'arrived',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const PROVIDER_STATUS = {
  OFFLINE: 'offline',
  AVAILABLE: 'available',
  BUSY: 'busy'
} as const;

export const USER_ROLES = {
  CITIZEN: 'citizen',
  PROVIDER: 'provider',
  ADMIN: 'admin',
  SECURITY: 'security'
} as const;

export const AI_CONDITIONS = {
  BLEEDING: 'bleeding',
  CHOKING: 'choking',
  CPR_NEEDED: 'cpr_needed',
  BURNS: 'burns',
  FRACTURE: 'fracture',
  UNCONSCIOUS: 'unconscious',
  UNKNOWN: 'unknown'
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  VERIFY: '/api/auth/verify',
  
  // Emergency Requests
  REQUESTS: '/api/requests',
  CREATE_REQUEST: '/api/requests/create',
  UPDATE_REQUEST: '/api/requests/:id',
  CANCEL_REQUEST: '/api/requests/:id/cancel',
  
  // Providers
  PROVIDERS: '/api/providers',
  PROVIDER_LOCATION: '/api/providers/:id/location',
  PROVIDER_STATUS: '/api/providers/:id/status',
  NEARBY_PROVIDERS: '/api/providers/nearby',
  
  // AI First Aid
  AI_ANALYZE: '/api/ai/analyze',
  AI_GUIDANCE: '/api/ai/guidance',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  SEND_NOTIFICATION: '/api/notifications/send',
  
  // Admin
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_REQUESTS: '/api/admin/requests',
  ADMIN_PROVIDERS: '/api/admin/providers'
} as const;

export const WEBSOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  
  // Emergency Requests
  REQUEST_CREATED: 'request_created',
  REQUEST_ASSIGNED: 'request_assigned',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_STATUS_UPDATE: 'request_status_update',
  
  // Provider Updates
  PROVIDER_LOCATION_UPDATE: 'provider_location_update',
  PROVIDER_STATUS_UPDATE: 'provider_status_update',
  
  // Notifications
  NOTIFICATION_SENT: 'notification_sent'
} as const;

export const ERROR_CODES = {
  // Authentication
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Business Logic
  NO_PROVIDERS_AVAILABLE: 'NO_PROVIDERS_AVAILABLE',
  REQUEST_ALREADY_ASSIGNED: 'REQUEST_ALREADY_ASSIGNED',
  PROVIDER_NOT_AVAILABLE: 'PROVIDER_NOT_AVAILABLE',
  
  // External Services
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  MAPS_SERVICE_ERROR: 'MAPS_SERVICE_ERROR',
  NOTIFICATION_SERVICE_ERROR: 'NOTIFICATION_SERVICE_ERROR',
  
  // System
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export const FIRST_AID_GUIDES = {
  [AI_CONDITIONS.BLEEDING]: {
    steps: [
      'Apply direct pressure on the wound with a clean cloth',
      'Raise the injured area above the heart if possible',
      'Do not remove objects stuck in the wound',
      'Keep applying pressure until help arrives',
      'Cover with sterile bandage if available'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=bleeding-first-aid',
    emergency: true
  },
  [AI_CONDITIONS.CHOKING]: {
    steps: [
      'Encourage coughing if person is conscious',
      'Give 5 back blows between shoulder blades',
      'Give 5 abdominal thrusts (Heimlich maneuver)',
      'Alternate between back blows and abdominal thrusts',
      'Call emergency services immediately'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=choking-first-aid',
    emergency: true
  },
  [AI_CONDITIONS.CPR_NEEDED]: {
    steps: [
      'Check for responsiveness and breathing',
      'Call emergency services immediately',
      'Place heel of hand on center of chest',
      'Push hard and fast at least 2 inches deep',
      'Give 30 chest compressions at 100-120 per minute',
      'Give 2 rescue breaths, repeat cycle'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=cpr-training',
    emergency: true
  },
  [AI_CONDITIONS.BURNS]: {
    steps: [
      'Remove from heat source safely',
      'Cool burn with lukewarm water for 10-15 minutes',
      'Do not use ice, butter, or oils',
      'Cover with sterile gauze loosely',
      'Do not break blisters'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=burn-first-aid',
    emergency: false
  },
  [AI_CONDITIONS.FRACTURE]: {
    steps: [
      'Do not move the person unless necessary',
      'Support the injured area',
      'Apply ice wrapped in cloth to reduce swelling',
      'Do not realign bones',
      'Get medical help immediately'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=fracture-first-aid',
    emergency: true
  },
  [AI_CONDITIONS.UNCONSCIOUS]: {
    steps: [
      'Check for responsiveness',
      'Check for breathing and pulse',
      'Place in recovery position if breathing',
      'Do not leave alone',
      'Call emergency services immediately'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=unconscious-first-aid',
    emergency: true
  }
} as const;