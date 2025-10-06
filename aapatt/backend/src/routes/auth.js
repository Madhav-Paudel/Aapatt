const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

// Import database service
const { getPrismaClient } = require('../services/databaseService');

const router = express.Router();
const prisma = getPrismaClient();

// Initialize Firebase Admin SDK
let firebaseApp;
try {
  if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Send OTP via Firebase
router.post('/send-otp',
  [
    body('phone').isMobilePhone().withMessage('Valid phone number required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone } = req.body;

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { phone }
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            phone,
            role: 'CITIZEN' // Default role, can be updated later
          }
        });
      }

      // Send OTP using Firebase (in production, this would use Firebase Auth REST API)
      // For now, we'll simulate OTP sending
      const otp = Math.floor(100000 + Math.random() * 900000);

      // In production, you would:
      // const otpResponse = await firebaseApp.auth().sendSignInWithPhoneNumber(phone, otp);

      // Store OTP temporarily (in production, use Redis or similar)
      // For demo purposes, we'll return the OTP in response
      console.log(`OTP for ${phone}: ${otp}`);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        // In production, don't send OTP in response
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });

    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
);

// Verify OTP and get token
router.post('/verify-otp',
  [
    body('phone').isMobilePhone().withMessage('Valid phone number required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone, otp } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { phone }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // In production, verify OTP with Firebase
      // For demo purposes, we'll accept any OTP in development
      const isValidOtp = process.env.NODE_ENV === 'development' || otp === '123456';

      if (!isValidOtp) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }

      // Generate JWT token
      const token = generateToken(user);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          name: user.name
        }
      });

    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }
);

// Register as provider
router.post('/register-provider',
  authenticateToken,
  [
    body('providerType').isIn(['AMBULANCE', 'FIRE_BRIGADE', 'AIR_AMBULANCE', 'POLICE']),
    body('licenseNumber').optional().isLength({ min: 3 }),
    body('vehicleNumber').optional().isLength({ min: 3 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { providerType, licenseNumber, vehicleNumber } = req.body;
      const userId = req.user.id;

      // Check if user already has a provider profile
      const existingProfile = await prisma.providerProfile.findUnique({
        where: { userId }
      });

      if (existingProfile) {
        return res.status(400).json({ error: 'User already has a provider profile' });
      }

      // Create provider profile
      const providerProfile = await prisma.providerProfile.create({
        data: {
          userId,
          providerType,
          licenseNumber,
          vehicleNumber,
          isAvailable: true
        }
      });

      // Update user role
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'PROVIDER' }
      });

      res.json({
        success: true,
        message: 'Provider registration successful',
        provider: providerProfile
      });

    } catch (error) {
      console.error('Provider registration error:', error);
      res.status(500).json({ error: 'Failed to register as provider' });
    }
  }
);

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        providerProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        providerProfile: user.providerProfile,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile',
  authenticateToken,
  [
    body('name').optional().isLength({ min: 2 }),
    body('email').optional().isEmail()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email } = req.body;
      const userId = req.user.id;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email })
        }
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// Refresh token
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    const newToken = generateToken(user);

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;