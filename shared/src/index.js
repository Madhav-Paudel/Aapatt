/**
 * Aapatt Emergency Superapp - Shared Module Entry Point
 * Exports all shared utilities, constants, types, and validation schemas
 */

// Export all constants
export * from './constants.js';

// Export all types
export * from './types.js';

// Export all utilities
export * from './utils.js';

// Export all validation schemas
export * from './validation.js';

// Default export with organized structure
export default {
  constants: require('./constants.js'),
  types: require('./types.js'),
  utils: require('./utils.js'),
  validation: require('./validation.js')
};