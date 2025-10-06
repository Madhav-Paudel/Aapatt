/**
 * Aapatt Emergency Superapp - Type Definitions
 * JSDoc type definitions for TypeScript-like development experience
 */

/**
 * @typedef {Object} Location
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {string} [address] - Human readable address
 * @property {string} [landmark] - Nearby landmark
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} phoneNumber - User's phone number
 * @property {string} name - User's full name
 * @property {string} role - User role (citizen, provider, admin)
 * @property {string} [email] - User's email address
 * @property {Location} [location] - User's current location
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last update date
 * @property {boolean} isVerified - Phone verification status
 * @property {boolean} isActive - Account active status
 */

/**
 * @typedef {Object} Provider
 * @property {string} id - Unique provider identifier
 * @property {string} userId - Associated user ID
 * @property {string} type - Provider type (ambulance, fire, air_ambulance)
 * @property {string} status - Current status (online, offline, busy)
 * @property {Location} location - Current location
 * @property {string} vehicleNumber - Vehicle registration number
 * @property {string} licenseNumber - Provider license number
 * @property {number} rating - Average rating (1-5)
 * @property {number} totalJobs - Total completed jobs
 * @property {Date} lastSeen - Last activity timestamp
 * @property {boolean} isVerified - Verification status
 * @property {Object} [metadata] - Additional provider information
 */

/**
 * @typedef {Object} EmergencyRequest
 * @property {string} id - Unique request identifier
 * @property {string} citizenId - Requesting citizen's ID
 * @property {string} type - Emergency type (ambulance, fire, air_ambulance)
 * @property {string} status - Current status
 * @property {Location} location - Emergency location
 * @property {string} description - Emergency description
 * @property {string} [providerId] - Assigned provider ID
 * @property {Date} createdAt - Request creation time
 * @property {Date} [acceptedAt] - Provider acceptance time
 * @property {Date} [arrivedAt] - Provider arrival time
 * @property {Date} [completedAt] - Request completion time
 * @property {number} [eta] - Estimated time of arrival (minutes)
 * @property {number} priority - Request priority (1-5)
 * @property {Object} [metadata] - Additional request data
 */

/**
 * @typedef {Object} LocationUpdate
 * @property {string} providerId - Provider identifier
 * @property {string} requestId - Associated request ID
 * @property {Location} location - Current location
 * @property {number} eta - Updated ETA in minutes
 * @property {Date} timestamp - Update timestamp
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - Unique notification identifier
 * @property {string} userId - Target user ID
 * @property {string} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {Object} [data] - Additional notification data
 * @property {boolean} isRead - Read status
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} FirstAidGuide
 * @property {string} id - Unique guide identifier
 * @property {string} category - First aid category
 * @property {string} title - Guide title
 * @property {string} description - Brief description
 * @property {Array<string>} steps - Step-by-step instructions
 * @property {Array<string>} [images] - Instruction images
 * @property {Array<string>} [videos] - Instruction videos
 * @property {string} severity - Severity level (low, medium, high, critical)
 * @property {boolean} requiresEmergencyCall - Whether to call emergency services
 */

/**
 * @typedef {Object} AIAnalysisResult
 * @property {string} injuryType - Detected injury type
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} severity - Injury severity (low, medium, high, critical)
 * @property {Array<string>} recommendations - Recommended actions
 * @property {boolean} requiresEmergencyCall - Whether emergency call is needed
 * @property {string} [firstAidGuideId] - Related first aid guide ID
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} activeRequests - Current active emergency requests
 * @property {number} availableProviders - Available providers count
 * @property {number} totalRequestsToday - Total requests today
 * @property {number} averageResponseTime - Average response time in minutes
 * @property {Object} requestsByType - Breakdown by emergency type
 * @property {Object} providersByType - Breakdown by provider type
 * @property {Array<Object>} recentRequests - Recent emergency requests
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Operation success status
 * @property {*} [data] - Response data
 * @property {string} [message] - Response message
 * @property {Object} [error] - Error details
 * @property {number} [code] - Response code
 */

/**
 * @typedef {Object} SocketMessage
 * @property {string} event - Socket event name
 * @property {*} data - Message data
 * @property {string} [userId] - Target user ID
 * @property {string} [requestId] - Related request ID
 * @property {Date} timestamp - Message timestamp
 */

/**
 * @typedef {Object} GeofenceArea
 * @property {string} id - Unique area identifier
 * @property {string} name - Area name
 * @property {Array<Location>} boundaries - Area boundary coordinates
 * @property {string} type - Area type (city, district, zone)
 * @property {boolean} isActive - Active status
 */

/**
 * @typedef {Object} Analytics
 * @property {string} metric - Metric name
 * @property {number} value - Metric value
 * @property {string} period - Time period (hour, day, week, month)
 * @property {Date} timestamp - Data timestamp
 * @property {Object} [metadata] - Additional metric data
 */

/**
 * @typedef {Object} Route
 * @property {Array<Location>} coordinates - Route coordinates
 * @property {number} distance - Total distance in meters
 * @property {number} duration - Estimated duration in seconds
 * @property {Array<string>} instructions - Turn-by-turn instructions
 */

/**
 * @typedef {Object} EmergencyContact
 * @property {string} id - Unique contact identifier
 * @property {string} userId - User ID
 * @property {string} name - Contact name
 * @property {string} phoneNumber - Contact phone number
 * @property {string} relationship - Relationship to user
 * @property {boolean} isPrimary - Primary contact flag
 */

/**
 * @typedef {Object} SystemHealth
 * @property {string} status - Overall system status
 * @property {Object} services - Individual service status
 * @property {number} uptime - System uptime in seconds
 * @property {Object} metrics - Performance metrics
 * @property {Date} lastCheck - Last health check timestamp
 */

// Export types for JSDoc usage
export const Types = {
  Location: 'Location',
  User: 'User', 
  Provider: 'Provider',
  EmergencyRequest: 'EmergencyRequest',
  LocationUpdate: 'LocationUpdate',
  Notification: 'Notification',
  FirstAidGuide: 'FirstAidGuide',
  AIAnalysisResult: 'AIAnalysisResult',
  DashboardStats: 'DashboardStats',
  ApiResponse: 'ApiResponse',
  SocketMessage: 'SocketMessage',
  GeofenceArea: 'GeofenceArea',
  Analytics: 'Analytics',
  Route: 'Route',
  EmergencyContact: 'EmergencyContact',
  SystemHealth: 'SystemHealth'
};

export default Types;