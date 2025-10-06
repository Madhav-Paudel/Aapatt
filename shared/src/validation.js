/**
 * Aapatt - Shared Validation
 * Common validation schemas and functions
 */

import { EMERGENCY_TYPES, CONFIG } from './constants.js';
import { isValidPhone, isValidCoordinates } from './utils.js';

/**
 * Validate emergency request data
 * @param {Object} data - Request data
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateEmergencyRequest = (data) => {
  const errors = [];
  
  // Validate emergency type
  if (!data.type || !Object.values(EMERGENCY_TYPES).includes(data.type)) {
    errors.push('Invalid emergency type');
  }
  
  // Validate location
  if (!data.location) {
    errors.push('Location is required');
  } else {
    if (!isValidCoordinates(data.location.latitude, data.location.longitude)) {
      errors.push('Invalid coordinates');
    }
  }
  
  // Validate description
  if (data.description && data.description.length > CONFIG.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${CONFIG.MAX_DESCRIPTION_LENGTH} characters`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate user registration data
 * @param {Object} data - User data
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateUserRegistration = (data) => {
  const errors = [];
  
  // Validate phone number
  if (!data.phone) {
    errors.push('Phone number is required');
  } else if (!isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }
  
  // Validate name
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate provider data
 * @param {Object} data - Provider data
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateProviderData = (data) => {
  const errors = [];
  
  // Validate service type
  if (!data.serviceType || !Object.values(EMERGENCY_TYPES).includes(data.serviceType)) {
    errors.push('Invalid service type');
  }
  
  // Validate vehicle info
  if (!data.vehicleNumber || data.vehicleNumber.trim().length < 3) {
    errors.push('Valid vehicle number is required');
  }
  
  // Validate license
  if (!data.licenseNumber || data.licenseNumber.trim().length < 5) {
    errors.push('Valid license number is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate location update
 * @param {Object} data - Location data
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateLocationUpdate = (data) => {
  const errors = [];
  
  if (!data.latitude || !data.longitude) {
    errors.push('Latitude and longitude are required');
  } else if (!isValidCoordinates(data.latitude, data.longitude)) {
    errors.push('Invalid coordinates');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  validateEmergencyRequest,
  validateUserRegistration,
  validateProviderData,
  validateLocationUpdate
};
