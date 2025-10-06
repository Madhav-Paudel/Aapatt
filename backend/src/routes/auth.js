const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Citizen authentication
router.post('/citizen', [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Valid phone number required'),
  body('otpToken')
    .notEmpty()
    .withMessage('OTP token required'),
  body('firebaseUid')
    .notEmpty()
    .withMessage('Firebase UID required'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters')
], handleValidationErrors, authController.citizenAuth);

// Provider authentication
router.post('/provider', [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Valid phone number required'),
  body('otpToken')
    .notEmpty()
    .withMessage('OTP token required'),
  body('firebaseUid')
    .notEmpty()
    .withMessage('Firebase UID required')
], handleValidationErrors, authController.providerAuth);

// Admin authentication
router.post('/admin', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], handleValidationErrors, authController.adminAuth);

// Refresh token
router.post('/refresh', [
  body('token')
    .notEmpty()
    .withMessage('Token required')
], handleValidationErrors, authController.refreshToken);

// Verify token
router.get('/verify', authMiddleware, authController.verifyToken);

// Logout
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;