/**
 * Aapatt Emergency Superapp - Authentication Routes
 * Routes for user registration, login, OTP verification, and profile management
 */

const express = require('express');
const {
  register,
  login,
  verifyOTP,
  refreshToken,
  logout,
  resendOTP,
  getProfile,
  updateProfile,
  deleteAccount
} = require('../controllers/authController');

const { verifyToken, rateLimitSensitive } = require('../middleware/auth');
const {
  validateUserRegistration,
  validatePhoneNumber,
  validateOTP,
  handleValidationErrors,
  sanitizeInput
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register',
  rateLimitSensitive(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  sanitizeInput(),
  validateUserRegistration(),
  handleValidationErrors,
  asyncHandler(register)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (send OTP)
 * @access  Public
 */
router.post('/login',
  rateLimitSensitive(10, 15 * 60 * 1000), // 10 attempts per 15 minutes
  sanitizeInput(),
  validatePhoneNumber(),
  handleValidationErrors,
  asyncHandler(login)
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and complete authentication
 * @access  Public
 */
router.post('/verify-otp',
  rateLimitSensitive(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  sanitizeInput(),
  [
    ...validatePhoneNumber(),
    ...validateOTP(),
    // Optional device info
    require('express-validator').body('deviceId')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Invalid device ID'),
    require('express-validator').body('fcmToken')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Invalid FCM token')
  ],
  handleValidationErrors,
  asyncHandler(verifyOTP)
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  rateLimitSensitive(20, 15 * 60 * 1000), // 20 attempts per 15 minutes
  [
    require('express-validator').body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  handleValidationErrors,
  asyncHandler(refreshToken)
);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP
 * @access  Public
 */
router.post('/resend-otp',
  rateLimitSensitive(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  sanitizeInput(),
  validatePhoneNumber(),
  handleValidationErrors,
  asyncHandler(resendOTP)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  verifyToken,
  asyncHandler(logout)
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
  verifyToken,
  asyncHandler(getProfile)
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  verifyToken,
  sanitizeInput(),
  [
    require('express-validator').body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name must contain only letters and spaces'),
    
    require('express-validator').body('email')
      .optional()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail()
  ],
  handleValidationErrors,
  asyncHandler(updateProfile)
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account',
  verifyToken,
  rateLimitSensitive(3, 60 * 60 * 1000), // 3 attempts per hour
  [
    require('express-validator').body('confirmPhoneNumber')
      .notEmpty()
      .withMessage('Phone number confirmation is required')
      .matches(/^(\+91|91)?[6-9]\d{9}$/)
      .withMessage('Please enter a valid Indian phone number')
  ],
  handleValidationErrors,
  asyncHandler(deleteAccount)
);

/**
 * @route   GET /api/auth/sessions
 * @desc    Get user sessions
 * @access  Private
 */
router.get('/sessions',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { prisma } = require('../services/databaseService');
    const { createApiResponse } = require('@aapatt/shared');

    const sessions = await prisma.userSession.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        deviceId: true,
        deviceType: true,
        ipAddress: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(
      createApiResponse(true, { sessions }, 'Sessions retrieved successfully')
    );
  })
);

/**
 * @route   DELETE /api/auth/sessions/:sessionId
 * @desc    Delete specific session
 * @access  Private
 */
router.delete('/sessions/:sessionId',
  verifyToken,
  [
    require('express-validator').param('sessionId')
      .notEmpty()
      .withMessage('Session ID is required')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { prisma } = require('../services/databaseService');
    const { createApiResponse } = require('@aapatt/shared');
    const { NotFoundError } = require('../middleware/errorHandler');

    const { sessionId } = req.params;

    // Find and delete session (only if it belongs to the user)
    const deletedSession = await prisma.userSession.deleteMany({
      where: {
        id: sessionId,
        userId: req.userId
      }
    });

    if (deletedSession.count === 0) {
      throw new NotFoundError('Session not found');
    }

    res.json(
      createApiResponse(true, null, 'Session deleted successfully')
    );
  })
);

/**
 * @route   DELETE /api/auth/sessions
 * @desc    Delete all sessions except current
 * @access  Private
 */
router.delete('/sessions',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { prisma } = require('../services/databaseService');
    const { createApiResponse } = require('@aapatt/shared');

    // Delete all sessions except current
    await prisma.userSession.deleteMany({
      where: {
        userId: req.userId,
        id: { not: req.session.id }
      }
    });

    res.json(
      createApiResponse(true, null, 'All other sessions deleted successfully')
    );
  })
);

module.exports = router;