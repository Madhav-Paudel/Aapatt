/**
 * Aapatt Emergency Superapp - Authentication Middleware
 * JWT token verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const { prisma } = require('../services/databaseService');
const logger = require('../services/loggerService');
const { createApiResponse } = require('@aapatt/shared');

/**
 * Verify JWT token middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json(
        createApiResponse(false, null, 'Access token required', 401)
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is in valid sessions
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            provider: true
          }
        }
      }
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json(
        createApiResponse(false, null, 'Token expired or invalid', 401)
      );
    }

    if (!session.user.isActive) {
      return res.status(401).json(
        createApiResponse(false, null, 'User account is inactive', 401)
      );
    }

    // Add user info to request
    req.user = session.user;
    req.session = session;
    req.userId = session.user.id;
    req.userRole = session.user.role;
    req.provider = session.user.provider;

    // Update session last activity
    await prisma.userSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() }
    });

    logger.auth('Token verified successfully', { 
      userId: req.userId, 
      role: req.userRole 
    });

    next();
  } catch (error) {
    logger.auth('Token verification failed', { error: error.message });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        createApiResponse(false, null, 'Invalid token', 401)
      );
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        createApiResponse(false, null, 'Token expired', 401)
      );
    }
    
    return res.status(500).json(
      createApiResponse(false, null, 'Authentication error', 500)
    );
  }
};

/**
 * Optional token verification (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return next();
    }

    // Try to verify token, but don't fail if invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            provider: true
          }
        }
      }
    });

    if (session && session.expiresAt >= new Date() && session.user.isActive) {
      req.user = session.user;
      req.session = session;
      req.userId = session.user.id;
      req.userRole = session.user.role;
      req.provider = session.user.provider;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Role-based access control middleware
 * @param {Array<string>} allowedRoles - Array of allowed user roles
 * @returns {Function} Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        createApiResponse(false, null, 'Authentication required', 401)
      );
    }

    if (!allowedRoles.includes(req.userRole)) {
      logger.security('Unauthorized role access attempt', {
        userId: req.userId,
        userRole: req.userRole,
        requiredRoles: allowedRoles,
        endpoint: req.originalUrl
      });

      return res.status(403).json(
        createApiResponse(false, null, 'Insufficient permissions', 403)
      );
    }

    next();
  };
};

/**
 * Provider verification middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requireProvider = (req, res, next) => {
  if (!req.provider) {
    return res.status(403).json(
      createApiResponse(false, null, 'Provider account required', 403)
    );
  }

  if (!req.provider.isVerified) {
    return res.status(403).json(
      createApiResponse(false, null, 'Provider account not verified', 403)
    );
  }

  next();
};

/**
 * Admin access middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requireAdmin = (req, res, next) => {
  return requireRole(['ADMIN', 'SUPER_ADMIN'])(req, res, next);
};

/**
 * Super admin access middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requireSuperAdmin = (req, res, next) => {
  return requireRole(['SUPER_ADMIN'])(req, res, next);
};

/**
 * Resource ownership verification
 * @param {string} resourceField - Field name containing resource owner ID
 * @returns {Function} Middleware function
 */
const requireOwnership = (resourceField = 'userId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json(
          createApiResponse(false, null, 'Resource ID required', 400)
        );
      }

      // Admin users can access any resource
      if (['ADMIN', 'SUPER_ADMIN'].includes(req.userRole)) {
        return next();
      }

      // For other users, check ownership based on the resource type
      let resource;
      const resourcePath = req.route.path;

      if (resourcePath.includes('/requests/')) {
        resource = await prisma.emergencyRequest.findUnique({
          where: { id: resourceId }
        });
        
        // Check if user is either the citizen who made the request or the assigned provider
        if (resource && (resource.citizenId === req.userId || 
                        (req.provider && resource.providerId === req.provider.id))) {
          return next();
        }
      } else if (resourcePath.includes('/providers/')) {
        resource = await prisma.provider.findUnique({
          where: { id: resourceId }
        });
        
        if (resource && resource.userId === req.userId) {
          return next();
        }
      } else {
        // Generic ownership check
        const modelName = getModelNameFromPath(resourcePath);
        if (modelName && prisma[modelName]) {
          resource = await prisma[modelName].findUnique({
            where: { id: resourceId }
          });
          
          if (resource && resource[resourceField] === req.userId) {
            return next();
          }
        }
      }

      logger.security('Unauthorized resource access attempt', {
        userId: req.userId,
        resourceId,
        resourcePath,
        resourceField
      });

      return res.status(403).json(
        createApiResponse(false, null, 'Access denied to this resource', 403)
      );

    } catch (error) {
      logger.error('Ownership verification error:', error);
      return res.status(500).json(
        createApiResponse(false, null, 'Authorization error', 500)
      );
    }
  };
};

/**
 * Rate limiting for sensitive operations
 * @param {number} maxAttempts - Maximum attempts per time window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Middleware function
 */
const rateLimitSensitive = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + ':' + (req.userId || 'anonymous');
    const now = Date.now();
    
    // Clean old entries
    for (const [k, v] of attempts.entries()) {
      if (now - v.firstAttempt > windowMs) {
        attempts.delete(k);
      }
    }

    const userAttempts = attempts.get(key);
    
    if (!userAttempts) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      logger.security('Rate limit exceeded for sensitive operation', {
        ip: req.ip,
        userId: req.userId,
        endpoint: req.originalUrl
      });

      return res.status(429).json(
        createApiResponse(false, null, 'Too many attempts. Please try again later.', 429)
      );
    }

    userAttempts.count++;
    next();
  };
};

/**
 * Extract model name from API path
 * @param {string} path - API path
 * @returns {string} Model name
 */
function getModelNameFromPath(path) {
  const pathMap = {
    '/users/': 'user',
    '/providers/': 'provider',
    '/requests/': 'emergencyRequest',
    '/notifications/': 'notification'
  };

  for (const [pathPrefix, modelName] of Object.entries(pathMap)) {
    if (path.includes(pathPrefix)) {
      return modelName;
    }
  }

  return null;
}

/**
 * Validate API key for external services
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    logger.security('Invalid API key attempt', {
      ip: req.ip,
      providedKey: apiKey ? 'PROVIDED' : 'MISSING'
    });

    return res.status(401).json(
      createApiResponse(false, null, 'Valid API key required', 401)
    );
  }

  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  requireProvider,
  requireAdmin,
  requireSuperAdmin,
  requireOwnership,
  rateLimitSensitive,
  validateApiKey
};