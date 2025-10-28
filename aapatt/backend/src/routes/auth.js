const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  registerUser,
  verifyPhoneNumber,
  loginUser,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Valid phone number required'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email required'),
  body('userType')
    .optional()
    .isIn(['CITIZEN', 'PROVIDER'])
    .withMessage('User type must be CITIZEN or PROVIDER'),
  validateRequest
], registerUser);

// @route   POST /api/auth/verify-phone
// @desc    Verify phone number with Firebase token
// @access  Public
router.post('/verify-phone', [
  body('idToken')
    .notEmpty()
    .withMessage('Firebase ID token required'),
  validateRequest
], verifyPhoneNumber);

// @route   POST /api/auth/login
// @desc    Login user with phone number and Firebase token
// @access  Public
router.post('/login', [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Valid phone number required'),
  body('idToken')
    .notEmpty()
    .withMessage('Firebase ID token required'),
  validateRequest
], loginUser);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateToken,
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email required'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address too long'),
  validateRequest
], updateProfile);

module.exports = router;