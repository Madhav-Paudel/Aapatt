import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export enum EmergencyType {
  AMBULANCE = 'ambulance',
  FIRE_BRIGADE = 'fire_brigade',
  AIR_AMBULANCE = 'air_ambulance'
}

export enum RequestStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  ENROUTE = 'enroute',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProviderStatus {
  OFFLINE = 'offline',
  AVAILABLE = 'available',
  BUSY = 'busy'
}

export enum UserRole {
  CITIZEN = 'citizen',
  PROVIDER = 'provider',
  ADMIN = 'admin',
  SECURITY = 'security'
}

export enum AICondition {
  BLEEDING = 'bleeding',
  CHOKING = 'choking',
  CPR_NEEDED = 'cpr_needed',
  BURNS = 'burns',
  FRACTURE = 'fracture',
  UNCONSCIOUS = 'unconscious',
  UNKNOWN = 'unknown'
}

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

export const LocationSchema = z.object({
  coordinates: CoordinatesSchema,
  address: z.string().optional(),
  landmark: z.string().optional()
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  phone: z.string(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  isVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

// ============================================================================
// EMERGENCY REQUEST SCHEMAS
// ============================================================================

export const EmergencyRequestSchema = z.object({
  id: z.string().uuid(),
  citizenId: z.string().uuid(),
  type: z.nativeEnum(EmergencyType),
  status: z.nativeEnum(RequestStatus),
  location: LocationSchema,
  description: z.string().optional(),
  isSecurityAlert: z.boolean().default(false),
  assignedProviderId: z.string().uuid().optional(),
  estimatedArrival: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateEmergencyRequestSchema = z.object({
  type: z.nativeEnum(EmergencyType),
  location: LocationSchema,
  description: z.string().optional(),
  isSecurityAlert: z.boolean().default(false)
});

// ============================================================================
// PROVIDER SCHEMAS
// ============================================================================

export const ProviderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(EmergencyType),
  vehicleNumber: z.string(),
  licenseNumber: z.string(),
  currentLocation: LocationSchema.optional(),
  status: z.nativeEnum(ProviderStatus),
  isOnline: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const UpdateProviderLocationSchema = z.object({
  location: LocationSchema,
  status: z.nativeEnum(ProviderStatus).optional()
});

// ============================================================================
// AI FIRST AID SCHEMAS
// ============================================================================

export const AIAnalysisSchema = z.object({
  condition: z.nativeEnum(AICondition),
  confidence: z.number().min(0).max(1),
  firstAidSteps: z.array(z.string()),
  videoUrl: z.string().url().optional(),
  emergency: z.boolean() // Indicates if immediate emergency call needed
});

export const FirstAidRequestSchema = z.object({
  imageBase64: z.string(), // Base64 encoded image from camera
  location: LocationSchema.optional(),
  additionalInfo: z.string().optional()
});

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  createdAt: z.date()
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  total: z.number(),
  totalPages: z.number()
});

// ============================================================================
// REAL-TIME EVENT SCHEMAS
// ============================================================================

export const RealTimeEventSchema = z.object({
  type: z.enum([
    'request_created',
    'request_assigned', 
    'request_accepted',
    'provider_location_update',
    'request_status_update',
    'provider_status_update'
  ]),
  data: z.any(),
  timestamp: z.date(),
  userId: z.string().uuid().optional() // Target user for the event
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type User = z.infer<typeof UserSchema>;
export type EmergencyRequest = z.infer<typeof EmergencyRequestSchema>;
export type CreateEmergencyRequest = z.infer<typeof CreateEmergencyRequestSchema>;
export type Provider = z.infer<typeof ProviderSchema>;
export type UpdateProviderLocation = z.infer<typeof UpdateProviderLocationSchema>;
export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;
export type FirstAidRequest = z.infer<typeof FirstAidRequestSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type Pagination = z.infer<typeof PaginationSchema>;
export type RealTimeEvent = z.infer<typeof RealTimeEventSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const CONSTANTS = {
  // Distance in meters for nearby provider search
  NEARBY_RADIUS: 10000, // 10km
  
  // Max providers to notify for a request
  MAX_PROVIDERS_TO_NOTIFY: 5,
  
  // Auto-cancel request if no provider accepts in minutes
  AUTO_CANCEL_TIMEOUT: 15,
  
  // Location update interval in seconds
  LOCATION_UPDATE_INTERVAL: 10,
  
  // AI confidence threshold for first aid suggestions
  AI_CONFIDENCE_THRESHOLD: 0.7,
  
  // Free tier API limits
  HUGGING_FACE_RATE_LIMIT: 30, // requests per minute
  
  // Emergency contact numbers
  EMERGENCY_CONTACTS: {
    POLICE: '100',
    FIRE: '101', 
    AMBULANCE: '108',
    DISASTER: '112'
  }
} as const;