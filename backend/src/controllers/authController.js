/**
 * Aapatt Emergency Superapp - Authentication Controller
 * Handles user registration, login, OTP verification, and session management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../services/databaseService');
const { 
  createFirebaseUser, 
  getUserByPhoneNumber,
  sendPushNotification 
} = require('../services/firebaseService');
const logger = require('../services/loggerService');
const { createApiResponse, generateOTP, formatPhoneNumber } = require('@aapatt/shared');
const { ValidationError, UnauthorizedError, ConflictError } = require('../middleware/errorHandler');

// In-memory OTP storage (in production, use Redis)
const otpStore = new Map();
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Register new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { phoneNumber, name, email, role = 'CITIZEN' } = req.body;

    logger.auth('User registration attempt', { phoneNumber, name, role });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (existingUser) {
      throw new ConflictError('User with this phone number already exists');
    }

    // Check email if provided
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        throw new ConflictError('User with this email already exists');
      }
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        name,
        email,
        role,
        isVerified: false,
        isActive: true
      }
    });

    // Generate OTP for phone verification
    const otp = generateOTP();
    const otpKey = `otp_${phoneNumber}`;
    
    otpStore.set(otpKey, {
      otp,
      userId: user.id,
      expiresAt: Date.now() + OTP_EXPIRY,
      attempts: 0
    });

    // In production, send OTP via SMS service
    logger.auth('OTP generated for registration', { phoneNumber, otp: process.env.NODE_ENV === 'development' ? otp : '****' });

    // Try to create Firebase user (optional)
    try {
      await createFirebaseUser({
        phoneNumber,
        name,
        email
      });
    } catch (firebaseError) {
      logger.warn('Firebase user creation failed (non-critical)', { error: firebaseError.message });
    }

    res.status(201).json(
      createApiResponse(true, {
        userId: user.id,
        phoneNumber: formatPhoneNumber(phoneNumber),
        name: user.name,
        role: user.role,
        isVerified: false,
        otpSent: true,
        otpExpiresIn: OTP_EXPIRY / 1000 // seconds
      }, 'User registered successfully. Please verify your phone number.')
    );

  } catch (error) {
    logger.error('Registration failed', { error: error.message });
    throw error;
  }
};

/**
 * Login user (send OTP)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    logger.auth('User login attempt', { phoneNumber });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        provider: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('User not found. Please register first.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive. Please contact support.');
    }

    // Generate OTP
    const otp = generateOTP();
    const otpKey = `otp_${phoneNumber}`;
    
    otpStore.set(otpKey, {
      otp,
      userId: user.id,
      expiresAt: Date.now() + OTP_EXPIRY,
      attempts: 0
    });

    // In production, send OTP via SMS service
    logger.auth('OTP generated for login', { phoneNumber, otp: process.env.NODE_ENV === 'development' ? otp : '****' });

    res.json(
      createApiResponse(true, {
        userId: user.id,
        phoneNumber: formatPhoneNumber(phoneNumber),
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        hasProvider: !!user.provider,
        otpSent: true,
        otpExpiresIn: OTP_EXPIRY / 1000 // seconds
      }, 'OTP sent successfully. Please verify to continue.')
    );

  } catch (error) {
    logger.error('Login failed', { error: error.message });
    throw error;
  }
};

/**
 * Verify OTP and complete authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp, deviceId, fcmToken } = req.body;

    logger.auth('OTP verification attempt', { phoneNumber, deviceId });

    const otpKey = `otp_${phoneNumber}`;
    const otpData = otpStore.get(otpKey);

    if (!otpData) {
      throw new UnauthorizedError('OTP not found or expired. Please request a new one.');
    }

    // Check expiry
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(otpKey);
      throw new UnauthorizedError('OTP expired. Please request a new one.');
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      otpStore.delete(otpKey);
      throw new UnauthorizedError('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts++;
      throw new UnauthorizedError('Invalid OTP. Please try again.');
    }

    // OTP is valid, remove from store
    otpStore.delete(otpKey);

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: otpData.userId },
      include: {
        provider: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    // Mark user as verified
    if (!user.isVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        providerId: user.provider?.id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        deviceId,
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    // Store FCM token if provided
    if (fcmToken) {
      // In production, store FCM tokens in a separate table
      logger.auth('FCM token received', { userId: user.id, deviceId });
    }

    logger.auth('User authenticated successfully', { 
      userId: user.id, 
      role: user.role,
      sessionId: session.id 
    });

    res.json(
      createApiResponse(true, {
        user: {
          id: user.id,
          phoneNumber: formatPhoneNumber(user.phoneNumber),
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true,
          createdAt: user.createdAt
        },
        provider: user.provider ? {
          id: user.provider.id,
          type: user.provider.type,
          status: user.provider.status,
          isVerified: user.provider.isVerified,
          rating: user.provider.rating,
          totalJobs: user.provider.totalJobs
        } : null,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 24 * 60 * 60 // seconds
        },
        session: {
          id: session.id,
          deviceId: session.deviceId,
          expiresAt: session.expiresAt
        }
      }, 'Authentication successful')
    );

  } catch (error) {
    logger.error('OTP verification failed', { error: error.message });
    throw error;
  }
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new UnauthorizedError('Refresh token required');
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Find session
    const session = await prisma.userSession.findUnique({
      where: { refreshToken: token },
      include: {
        user: {
          include: {
            provider: true
          }
        }
      }
    });

    if (!session || !session.user.isActive) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        userId: session.user.id, 
        role: session.user.role,
        providerId: session.user.provider?.id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update session
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        token: accessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    });

    logger.auth('Token refreshed successfully', { userId: session.user.id });

    res.json(
      createApiResponse(true, {
        accessToken,
        expiresIn: 24 * 60 * 60 // seconds
      }, 'Token refreshed successfully')
    );

  } catch (error) {
    logger.error('Token refresh failed', { error: error.message });
    throw error;
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    const sessionId = req.session?.id;

    if (sessionId) {
      // Delete session
      await prisma.userSession.delete({
        where: { id: sessionId }
      });

      logger.auth('User logged out successfully', { userId: req.userId, sessionId });
    }

    res.json(
      createApiResponse(true, null, 'Logged out successfully')
    );

  } catch (error) {
    logger.error('Logout failed', { error: error.message });
    throw error;
  }
};

/**
 * Resend OTP
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    logger.auth('OTP resend request', { phoneNumber });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpKey = `otp_${phoneNumber}`;
    
    otpStore.set(otpKey, {
      otp,
      userId: user.id,
      expiresAt: Date.now() + OTP_EXPIRY,
      attempts: 0
    });

    // In production, send OTP via SMS service
    logger.auth('OTP resent', { phoneNumber, otp: process.env.NODE_ENV === 'development' ? otp : '****' });

    res.json(
      createApiResponse(true, {
        otpSent: true,
        otpExpiresIn: OTP_EXPIRY / 1000
      }, 'OTP sent successfully')
    );

  } catch (error) {
    logger.error('OTP resend failed', { error: error.message });
    throw error;
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        provider: true,
        emergencyContacts: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json(
      createApiResponse(true, {
        user: {
          id: user.id,
          phoneNumber: formatPhoneNumber(user.phoneNumber),
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        provider: user.provider ? {
          id: user.provider.id,
          type: user.provider.type,
          status: user.provider.status,
          vehicleNumber: user.provider.vehicleNumber,
          licenseNumber: user.provider.licenseNumber,
          rating: user.provider.rating,
          totalJobs: user.provider.totalJobs,
          completedJobs: user.provider.completedJobs,
          isVerified: user.provider.isVerified,
          location: user.provider.latitude && user.provider.longitude ? {
            latitude: user.provider.latitude,
            longitude: user.provider.longitude,
            address: user.provider.address
          } : null
        } : null,
        emergencyContacts: user.emergencyContacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          phoneNumber: formatPhoneNumber(contact.phoneNumber),
          relationship: contact.relationship,
          isPrimary: contact.isPrimary
        }))
      }, 'Profile retrieved successfully')
    );

  } catch (error) {
    logger.error('Get profile failed', { error: error.message });
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken
      const existingEmail = await prisma.user.findFirst({
        where: { 
          email,
          id: { not: req.userId }
        }
      });

      if (existingEmail) {
        throw new ConflictError('Email already in use');
      }

      updateData.email = email;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData
    });

    logger.auth('Profile updated successfully', { userId: req.userId });

    res.json(
      createApiResponse(true, {
        user: {
          id: updatedUser.id,
          phoneNumber: formatPhoneNumber(updatedUser.phoneNumber),
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          updatedAt: updatedUser.updatedAt
        }
      }, 'Profile updated successfully')
    );

  } catch (error) {
    logger.error('Profile update failed', { error: error.message });
    throw error;
  }
};

/**
 * Delete user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAccount = async (req, res) => {
  try {
    const { confirmPhoneNumber } = req.body;

    // Verify phone number confirmation
    if (confirmPhoneNumber !== req.user.phoneNumber) {
      throw new ValidationError('Phone number confirmation does not match');
    }

    // Soft delete - deactivate account
    await prisma.user.update({
      where: { id: req.userId },
      data: { 
        isActive: false,
        email: null // Remove email to allow reuse
      }
    });

    // Delete all sessions
    await prisma.userSession.deleteMany({
      where: { userId: req.userId }
    });

    logger.auth('Account deleted successfully', { userId: req.userId });

    res.json(
      createApiResponse(true, null, 'Account deleted successfully')
    );

  } catch (error) {
    logger.error('Account deletion failed', { error: error.message });
    throw error;
  }
};

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

module.exports = {
  register,
  login,
  verifyOTP,
  refreshToken,
  logout,
  resendOTP,
  getProfile,
  updateProfile,
  deleteAccount
};