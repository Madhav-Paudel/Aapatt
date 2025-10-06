const jwt = require('jsonwebtoken');
const databaseService = require('../services/databaseService');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = {
      userId: decoded.userId,
      userType: decoded.userType,
      phoneNumber: decoded.phoneNumber,
      email: decoded.email,
      role: decoded.role
    };

    // Optional: Verify user still exists in database
    if (decoded.userType === 'citizen') {
      const citizen = await databaseService.prisma.citizen.findUnique({
        where: { id: decoded.userId }
      });
      if (!citizen) {
        return res.status(401).json({ 
          error: 'User not found' 
        });
      }
    } else if (decoded.userType === 'provider') {
      const provider = await databaseService.prisma.provider.findUnique({
        where: { id: decoded.userId }
      });
      if (!provider || !provider.isVerified) {
        return res.status(401).json({ 
          error: 'Provider not found or not verified' 
        });
      }
    } else if (decoded.userType === 'admin') {
      const admin = await databaseService.prisma.admin.findUnique({
        where: { id: decoded.userId }
      });
      if (!admin) {
        return res.status(401).json({ 
          error: 'Admin not found' 
        });
      }
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired' 
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        error: 'Authentication failed',
        message: error.message 
      });
    }
  }
};

// Middleware to check specific user types
const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Insufficient permissions' 
      });
    }
    next();
  };
};

// Middleware to check admin role
const requireAdminRole = (allowedRoles) => {
  return (req, res, next) => {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin access required' 
      });
    }
    
    if (allowedRoles && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Insufficient admin privileges' 
      });
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  requireUserType,
  requireAdminRole
};