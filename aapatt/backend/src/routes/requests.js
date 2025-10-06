const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('./auth');

// Import database service
const { getPrismaClient } = require('../services/databaseService');

const router = express.Router();
const prisma = getPrismaClient();

// Helper function to find nearest providers
const findNearestProviders = async (location, type, limit = 5) => {
  // This is a simplified version - in production you'd use PostGIS for proper geospatial queries
  const providers = await prisma.providerProfile.findMany({
    where: {
      providerType: type,
      isAvailable: true,
      user: {
        isActive: true
      }
    },
    include: {
      user: true
    },
    take: limit
  });

  // Calculate distances (simplified - in production use proper geospatial calculations)
  return providers.map(provider => {
    const distance = Math.random() * 10; // Mock distance in km
    return {
      ...provider,
      distance,
      estimatedTime: Math.ceil(distance * 2) // Mock ETA in minutes
    };
  }).sort((a, b) => a.distance - b.distance);
};

// Create emergency request
router.post('/',
  authenticateToken,
  [
    body('type').isIn(['MEDICAL', 'FIRE', 'ACCIDENT', 'AIR_EMERGENCY', 'SECURITY', 'OTHER']),
    body('description').isLength({ min: 10, max: 500 }),
    body('location.latitude').isFloat({ min: -90, max: 90 }),
    body('location.longitude').isFloat({ min: -180, max: 180 }),
    body('address').optional().isLength({ min: 5 }),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    body('securityAlert').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        type,
        description,
        location,
        address,
        priority = 'MEDIUM',
        securityAlert = false
      } = req.body;

      const userId = req.user.id;

      // Create emergency request
      const emergencyRequest = await prisma.emergencyRequest.create({
        data: {
          userId,
          type,
          description,
          location: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          address,
          priority,
          securityAlert,
          status: 'PENDING'
        }
      });

      // Find nearest providers based on emergency type
      const nearestProviders = await findNearestProviders(
        location,
        type,
        10
      );

      // Create notifications for providers
      const notifications = nearestProviders.map(provider => ({
        userId: provider.userId,
        requestId: emergencyRequest.id,
        type: 'REQUEST_CREATED',
        title: `New ${type} Emergency Request`,
        message: `Emergency request near ${address || 'your area'}`,
        data: {
          requestId: emergencyRequest.id,
          type,
          priority,
          distance: provider.distance,
          estimatedTime: provider.estimatedTime
        }
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications
        });
      }

      // Return request with nearest providers
      res.status(201).json({
        success: true,
        message: 'Emergency request created successfully',
        request: {
          id: emergencyRequest.id,
          type: emergencyRequest.type,
          status: emergencyRequest.status,
          priority: emergencyRequest.priority,
          description: emergencyRequest.description,
          location: emergencyRequest.location,
          address: emergencyRequest.address,
          securityAlert: emergencyRequest.securityAlert,
          createdAt: emergencyRequest.createdAt
        },
        nearestProviders: nearestProviders.slice(0, 3) // Return top 3
      });

    } catch (error) {
      console.error('Create emergency request error:', error);
      res.status(500).json({ error: 'Failed to create emergency request' });
    }
  }
);

// Get user's emergency requests
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 10, offset = 0 } = req.query;

    const requests = await prisma.emergencyRequest.findMany({
      where: {
        userId,
        ...(status && { status })
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        },
        updates: {
          orderBy: {
            createdAt: 'desc'
          }
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
      requests,
      total: requests.length
    });

  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get specific emergency request
router.get('/:id',
  authenticateToken,
  [
    param('id').isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user.id;

      const request = await prisma.emergencyRequest.findFirst({
        where: {
          id,
          OR: [
            { userId },
            { providerId: userId }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true
                }
              }
            }
          },
          updates: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      res.json({
        success: true,
        request
      });

    } catch (error) {
      console.error('Get request error:', error);
      res.status(500).json({ error: 'Failed to get request' });
    }
  }
);

// Cancel emergency request
router.post('/:id/cancel',
  authenticateToken,
  [
    param('id').isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user.id;

      // Find and update request
      const request = await prisma.emergencyRequest.findFirst({
        where: {
          id,
          userId,
          status: {
            in: ['PENDING', 'ASSIGNED', 'ACCEPTED']
          }
        }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found or cannot be cancelled' });
      }

      // Update request status
      const updatedRequest = await prisma.emergencyRequest.update({
        where: { id },
        data: {
          status: 'CANCELLED'
        }
      });

      // Create update record
      await prisma.requestUpdate.create({
        data: {
          requestId: id,
          status: 'CANCELLED',
          message: 'Request cancelled by user'
        }
      });

      res.json({
        success: true,
        message: 'Request cancelled successfully',
        request: updatedRequest
      });

    } catch (error) {
      console.error('Cancel request error:', error);
      res.status(500).json({ error: 'Failed to cancel request' });
    }
  }
);

// Get active emergency requests (for providers)
router.get('/active/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a provider
    const provider = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!provider) {
      return res.status(403).json({ error: 'Provider access required' });
    }

    const { limit = 20, offset = 0 } = req.query;

    const requests = await prisma.emergencyRequest.findMany({
      where: {
        status: {
          in: ['PENDING', 'ASSIGNED']
        },
        // Filter by provider type if needed
        // type: provider.providerType
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      requests,
      total: requests.length
    });

  } catch (error) {
    console.error('Get active requests error:', error);
    res.status(500).json({ error: 'Failed to get active requests' });
  }
});

module.exports = router;