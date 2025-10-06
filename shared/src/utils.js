/**
 * Aapatt Emergency Superapp - Shared Utilities
 * Common utility functions used across all applications
 */

import { ERROR_MESSAGES, CONFIG } from './constants.js';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - First coordinate {latitude, longitude}
 * @param {Object} coord2 - Second coordinate {latitude, longitude}
 * @returns {number} Distance in meters
 */
export const calculateDistance = (coord1, coord2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

/**
 * Calculate estimated time of arrival based on distance
 * @param {number} distance - Distance in meters
 * @param {number} averageSpeed - Average speed in km/h (default: 40)
 * @returns {number} ETA in minutes
 */
export const calculateETA = (distance, averageSpeed = 40) => {
  const distanceKm = distance / 1000;
  const timeHours = distanceKm / averageSpeed;
  return Math.ceil(timeHours * 60); // Convert to minutes and round up
};

/**
 * Format distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

/**
 * Format time duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted time string
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }
};

/**
 * Format phone number for display
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format Indian phone numbers (+91)
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phoneNumber; // Return original if can't format
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if location is within bounds
 * @param {Object} location - Location to check
 * @param {Object} bounds - Boundary coordinates
 * @returns {boolean} True if within bounds
 */
export const isLocationWithinBounds = (location, bounds) => {
  return (
    location.latitude >= bounds.southwest.latitude &&
    location.latitude <= bounds.northeast.latitude &&
    location.longitude >= bounds.southwest.longitude &&
    location.longitude <= bounds.northeast.longitude
  );
};

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format timestamp for display
 * @param {string|Date} timestamp - Timestamp to format
 * @param {string} format - Format type ('relative', 'short', 'long')
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (timestamp, format = 'relative') => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (format === 'relative') {
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } else if (format === 'short') {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (format === 'long') {
    return date.toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return date.toISOString();
};

/**
 * Sanitize string input
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Generate OTP
 * @param {number} length - OTP length (default: 6)
 * @returns {string} Generated OTP
 */
export const generateOTP = (length = 6) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @param {number} length - Expected length (default: 6)
 * @returns {boolean} True if valid
 */
export const isValidOTP = (otp, length = 6) => {
  return /^\d+$/.test(otp) && otp.length === length;
};

/**
 * Convert base64 to blob
 * @param {string} base64 - Base64 string
 * @param {string} mimeType - MIME type
 * @returns {Blob} Blob object
 */
export const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Check if image format is supported
 * @param {string} filename - Image filename
 * @returns {boolean} True if supported
 */
export const isSupportedImageFormat = (filename) => {
  const extension = filename.toLowerCase().split('.').pop();
  return CONFIG.HUGGING_FACE.SUPPORTED_FORMATS.includes(extension);
};

/**
 * Get error message for error code
 * @param {string} errorCode - Error code
 * @returns {string} Error message
 */
export const getErrorMessage = (errorCode) => {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.SOMETHING_WENT_WRONG;
};

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Create API response object
 * @param {boolean} success - Success status
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @param {number} code - Response code
 * @returns {Object} API response object
 */
export const createApiResponse = (success, data = null, message = '', code = 200) => {
  return {
    success,
    data,
    message,
    code,
    timestamp: getCurrentTimestamp()
  };
};

/**
 * Parse API error response
 * @param {Error} error - Error object
 * @returns {Object} Parsed error response
 */
export const parseApiError = (error) => {
  if (error.response && error.response.data) {
    return {
      message: error.response.data.message || ERROR_MESSAGES.SERVER_ERROR,
      code: error.response.status,
      details: error.response.data
    };
  } else if (error.request) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      code: 0,
      details: null
    };
  } else {
    return {
      message: error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
      code: 500,
      details: null
    };
  }
};

export default {
  calculateDistance,
  calculateETA,
  formatDistance,
  formatDuration,
  formatPhoneNumber,
  isValidPhoneNumber,
  isValidEmail,
  generateId,
  debounce,
  throttle,
  deepClone,
  isLocationWithinBounds,
  getCurrentTimestamp,
  formatTimestamp,
  sanitizeInput,
  generateOTP,
  isValidOTP,
  base64ToBlob,
  isSupportedImageFormat,
  getErrorMessage,
  retryWithBackoff,
  createApiResponse,
  parseApiError
};