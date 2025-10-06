const express = require('express');
const { param, query, validationResult } = require('express-validator');
const { authenticateToken } = require('./auth');

// Import database service
const { getPrismaClient } = require('../services/databaseService');

const router = express.Router();
const prisma = getPrismaClient();

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get dashboard statistics
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get active emergencies count
    const activeEmergencies = await prisma.emergencyRequest.count({
      where: {
        status: {
          in: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE']
        }
      }
    });

    // Get available providers count
    const availableProviders = await prisma.providerProfile.count({
      where: {
        isAvailable: true,
        user: {
          isActive: true
        }
      }
    });

    // Get today's requests
    const todayRequests = await prisma.emergencyRequest.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    // Get average response time (mock calculation)
    const completedRequests = await prisma.emergencyRequest.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: weekAgo
        }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    const avgResponseTime = completedRequests.length > 0
      ? completedRequests.reduce((acc, req) => {
          const responseTime = (new Date(req.completedAt) - new Date(req.createdAt)) / (1000 * 60); // minutes
          return acc + responseTime;
        }, 0) / completedRequests.length
      : 0;

    // Get requests by type
    const requestsByType = await prisma.emergencyRequest.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: weekAgo
        }
      },
      _count: {
        type: true
      }
    });

    // Get requests by status
    const requestsByStatus = await prisma.emergencyRequest.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    res.json({
      success: true,
      stats: {
        activeEmergencies,
        availableProviders,
        todayRequests,
        avgResponseTime: Math.round(avgResponseTime),
        requestsByType,
        requestsByStatus,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

// Get live emergency map data
router.get('/emergencies/live', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const emergencies = await prisma.emergencyRequest.findMany({
      where: {
        status: {
          in: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE']
        }
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    // Format for map display
    const mapData = emergencies.map(emergency => ({
      id: emergency.id,
      type: emergency.type,
      status: emergency.status,
      priority: emergency.priority,
      description: emergency.description,
      location: emergency.location,
      address: emergency.address,
      createdAt: emergency.createdAt,
      user: emergency.user,
      provider: emergency.provider,
      estimatedEta: emergency.estimatedEta
    }));

    res.json({
      success: true,
      emergencies: mapData
    });

  } catch (error) {
    console.error('Get live emergencies error:', error);
    res.status(500).json({ error: 'Failed to get live emergencies' });
  }
});

// Get all providers
router.get('/providers',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { type, available, limit = 50, offset = 0 } = req.query;

      const providers = await prisma.providerProfile.findMany({
        where: {
          ...(type && { providerType: type }),
          ...(available !== undefined && { isAvailable: available === 'true' }),
          user: {
            isActive: true
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              assignedRequests: true
            }
          }
        },
        orderBy: [
          { isAvailable: 'desc' },
          { createdAt: 'desc' }
        ],
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      res.json({
        success: true,
        providers,
        total: providers.length
      });

    } catch (error) {
      console.error('Get providers error:', error);
      res.status(500).json({ error: 'Failed to get providers' });
    }
  }
);

// Get provider details
router.get('/providers/:id',
  authenticateToken,
  requireAdmin,
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

      const provider = await prisma.providerProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              createdAt: true
            }
          },
          assignedRequests: {
            where: {
              status: {
                in: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE']
              }
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true
                }
              }
            }
          }
        }
      });

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      res.json({
        success: true,
        provider
      });

    } catch (error) {
      console.error('Get provider details error:', error);
      res.status(500).json({ error: 'Failed to get provider details' });
    }
  }
);

// Get system analytics
router.get('/analytics',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { period = '30' } = req.query; // days
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get request trends
      const requestTrends = await prisma.emergencyRequest.groupBy({
        by: ['type'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          type: true
        }
      });

      // Get response time analysis
      const completedRequests = await prisma.emergencyRequest.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate
          }
        },
        select: {
          type: true,
          createdAt: true,
          completedAt: true,
          priority: true
        }
      });

      const avgResponseTimes = completedRequests.reduce((acc, req) => {
        const responseTime = (new Date(req.completedAt) - new Date(req.createdAt)) / (1000 * 60); // minutes
        const type = req.type;

        if (!acc[type]) {
          acc[type] = { total: 0, count: 0 };
        }

        acc[type].total += responseTime;
        acc[type].count += 1;

        return acc;
      }, {});

      // Calculate average response times by type
      const responseTimeByType = Object.entries(avgResponseTimes).map(([type, data]) => ({
        type,
        averageTime: Math.round(data.total / data.count),
        totalRequests: data.count
      }));

      // Get daily request counts for the period
      const dailyRequests = await prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count,
          emergency_type as type
        FROM emergency_requests
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at), emergency_type
        ORDER BY date DESC
      `;

      // Get provider performance
      const providerPerformance = await prisma.providerProfile.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          _count: {
            select: {
              assignedRequests: true
            }
          }
        },
        orderBy: {
          totalJobs: 'desc'
        },
        take: 10
      });

      res.json({
        success: true,
        analytics: {
          period: `${days} days`,
          requestTrends,
          responseTimeByType,
          dailyRequests,
          providerPerformance,
          totalCompleted: completedRequests.length
        }
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  }
);

// Manual request assignment (for coordinators)
router.post('/assign-request/:requestId',
  authenticateToken,
  requireAdmin,
  [
    param('requestId').isUUID(),
    body('providerId').isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { requestId } = req.params;
      const { providerId } = req.body;

      // Check if request exists and is available for assignment
      const request = await prisma.emergencyRequest.findUnique({
        where: { id: requestId }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.status !== 'PENDING') {
        return res.status(400).json({ error: 'Request is not available for assignment' });
      }

      // Check if provider exists and is available
      const provider = await prisma.providerProfile.findUnique({
        where: { id: providerId }
      });

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      if (!provider.isAvailable) {
        return res.status(400).json({ error: 'Provider is not available' });
      }

      // Assign request
      const updatedRequest = await prisma.emergencyRequest.update({
        where: { id: requestId },
        data: {
          providerId,
          status: 'ASSIGNED'
        }
      });

      // Create update record
      await prisma.requestUpdate.create({
        data: {
          requestId,
          status: 'ASSIGNED',
          message: `Manually assigned to ${provider.providerType}`
        }
      });

      res.json({
        success: true,
        message: 'Request assigned successfully',
        request: updatedRequest
      });

    } catch (error) {
      console.error('Manual assignment error:', error);
      res.status(500).json({ error: 'Failed to assign request' });
    }
  }
);

// Get system logs (recent activities)
router.get('/logs',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;

      // Get recent request updates as system logs
      const logs = await prisma.requestUpdate.findMany({
        include: {
          request: {
            select: {
              id: true,
              type: true,
              priority: true
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
        logs,
        total: logs.length
      });

    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({ error: 'Failed to get system logs' });
    }
  }
);

module.exports = router;