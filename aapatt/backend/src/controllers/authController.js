const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPrisma } = require('../services/databaseService');
const { verifyIdToken, sendNotification } = require('../services/firebaseService');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async (req, res) => {
  try {
    const { phoneNumber, name, email, userType = 'CITIZEN' } = req.body;
    const prisma = getPrisma();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this phone number' });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        name,
        email,
        userType,
        isVerified: false,
      },
    });

    // Create profile based on user type
    if (userType === 'CITIZEN') {
      await prisma.citizenProfile.create({
        data: {
          userId: user.id,
          emergencyContacts: {},
          preferences: {},
        },
      });
    } else if (userType === 'PROVIDER') {
      await prisma.providerProfile.create({
        data: {
          userId: user.id,
          serviceType: 'AMBULANCE', // Default, can be updated later
          isAvailable: false,
          isOnline: false,
        },
      });
    }

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        userType: user.userType,
        isVerified: user.isVerified,
      },
      token,
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

const verifyPhoneNumber = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    const prisma = getPrisma();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          phoneNumber,
          isVerified: true,
          userType: 'CITIZEN', // Default type
        },
      });

      // Create citizen profile
      await prisma.citizenProfile.create({
        data: {
          userId: user.id,
          emergencyContacts: {},
          preferences: {},
        },
      });
    } else {
      // Update verification status
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Phone number verified successfully',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        userType: user.userType,
        isVerified: user.isVerified,
      },
      token,
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(400).json({ error: 'Invalid verification token' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phoneNumber, idToken } = req.body;
    const prisma = getPrisma();

    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    
    if (decodedToken.phone_number !== phoneNumber) {
      return res.status(400).json({ error: 'Phone number mismatch' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        citizenProfile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        userType: user.userType,
        isVerified: user.isVerified,
        profile: user.citizenProfile || user.providerProfile,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        citizenProfile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
        profile: user.citizenProfile || user.providerProfile,
      },
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, address, emergencyContacts, preferences } = req.body;
    const prisma = getPrisma();

    // Update user basic info
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
      },
    });

    // Update profile based on user type
    if (user.userType === 'CITIZEN') {
      await prisma.citizenProfile.upsert({
        where: { userId },
        update: {
          address: address || undefined,
          emergencyContacts: emergencyContacts || undefined,
          preferences: preferences || undefined,
        },
        create: {
          userId,
          address,
          emergencyContacts: emergencyContacts || {},
          preferences: preferences || {},
        },
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  registerUser,
  verifyPhoneNumber,
  loginUser,
  getProfile,
  updateProfile,
};