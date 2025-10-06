/**
 * Aapatt Emergency Superapp - Validation Middleware
 * Request validation using Joi schemas
 */

const { validationResult, body, param, query } = require('express-validator');
const { createApiResponse } = require('@aapatt/shared');
const logger = require('../services/loggerService');

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    logger.api('Validation failed', { 
      endpoint: req.originalUrl,
      method: req.method,
      errors: errorDetails 
    });

    return res.status(400).json(
      createApiResponse(false, null, 'Validation failed', 400, { errors: errorDetails })
    );
  }

  next();
};

/**
 * Validate phone number format
 */
const validatePhoneNumber = () => [
  body('phoneNumber')
    .matches(/^(\+91|91)?[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian phone number')
    .normalizeEmail()
];

/**
 * Validate OTP format
 */
const validateOTP = () => [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

/**
 * Validate user registration data
 */
const validateUserRegistration = () => [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must contain only letters and spaces'),
  
  body('phoneNumber')
    .matches(/^(\+91|91)?[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['CITIZEN', 'PROVIDER', 'ADMIN'])
    .withMessage('Invalid user role')
];

/**
 * Validate emergency request data
 */
const validateEmergencyRequest = () => [
  body('type')
    .isIn(['AMBULANCE', 'FIRE', 'AIR_AMBULANCE'])
    .withMessage('Invalid emergency type'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  
  body('priority')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Priority must be between 1 and 5'),
  
  body('hasSecurityAlert')
    .optional()
    .isBoolean()
    .withMessage('Security alert must be true or false')
];

/**
 * Validate provider registration data
 */
const validateProviderRegistration = () => [
  body('type')
    .isIn(['AMBULANCE', 'FIRE', 'AIR_AMBULANCE'])
    .withMessage('Invalid provider type'),
  
  body('vehicleNumber')
    .trim()
    .isLength({ min: 4, max: 15 })
    .withMessage('Vehicle number must be between 4 and 15 characters')
    .matches(/^[A-Z0-9\s-]+$/i)
    .withMessage('Invalid vehicle number format'),
  
  body('licenseNumber')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('License number must be between 5 and 20 characters'),
  
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  body('documents.license')
    .isURL()
    .withMessage('License document must be a valid URL'),
  
  body('documents.vehicleRegistration')
    .isURL()
    .withMessage('Vehicle registration document must be a valid URL'),
  
  body('documents.insurance')
    .optional()
    .isURL()
    .withMessage('Insurance document must be a valid URL')
];

/**
 * Validate location update data
 */
const validateLocationUpdate = () => [
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  body('accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Accuracy must be a positive number'),
  
  body('speed')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Speed must be a positive number'),
  
  body('heading')
    .optional()
    .isFloat({ min: 0, max: 360 })
    .withMessage('Heading must be between 0 and 360 degrees')
];

/**
 * Validate status update data
 */
const validateStatusUpdate = () => [
  body('status')
    .isIn(['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('eta')
    .optional()
    .isInt({ min: 0, max: 300 })
    .withMessage('ETA must be between 0 and 300 minutes')
];

/**
 * Validate image analysis data
 */
const validateImageAnalysis = () => [
  body('image')
    .custom((value) => {
      if (!value || typeof value !== 'string') {
        throw new Error('Image data is required');
      }
      
      // Check if it's base64 encoded
      const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
      if (!base64Regex.test(value)) {
        throw new Error('Image must be base64 encoded with proper MIME type');
      }
      
      // Check size (approximate - base64 is ~33% larger than binary)
      const sizeInBytes = (value.length * 3) / 4;
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (sizeInBytes > maxSize) {
        throw new Error('Image size cannot exceed 10MB');
      }
      
      return true;
    }),
  
  body('imageType')
    .optional()
    .isIn(['jpg', 'jpeg', 'png', 'gif'])
    .withMessage('Invalid image type')
];

/**
 * Validate pagination parameters
 */
const validatePagination = () => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isAlpha()
    .withMessage('Sort field must contain only letters'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * Validate search parameters
 */
const validateSearch = () => [
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 km'),
  
  query('type')
    .optional()
    .isIn(['AMBULANCE', 'FIRE', 'AIR_AMBULANCE'])
    .withMessage('Invalid emergency type')
];

/**
 * Validate ID parameter
 */
const validateId = (paramName = 'id') => [
  param(paramName)
    .isLength({ min: 1 })
    .withMessage(`${paramName} is required`)
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(`Invalid ${paramName} format`)
];

/**
 * Validate notification data
 */
const validateNotification = () => [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  
  body('type')
    .isIn(['EMERGENCY_REQUEST', 'STATUS_UPDATE', 'SYSTEM_ALERT', 'MARKETING'])
    .withMessage('Invalid notification type'),
  
  body('data')
    .optional()
    .custom((value) => {
      if (value && typeof value !== 'object') {
        throw new Error('Data must be a valid JSON object');
      }
      return true;
    })
];

/**
 * Validate analytics request
 */
const validateAnalytics = () => [
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      const startDate = new Date(req.query.startDate);
      const end = new Date(endDate);
      
      if (end <= startDate) {
        throw new Error('End date must be after start date');
      }
      
      // Limit to 1 year range
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      if (end - startDate > oneYear) {
        throw new Error('Date range cannot exceed 1 year');
      }
      
      return true;
    }),
  
  query('granularity')
    .optional()
    .isIn(['hour', 'day', 'week', 'month'])
    .withMessage('Invalid granularity'),
  
  query('metrics')
    .optional()
    .custom((value) => {
      if (value) {
        const metrics = Array.isArray(value) ? value : [value];
        const validMetrics = ['requests', 'response_time', 'completion_rate', 'provider_utilization'];
        
        for (const metric of metrics) {
          if (!validMetrics.includes(metric)) {
            throw new Error(`Invalid metric: ${metric}`);
          }
        }
      }
      return true;
    })
];

/**
 * Sanitize input data
 */
const sanitizeInput = () => [
  body('*').customSanitizer((value) => {
    if (typeof value === 'string') {
      // Remove potential XSS content
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>?/gm, '')
        .trim();
    }
    return value;
  })
];

/**
 * Validate file upload
 */
const validateFileUpload = () => [
  body('type')
    .isIn(['image', 'document', 'video'])
    .withMessage('Invalid file type'),
  
  body('category')
    .isIn(['profile', 'license', 'vehicle', 'insurance', 'injury'])
    .withMessage('Invalid file category')
];

module.exports = {
  handleValidationErrors,
  validatePhoneNumber,
  validateOTP,
  validateUserRegistration,
  validateEmergencyRequest,
  validateProviderRegistration,
  validateLocationUpdate,
  validateStatusUpdate,
  validateImageAnalysis,
  validatePagination,
  validateSearch,
  validateId,
  validateNotification,
  validateAnalytics,
  sanitizeInput,
  validateFileUpload
};