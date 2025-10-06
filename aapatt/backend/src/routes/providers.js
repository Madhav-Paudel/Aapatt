const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('./auth');

// Import database service
const { getPrismaClient } = require('../services/databaseService');

const router = express.Router();
const prisma = getPrismaClient();

// Update provider availability status
router.post('/availability',
  authenticateToken,
  [
    body('isAvailable').isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { isAvailable } = req.body;
      const userId = req.user.id;

      // Check if user is a provider
      const provider = await prisma.providerProfile.findUnique({
        where: { userId }
      });

      if (!provider) {
        return res.status(403).json({ error: 'Provider access required' });
      }

      // Update availability
      const updatedProvider = await prisma.providerProfile.update({
        where: { userId },
        data: { isAvailable }
      });

      res.json({
        success: true,
        message: `Provider ${isAvailable ? 'online' : 'offline'}`,
        provider: updatedProvider
      });

    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({ error: 'Failed to update availability' });
    }
  }
);

// Update provider location
router.post('/location',
  authenticateToken,
  [
    body('location.latitude').isFloat({ min: -90, max: 90 }),
    body('location.longitude').isFloat({ min: -180, max: 180 }),
    body('heading').optional().isFloat({ min: 0, max: 360 }),
    body('speed').optional().isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { location, heading, speed } = req.body;
      const userId = req.user.id;

      // Check if user is a provider
      const provider = await prisma.providerProfile.findUnique({
        where: { userId }
      });

      if (!provider) {
        return res.status(403).json({ error: 'Provider access required' });
      }

      // Update current location
      await prisma.providerProfile.update({
        where: { userId },
        data: {
          currentLocation: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          }
        }
      });

      // Create location record
      await prisma.providerLocation.create({
        data: {
          providerId: provider.id,
          location: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          heading,
          speed,
          timestamp: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Location updated successfully'
      });

    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({ error: 'Failed to update location' });
    }
  }
);

// Accept emergency request
router.post('/accept-request/:requestId',
  authenticateToken,
  [
    param('requestId').isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { requestId } = req.params;
      const userId = req.user.id;

      // Check if user is a provider
      const provider = await prisma.providerProfile.findUnique({
        where: { userId }
      });

      if (!provider) {
        return res.status(403).json({ error: 'Provider access required' });
      }

      // Check if provider is available
      if (!provider.isAvailable) {
        return res.status(400).json({ error: 'Provider is not available' });
      }

      // Find and update request
      const request = await prisma.emergencyRequest.findUnique({
        where: { id: requestId }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.status !== 'PENDING' && request.status !== 'ASSIGNED') {
        return res.status(400).json({ error: 'Request is no longer available' });
      }

      // Update request
      const updatedRequest = await prisma.emergencyRequest.update({
        where: { id: requestId },
        data: {
          providerId: provider.id,
          status: 'ACCEPTED'
        }
      });

      // Create request update
      await prisma.requestUpdate.create({
        data: {
          requestId,
          status: 'ACCEPTED',
          message: `Accepted by ${provider.providerType}`
        }
      });

      res.json({
        success: true,
        message: 'Request accepted successfully',
        request: updatedRequest
      });

    } catch (error) {
      console.error('Accept request error:', error);
      res.status(500).json({ error: 'Failed to accept request' });
    }
  }
);

// Update request status (en route, arrived, completed)
router.post('/update-status/:requestId',
  authenticateToken,
  [
    param('requestId').isUUID(),
    body('status').isIn(['EN_ROUTE', 'ARRIVED', 'COMPLETED']),
    body('message').optional().isLength({ min: 1, max: 200 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { requestId } = req.params;
      const { status, message } = req.body;
      const userId = req.user.id;

      // Check if user is a provider
      const provider = await prisma.providerProfile.findUnique({
        where: { userId }
      });

      if (!provider) {
        return res.status(403).json({ error: 'Provider access required' });
      }

      // Find request
      const request = await prisma.emergencyRequest.findUnique({
        where: { id: requestId }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.providerId !== provider.id) {
        return res.status(403).json({ error: 'Not authorized to update this request' });
      }

      // Update request status
      const updatedRequest = await prisma.emergencyRequest.update({
        where: { id: requestId },
        data: { status }
      });

      // Create request update
      await prisma.requestUpdate.create({
        data: {
          requestId,
          status,
          message: message || `Status updated to ${status.toLowerCase()}`
        }
      });

      // If completed, update provider stats
      if (status === 'COMPLETED') {
        await prisma.providerProfile.update({
          where: { id: provider.id },
          data: {
            totalJobs: {
              increment: 1
            }
          }
        });
      }

      res.json({
        success: true,
        message: 'Status updated successfully',
        request: updatedRequest
      });

    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }
);

// Get provider profile and stats
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        _count: {
          select: {
            assignedRequests: true
          }
        }
      }
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    // Get recent completed requests
    const recentJobs = await prisma.emergencyRequest.findMany({
      where: {
        providerId: provider.id,
        status: 'COMPLETED'
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 5
    });

    res.json({
      success: true,
      provider: {
        ...provider,
        recentJobs,
        stats: {
          totalJobs: provider.totalJobs,
          rating: provider.rating
        }
      }
    });

  } catch (error) {
    console.error('Get provider profile error:', error);
    res.status(500).json({ error: 'Failed to get provider profile' });
  }
});

// Get provider job history
router.get('/jobs/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, status } = req.query;

    // Check if user is a provider
    const provider = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!provider) {
      return res.status(403).json({ error: 'Provider access required' });
    }

    const jobs = await prisma.emergencyRequest.findMany({
      where: {
        providerId: provider.id,
        ...(status && { status })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        updates: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      jobs,
      total: jobs.length
    });

  } catch (error) {
    console.error('Get job history error:', error);
    res.status(500).json({ error: 'Failed to get job history' });
  }
});

module.exports = router;