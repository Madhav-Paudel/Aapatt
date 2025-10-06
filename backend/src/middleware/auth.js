/**
 * Authentication Middleware
 * Handles JWT verification and user authentication
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../services/databaseService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        provider: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Require specific role
 * @param {string[]} roles - Allowed roles
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Require provider role with valid provider profile
 */
export const requireProvider = async (req, res, next) => {
  if (!req.user || req.user.role !== 'PROVIDER') {
    return res.status(403).json({ error: 'Provider access required' });
  }
  
  if (!req.user.provider) {
    return res.status(403).json({ error: 'Provider profile not found' });
  }
  
  if (!req.user.provider.isVerified) {
    return res.status(403).json({ error: 'Provider not verified' });
  }
  
  req.provider = req.user.provider;
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
  } catch (error) {
    // Silently fail - authentication is optional
  }
  
  next();
};

export default {
  authenticate,
  requireRole,
  requireProvider,
  optionalAuth
};
