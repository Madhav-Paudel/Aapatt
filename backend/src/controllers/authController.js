/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/databaseService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

/**
 * Register new user
 */
export const register = async (req, res) => {
  try {
    const { phone, name, role = 'CITIZEN', firebaseUid } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        name,
        role,
        firebaseUid
      }
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { phone, firebaseUid } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Find user
    let user = await prisma.user.findUnique({
      where: { phone },
      include: {
        provider: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update Firebase UID if provided
    if (firebaseUid && !user.firebaseUid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid },
        include: { provider: true }
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        provider: user.provider
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Verify OTP (placeholder - integrate with Firebase or SMS service)
 */
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }
    
    // In production, verify OTP with Firebase or Twilio
    // For now, accept any 6-digit OTP for development
    if (otp.length !== 6) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        provider: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        provider: user.provider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
      include: { provider: true }
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        provider: user.provider
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
};

/**
 * Logout user (client-side token removal)
 */
export const logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};

export default {
  register,
  login,
  verifyOTP,
  getProfile,
  updateProfile,
  logout
};
