const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { sendOTP, verifyOTP } = require('../services/firebaseService');

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Send OTP for phone number verification
const sendOTPToPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format.',
        error: 'INVALID_PHONE'
      });
    }

    // Send OTP
    const otpResult = await sendOTP(phoneNumber);
    
    if (!otpResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP.',
        error: 'OTP_SEND_FAILED'
      });
    }

    // Store OTP in database for verification (in production, use Redis or similar)
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'OTP sent successfully.',
      data: {
        phoneNumber,
        expiresIn: 300 // 5 minutes
      }
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Verify OTP and login/register user
const verifyOTPAndLogin = async (req, res) => {
  try {
    const { phoneNumber, otp, name, userType = 'CITIZEN' } = req.body;

    // Verify OTP
    const otpResult = await verifyOTP(phoneNumber, otp);
    
    if (!otpResult.success || !otpResult.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
        error: 'INVALID_OTP'
      });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: { providerProfile: true }
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber,
          name: name || null,
          userType: userType.toUpperCase(),
          isActive: true
        },
        include: { providerProfile: true }
      });
    } else {
      // Update user if exists
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          isActive: true
        },
        include: { providerProfile: true }
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.userType);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          userType: user.userType,
          providerProfile: user.providerProfile
        },
        token,
        expiresIn: '7d'
      }
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { providerProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        error: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email,
          userType: user.userType,
          providerProfile: user.providerProfile,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, emergencyContacts, preferences } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        emergencyContacts: emergencyContacts || undefined,
        preferences: preferences || undefined
      },
      include: { providerProfile: true }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email,
          userType: user.userType,
          providerProfile: user.providerProfile
        }
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Logout (invalidate token on client side)
const logout = async (req, res) => {
  try {
    // In a production app, you might want to maintain a blacklist of tokens
    // For now, we'll just return success as JWT is stateless
    res.json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  sendOTPToPhone,
  verifyOTPAndLogin,
  getProfile,
  updateProfile,
  logout
};