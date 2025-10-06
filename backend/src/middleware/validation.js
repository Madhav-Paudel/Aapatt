const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        error: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Auth validation schemas
const loginSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  otp: Joi.string().length(6).required()
});

const verifyOTPSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  otp: Joi.string().length(6).required()
});

// Emergency request validation schemas
const createRequestSchema = Joi.object({
  serviceType: Joi.string().valid('AMBULANCE', 'FIRE_BRIGADE', 'AIR_AMBULANCE', 'POLICE', 'SECURITY').required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  address: Joi.string().max(500).optional(),
  landmark: Joi.string().max(200).optional(),
  description: Joi.string().max(1000).optional(),
  injuryType: Joi.string().max(100).optional(),
  severity: Joi.string().valid('MINOR', 'MODERATE', 'SEVERE', 'CRITICAL', 'FATAL').optional(),
  isSecurityAlert: Joi.boolean().default(false)
});

const updateRequestStatusSchema = Joi.object({
  status: Joi.string().valid('ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED').required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional()
});

// Provider validation schemas
const createProviderProfileSchema = Joi.object({
  serviceType: Joi.string().valid('AMBULANCE', 'FIRE_BRIGADE', 'AIR_AMBULANCE', 'POLICE', 'SECURITY').required(),
  licenseNumber: Joi.string().max(100).optional(),
  vehicleNumber: Joi.string().max(50).optional()
});

const updateLocationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  accuracy: Joi.number().min(0).optional(),
  speed: Joi.number().min(0).optional(),
  heading: Joi.number().min(0).max(360).optional()
});

// AI validation schemas
const analyzeImageSchema = Joi.object({
  image: Joi.string().base64().required(),
  requestId: Joi.string().optional()
});

// Admin validation schemas
const createUserSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  name: Joi.string().max(100).optional(),
  email: Joi.string().email().optional(),
  userType: Joi.string().valid('CITIZEN', 'PROVIDER', 'ADMIN').required()
});

module.exports = {
  validateRequest,
  loginSchema,
  verifyOTPSchema,
  createRequestSchema,
  updateRequestStatusSchema,
  createProviderProfileSchema,
  updateLocationSchema,
  analyzeImageSchema,
  createUserSchema
};