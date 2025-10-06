const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const databaseService = require('../services/databaseService');
const firebaseService = require('../services/firebaseService');

class AuthController {
  // Citizen registration/login with phone OTP
  async citizenAuth(req, res) {
    try {
      const { phoneNumber, otpToken, firebaseUid, name, deviceToken } = req.body;

      // Verify Firebase OTP token
      const decodedToken = await firebaseService.verifyIdToken(otpToken);
      
      if (decodedToken.phone_number !== phoneNumber) {
        return res.status(400).json({ 
          error: 'Phone number mismatch' 
        });
      }

      // Check if citizen exists
      let citizen = await databaseService.prisma.citizen.findUnique({
        where: { phoneNumber }
      });

      if (!citizen) {
        // Create new citizen
        citizen = await databaseService.createCitizen({
          firebaseUid,
          phoneNumber,
          name: name || 'Anonymous',
          deviceToken,
          isVerified: true
        });
      } else {
        // Update existing citizen
        citizen = await databaseService.prisma.citizen.update({
          where: { id: citizen.id },
          data: {
            deviceToken,
            lastLoginAt: new Date()
          }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: citizen.id, 
          userType: 'citizen',
          phoneNumber: citizen.phoneNumber 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: citizen.id,
            name: citizen.name,
            phoneNumber: citizen.phoneNumber,
            userType: 'citizen'
          }
        }
      });

    } catch (error) {
      console.error('Citizen auth error:', error);
      res.status(500).json({ 
        error: 'Authentication failed',
        message: error.message 
      });
    }
  }

  // Provider login with phone OTP
  async providerAuth(req, res) {
    try {
      const { phoneNumber, otpToken, firebaseUid, deviceToken } = req.body;

      // Verify Firebase OTP token
      const decodedToken = await firebaseService.verifyIdToken(otpToken);
      
      if (decodedToken.phone_number !== phoneNumber) {
        return res.status(400).json({ 
          error: 'Phone number mismatch' 
        });
      }

      // Check if provider exists and is verified
      const provider = await databaseService.prisma.provider.findUnique({
        where: { phoneNumber }
      });

      if (!provider) {
        return res.status(404).json({ 
          error: 'Provider not found',
          message: 'Please contact admin for registration' 
        });
      }

      if (!provider.isVerified) {
        return res.status(403).json({ 
          error: 'Account not verified',
          message: 'Please wait for admin verification' 
        });
      }

      // Update provider login info
      await databaseService.prisma.provider.update({
        where: { id: provider.id },
        data: {
          deviceToken,
          lastLoginAt: new Date()
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: provider.id, 
          userType: 'provider',
          phoneNumber: provider.phoneNumber,
          providerType: provider.type
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: provider.id,
            name: provider.name,
            phoneNumber: provider.phoneNumber,
            type: provider.type,
            vehicleNumber: provider.vehicleNumber,
            userType: 'provider',
            isOnline: provider.isOnline
          }
        }
      });

    } catch (error) {
      console.error('Provider auth error:', error);
      res.status(500).json({ 
        error: 'Authentication failed',
        message: error.message 
      });
    }
  }

  // Admin login (email/password)
  async adminAuth(req, res) {
    try {
      const { email, password } = req.body;

      // Find admin
      const admin = await databaseService.prisma.admin.findUnique({
        where: { email }
      });

      if (!admin) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Update last login
      await databaseService.prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: admin.id, 
          userType: 'admin',
          email: admin.email,
          role: admin.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            userType: 'admin'
          }
        }
      });

    } catch (error) {
      console.error('Admin auth error:', error);
      res.status(500).json({ 
        error: 'Authentication failed',
        message: error.message 
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(401).json({ error: 'Token required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Generate new token
      const newToken = jwt.sign(
        { 
          userId: decoded.userId, 
          userType: decoded.userType,
          phoneNumber: decoded.phoneNumber,
          email: decoded.email,
          role: decoded.role
        },
        process.env.JWT_SECRET,
        { expiresIn: decoded.userType === 'admin' ? '8h' : '7d' }
      );

      res.json({
        success: true,
        data: { token: newToken }
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ 
        error: 'Invalid token',
        message: error.message 
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const { userId, userType } = req.user;

      // Clear device token based on user type
      if (userType === 'citizen') {
        await databaseService.prisma.citizen.update({
          where: { id: userId },
          data: { deviceToken: null }
        });
      } else if (userType === 'provider') {
        await databaseService.prisma.provider.update({
          where: { id: userId },
          data: { 
            deviceToken: null,
            isOnline: false 
          }
        });
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: 'Logout failed',
        message: error.message 
      });
    }
  }

  // Verify token endpoint
  async verifyToken(req, res) {
    try {
      const { user } = req; // From auth middleware
      
      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ 
        error: 'Token verification failed',
        message: error.message 
      });
    }
  }
}

module.exports = new AuthController();