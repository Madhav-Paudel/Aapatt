const jwt = require('jsonwebtoken');
const { getPrisma } = require('../services/databaseService');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const prisma = getPrisma();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        userType: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Account not verified' });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    return res.status(500).json({ error: 'Authentication failed' });
  }
};

const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({ 
        error: `Access denied. Required user types: ${allowedTypes.join(', ')}` 
      });
    }
    next();
  };
};

const requireProvider = (req, res, next) => {
  if (req.user.userType !== 'PROVIDER') {
    return res.status(403).json({ error: 'Provider access required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.userType !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireUserType,
  requireProvider,
  requireAdmin,
};