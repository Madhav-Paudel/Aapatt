/**
 * Authentication Routes
 */

import express from 'express';
import {
  register,
  login,
  verifyOTP,
  getProfile,
  updateProfile,
  logout
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegistration } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

export default router;
