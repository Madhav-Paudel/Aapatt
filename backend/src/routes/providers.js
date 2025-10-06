const express = require('express');
const { authenticateToken, requireProvider } = require('../middleware/auth');
const { validateRequest, createProviderProfileSchema, updateLocationSchema } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const router = express.Router();

// Apply rate limiting
router.use(rateLimiter.generalLimiter);

// Create provider profile
router.post('/profile', 
  authenticateToken,
  validateRequest(createProviderProfileSchema),
  async (req, res) => {
    try {
      const { serviceType, licenseNumber, vehicleNumber } = req.body;
      const userId = req.user.id;

      // Check if profile already exists
      const existingProfile = await prisma.providerProfile.findUnique({
        where: { userId }
      });

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: 'Provider profile already exists.',
          error: 'PROFILE_EXISTS'
        });
      }

      const profile = await prisma.providerProfile.create({
        data: {
          userId,
          serviceType: serviceType.toUpperCase(),
          licenseNumber,
          vehicleNumber
        }
      });

      res.status(201).json({
        success: true,
        message: 'Provider profile created successfully.',
        data: { profile }
      });
    } catch (error) {
      console.error('❌ Create provider profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: 'INTERNAL_ERROR'
      });
    }
  }
);

// Get provider profile
router.get('/profile', authenticateToken, requireProvider, async (req, res) => {
  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
        error: 'PROFILE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    console.error('❌ Get provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Update provider profile
router.put('/profile', authenticateToken, requireProvider, async (req, res) => {
  try {
    const { serviceType, licenseNumber, vehicleNumber } = req.body;

    const profile = await prisma.providerProfile.update({
      where: { userId: req.user.id },
      data: {
        serviceType: serviceType?.toUpperCase(),
        licenseNumber,
        vehicleNumber
      }
    });

    res.json({
      success: true,
      message: 'Provider profile updated successfully.',
      data: { profile }
    });
  } catch (error) {
    console.error('❌ Update provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Update provider location
router.put('/location', 
  authenticateToken, 
  requireProvider,
  validateRequest(updateLocationSchema),
  async (req, res) => {
    try {
      const { latitude, longitude, accuracy, speed, heading } = req.body;

      const profile = await prisma.providerProfile.update({
        where: { userId: req.user.id },
        data: {
          currentLatitude: latitude,
          currentLongitude: longitude,
          lastLocationUpdate: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Location updated successfully.',
        data: { profile }
      });
    } catch (error) {
      console.error('❌ Update location error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: 'INTERNAL_ERROR'
      });
    }
  }
);

// Toggle online/offline status
router.put('/status', authenticateToken, requireProvider, async (req, res) => {
  try {
    const { isOnline } = req.body;

    const profile = await prisma.providerProfile.update({
      where: { userId: req.user.id },
      data: { isOnline }
    });

    res.json({
      success: true,
      message: `Provider is now ${isOnline ? 'online' : 'offline'}.`,
      data: { profile }
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Get available emergency requests for provider
router.get('/requests', authenticateToken, requireProvider, async (req, res) => {
  try {
    const { status = 'PENDING', limit = 20, offset = 0 } = req.query;

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
        error: 'PROFILE_NOT_FOUND'
      });
    }

    const requests = await prisma.emergencyRequest.findMany({
      where: {
        serviceType: profile.serviceType,
        status: status.toUpperCase(),
        providerId: null // Only unassigned requests
      },
      include: {
        citizen: {
          select: {
            name: true,
            phoneNumber: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { requestedAt: 'asc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: requests.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Get provider requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Accept emergency request
router.post('/requests/:requestId/accept', authenticateToken, requireProvider, async (req, res) => {
  try {
    const { requestId } = req.params;
    const providerId = req.user.id;

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: providerId }
    });

    if (!profile || !profile.isOnline) {
      return res.status(400).json({
        success: false,
        message: 'Provider must be online to accept requests.',
        error: 'PROVIDER_OFFLINE'
      });
    }

    // Check if request is still available
    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        serviceType: profile.serviceType,
        status: 'PENDING',
        providerId: null
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not available or already assigned.',
        error: 'REQUEST_NOT_AVAILABLE'
      });
    }

    // Accept the request
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        providerId,
        status: 'ACCEPTED',
        acceptedAt: new Date()
      },
      include: {
        citizen: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Request accepted successfully.',
      data: { request: updatedRequest }
    });
  } catch (error) {
    console.error('❌ Accept request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Get provider's job history
router.get('/history', authenticateToken, requireProvider, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const providerId = req.user.id;

    const requests = await prisma.emergencyRequest.findMany({
      where: { providerId },
      include: {
        citizen: {
          select: {
            name: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { requestedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: requests.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Get provider history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;