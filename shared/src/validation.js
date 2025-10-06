/**
 * Aapatt Emergency Superapp - Validation Schemas
 * Joi validation schemas for data validation across applications
 */

import Joi from 'joi';
import { EMERGENCY_TYPES, REQUEST_STATUS, PROVIDER_STATUS, USER_ROLES } from './constants.js';

// Base schemas
const phoneNumberSchema = Joi.string()
  .pattern(/^(\+91|91)?[6-9]\d{9}$/)
  .required()
  .messages({
    'string.pattern.base': 'Please enter a valid Indian phone number',
    'any.required': 'Phone number is required'
  });

const otpSchema = Joi.string()
  .pattern(/^\d{6}$/)
  .required()
  .messages({
    'string.pattern.base': 'OTP must be 6 digits',
    'any.required': 'OTP is required'
  });

const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  address: Joi.string().max(500).optional(),
  landmark: Joi.string().max(200).optional()
});

// User validation schemas
export const userRegistrationSchema = Joi.object({
  phoneNumber: phoneNumberSchema,
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().optional(),
  role: Joi.string().valid(...Object.values(USER_ROLES)).default(USER_ROLES.CITIZEN)
});

export const userLoginSchema = Joi.object({
  phoneNumber: phoneNumberSchema
});

export const otpVerificationSchema = Joi.object({
  phoneNumber: phoneNumberSchema,
  otp: otpSchema
});

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  location: locationSchema.optional()
});

// Emergency request validation schemas
export const emergencyRequestSchema = Joi.object({
  type: Joi.string().valid(...Object.keys(EMERGENCY_TYPES)).required().messages({
    'any.only': 'Invalid emergency type',
    'any.required': 'Emergency type is required'
  }),
  location: locationSchema.required(),
  description: Joi.string().max(1000).required().messages({
    'string.max': 'Description cannot exceed 1000 characters',
    'any.required': 'Emergency description is required'
  }),
  priority: Joi.number().integer().min(1).max(5).default(1),
  contactNumber: phoneNumberSchema.optional(),
  hasSecurityAlert: Joi.boolean().default(false)
});

export const requestStatusUpdateSchema = Joi.object({
  status: Joi.string().valid(...Object.values(REQUEST_STATUS)).required(),
  providerId: Joi.string().when('status', {
    is: Joi.string().valid(REQUEST_STATUS.ACCEPTED, REQUEST_STATUS.EN_ROUTE, REQUEST_STATUS.ARRIVED),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  notes: Joi.string().max(500).optional(),
  eta: Joi.number().integer().min(0).optional()
});

// Provider validation schemas
export const providerRegistrationSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid(...Object.keys(EMERGENCY_TYPES)).required(),
  vehicleNumber: Joi.string().min(4).max(15).required().messages({
    'string.min': 'Vehicle number must be at least 4 characters',
    'string.max': 'Vehicle number cannot exceed 15 characters',
    'any.required': 'Vehicle number is required'
  }),
  licenseNumber: Joi.string().min(5).max(20).required().messages({
    'string.min': 'License number must be at least 5 characters', 
    'string.max': 'License number cannot exceed 20 characters',
    'any.required': 'License number is required'
  }),
  location: locationSchema.required(),
  documents: Joi.object({
    license: Joi.string().uri().required(),
    vehicleRegistration: Joi.string().uri().required(),
    insurance: Joi.string().uri().optional()
  }).required()
});

export const providerStatusUpdateSchema = Joi.object({
  status: Joi.string().valid(...Object.values(PROVIDER_STATUS)).required(),
  location: locationSchema.optional()
});

export const providerLocationUpdateSchema = Joi.object({
  location: locationSchema.required(),
  requestId: Joi.string().optional(),
  timestamp: Joi.date().iso().default(() => new Date())
});

// AI service validation schemas
export const imageAnalysisSchema = Joi.object({
  image: Joi.string().base64().max(10 * 1024 * 1024).required().messages({
    'string.base64': 'Image must be valid base64 encoded',
    'string.max': 'Image size cannot exceed 10MB',
    'any.required': 'Image is required'
  }),
  imageType: Joi.string().valid('jpg', 'jpeg', 'png').required()
});

export const firstAidRequestSchema = Joi.object({
  category: Joi.string().required(),
  symptoms: Joi.array().items(Joi.string()).optional(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional()
});

// Search and filter schemas
export const nearbyProvidersSchema = Joi.object({
  location: locationSchema.required(),
  radius: Joi.number().min(1).max(50).default(10).messages({
    'number.min': 'Search radius must be at least 1 km',
    'number.max': 'Search radius cannot exceed 50 km'
  }),
  type: Joi.string().valid(...Object.keys(EMERGENCY_TYPES)).optional(),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

export const requestHistorySchema = Joi.object({
  userId: Joi.string().required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  status: Joi.string().valid(...Object.values(REQUEST_STATUS)).optional(),
  type: Joi.string().valid(...Object.keys(EMERGENCY_TYPES)).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// Admin validation schemas
export const adminAnalyticsSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  granularity: Joi.string().valid('hour', 'day', 'week', 'month').default('day'),
  metrics: Joi.array().items(
    Joi.string().valid('requests', 'response_time', 'completion_rate', 'provider_utilization')
  ).default(['requests'])
});

export const bulkProviderUpdateSchema = Joi.object({
  providerIds: Joi.array().items(Joi.string()).min(1).max(100).required(),
  updates: Joi.object({
    status: Joi.string().valid(...Object.values(PROVIDER_STATUS)).optional(),
    isVerified: Joi.boolean().optional(),
    isActive: Joi.boolean().optional()
  }).required()
});

// Notification schemas
export const notificationSchema = Joi.object({
  userId: Joi.string().required(),
  title: Joi.string().max(100).required(),
  message: Joi.string().max(500).required(),
  type: Joi.string().valid('emergency_request', 'status_update', 'system_alert', 'marketing').required(),
  data: Joi.object().optional(),
  scheduledAt: Joi.date().iso().optional()
});

// Socket event schemas
export const socketMessageSchema = Joi.object({
  event: Joi.string().required(),
  data: Joi.any().required(),
  userId: Joi.string().optional(),
  requestId: Joi.string().optional(),
  timestamp: Joi.date().iso().default(() => new Date())
});

// File upload schemas
export const fileUploadSchema = Joi.object({
  file: Joi.any().required(),
  type: Joi.string().valid('image', 'document', 'video').required(),
  category: Joi.string().valid('profile', 'license', 'vehicle', 'insurance', 'injury').required(),
  maxSize: Joi.number().max(10 * 1024 * 1024).default(5 * 1024 * 1024) // 5MB default
});

// Pagination schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Geofence schemas
export const geofenceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  boundaries: Joi.array().items(locationSchema).min(3).required().messages({
    'array.min': 'Geofence must have at least 3 boundary points'
  }),
  type: Joi.string().valid('city', 'district', 'zone', 'restricted').required(),
  isActive: Joi.boolean().default(true)
});

// Emergency contact schemas
export const emergencyContactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phoneNumber: phoneNumberSchema,
  relationship: Joi.string().valid('family', 'friend', 'colleague', 'doctor', 'other').required(),
  isPrimary: Joi.boolean().default(false)
});

// System health schemas
export const healthCheckSchema = Joi.object({
  service: Joi.string().valid('database', 'redis', 'socket', 'ai', 'notifications').required(),
  status: Joi.string().valid('healthy', 'degraded', 'down').required(),
  responseTime: Joi.number().min(0).optional(),
  details: Joi.object().optional()
});

// Validation helper functions
export const validateSchema = (schema, data) => {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return {
      isValid: false,
      errors: errorDetails,
      value: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    value
  };
};

export const createValidationMiddleware = (schema) => {
  return (req, res, next) => {
    const { isValid, errors, value } = validateSchema(schema, req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    req.validatedData = value;
    next();
  };
};

export default {
  // User schemas
  userRegistrationSchema,
  userLoginSchema,
  otpVerificationSchema,
  userUpdateSchema,
  
  // Request schemas
  emergencyRequestSchema,
  requestStatusUpdateSchema,
  
  // Provider schemas
  providerRegistrationSchema,
  providerStatusUpdateSchema,
  providerLocationUpdateSchema,
  
  // AI schemas
  imageAnalysisSchema,
  firstAidRequestSchema,
  
  // Search schemas
  nearbyProvidersSchema,
  requestHistorySchema,
  
  // Admin schemas
  adminAnalyticsSchema,
  bulkProviderUpdateSchema,
  
  // Other schemas
  notificationSchema,
  socketMessageSchema,
  fileUploadSchema,
  paginationSchema,
  geofenceSchema,
  emergencyContactSchema,
  healthCheckSchema,
  
  // Helper functions
  validateSchema,
  createValidationMiddleware
};