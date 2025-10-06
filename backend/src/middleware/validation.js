/**
 * Validation Middleware
 * Request validation using express-validator
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
export const validateRegistration = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number format'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('role')
    .optional()
    .isIn(['CITIZEN', 'PROVIDER'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

/**
 * Validation rules for emergency request
 */
export const validateEmergencyRequest = [
  body('type')
    .notEmpty()
    .withMessage('Emergency type is required')
    .isIn(['AMBULANCE', 'FIRE_BRIGADE', 'AIR_AMBULANCE'])
    .withMessage('Invalid emergency type'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('requiresSecurity')
    .optional()
    .isBoolean()
    .withMessage('requiresSecurity must be a boolean'),
  handleValidationErrors
];

/**
 * Validation rules for provider registration
 */
export const validateProviderRegistration = [
  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['AMBULANCE', 'FIRE_BRIGADE', 'AIR_AMBULANCE'])
    .withMessage('Invalid service type'),
  body('vehicleNumber')
    .notEmpty()
    .withMessage('Vehicle number is required')
    .isLength({ min: 3 })
    .withMessage('Vehicle number must be at least 3 characters'),
  body('licenseNumber')
    .notEmpty()
    .withMessage('License number is required')
    .isLength({ min: 5 })
    .withMessage('License number must be at least 5 characters'),
  handleValidationErrors
];

/**
 * Validation rules for location update
 */
export const validateLocationUpdate = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('speed')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Speed must be a positive number'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Accuracy must be a positive number'),
  handleValidationErrors
];

/**
 * Validation rules for UUID parameter
 */
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateRegistration,
  validateEmergencyRequest,
  validateProviderRegistration,
  validateLocationUpdate,
  validateUUID
};
