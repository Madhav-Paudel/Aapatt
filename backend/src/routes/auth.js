const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, loginSchema, verifyOTPSchema } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');
const {
  sendOTPToPhone,
  verifyOTPAndLogin,
  getProfile,
  updateProfile,
  logout
} = require('../controllers/authController');

const router = express.Router();

// Apply rate limiting to auth routes
router.use(rateLimiter.authLimiter);

// Send OTP to phone number
router.post('/send-otp', validateRequest(loginSchema), sendOTPToPhone);

// Verify OTP and login/register
router.post('/verify-otp', validateRequest(verifyOTPSchema), verifyOTPAndLogin);

// Get current user profile
router.get('/profile', authenticateToken, getProfile);

// Update user profile
router.put('/profile', authenticateToken, updateProfile);

// Logout
router.post('/logout', authenticateToken, logout);

module.exports = router;