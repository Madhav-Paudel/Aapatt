const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, createUserSchema } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const router = express.Router();

// Apply rate limiting
router.use(rateLimiter.generalLimiter);

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    let timeFilter = {};
    const now = new Date();
    
    switch (period) {
      case '1h':
        timeFilter = { gte: new Date(now.getTime() - 60 * 60 * 1000) };
        break;
      case '24h':
        timeFilter = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case '7d':
        timeFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        timeFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
    }

    // Get emergency requests statistics
    const totalRequests = await prisma.emergencyRequest.count({
      where: { requestedAt: timeFilter }
    });

    const activeRequests = await prisma.emergencyRequest.count({
      where: {
        requestedAt: timeFilter,
        status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE'] }
      }
    });

    const completedRequests = await prisma.emergencyRequest.count({
      where: {
        requestedAt: timeFilter,
        status: 'COMPLETED'
      }
    });

    // Get provider statistics
    const totalProviders = await prisma.providerProfile.count();
    const onlineProviders = await prisma.providerProfile.count({
      where: { isOnline: true }
    });

    // Get average response time
    const avgResponseTime = await prisma.emergencyRequest.aggregate({
      where: {
        requestedAt: timeFilter,
        acceptedAt: { not: null }
      },
      _avg: {
        acceptedAt: true
      }
    });

    // Get requests by service type
    const requestsByType = await prisma.emergencyRequest.groupBy({
      by: ['serviceType'],
      where: { requestedAt: timeFilter },
      _count: { serviceType: true }
    });

    // Get requests by status
    const requestsByStatus = await prisma.emergencyRequest.groupBy({
      by: ['status'],
      where: { requestedAt: timeFilter },
      _count: { status: true }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalRequests,
          activeRequests,
          completedRequests,
          totalProviders,
          onlineProviders,
          avgResponseTime: avgResponseTime._avg.acceptedAt ? 
            Math.round((avgResponseTime._avg.acceptedAt - timeFilter.gte) / 1000 / 60) : 0 // minutes
        },
        requestsByType,
        requestsByStatus,
        period
      }
    });
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Get all emergency requests
router.get('/requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      status, 
      serviceType, 
      priority, 
      limit = 50, 
      offset = 0,
      startDate,
      endDate
    } = req.query;

    const whereClause = {};

    if (status) whereClause.status = status.toUpperCase();
    if (serviceType) whereClause.serviceType = serviceType.toUpperCase();
    if (priority) whereClause.priority = priority.toUpperCase();
    
    if (startDate || endDate) {
      whereClause.requestedAt = {};
      if (startDate) whereClause.requestedAt.gte = new Date(startDate);
      if (endDate) whereClause.requestedAt.lte = new Date(endDate);
    }

    const requests = await prisma.emergencyRequest.findMany({
      where: whereClause,
      include: {
        citizen: {
          select: {
            name: true,
            phoneNumber: true
          }
        },
        provider: {
          select: {
            name: true,
            phoneNumber: true,
            providerProfile: {
              select: {
                serviceType: true,
                vehicleNumber: true
              }
            }
          }
        }
      },
      orderBy: { requestedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.emergencyRequest.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total
        }
      }
    });
  } catch (error) {
    console.error('❌ Get admin requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Get all providers
router.get('/providers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      serviceType, 
      isOnline, 
      isVerified, 
      limit = 50, 
      offset = 0 
    } = req.query;

    const whereClause = {};

    if (serviceType) whereClause.serviceType = serviceType.toUpperCase();
    if (isOnline !== undefined) whereClause.isOnline = isOnline === 'true';
    if (isVerified !== undefined) whereClause.isVerified = isVerified === 'true';

    const providers = await prisma.providerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.providerProfile.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        providers,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total
        }
      }
    });
  } catch (error) {
    console.error('❌ Get admin providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Update provider verification status
router.put('/providers/:providerId/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { isVerified } = req.body;

    const provider = await prisma.providerProfile.update({
      where: { userId: providerId },
      data: { isVerified }
    });

    res.json({
      success: true,
      message: `Provider ${isVerified ? 'verified' : 'unverified'} successfully.`,
      data: { provider }
    });
  } catch (error) {
    console.error('❌ Update provider verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Create new user (admin only)
router.post('/users', 
  authenticateToken, 
  requireAdmin,
  validateRequest(createUserSchema),
  async (req, res) => {
    try {
      const { phoneNumber, name, email, userType } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { phoneNumber }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this phone number already exists.',
          error: 'USER_EXISTS'
        });
      }

      const user = await prisma.user.create({
        data: {
          phoneNumber,
          name,
          email,
          userType: userType.toUpperCase(),
          isActive: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: { user }
      });
    } catch (error) {
      console.error('❌ Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: 'INTERNAL_ERROR'
      });
    }
  }
);

// Get system analytics
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const timeFilter = {};
    if (startDate) timeFilter.gte = new Date(startDate);
    if (endDate) timeFilter.lte = new Date(endDate);

    // Response time analytics
    const responseTimeData = await prisma.emergencyRequest.findMany({
      where: {
        requestedAt: timeFilter,
        acceptedAt: { not: null }
      },
      select: {
        requestedAt: true,
        acceptedAt: true,
        serviceType: true
      }
    });

    const responseTimes = responseTimeData.map(req => ({
      serviceType: req.serviceType,
      responseTime: Math.round((req.acceptedAt - req.requestedAt) / 1000 / 60) // minutes
    }));

    // Geographic distribution
    const locationData = await prisma.emergencyRequest.findMany({
      where: { requestedAt: timeFilter },
      select: {
        latitude: true,
        longitude: true,
        serviceType: true,
        status: true
      }
    });

    // Provider performance
    const providerPerformance = await prisma.providerProfile.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        },
        requests: {
          where: { requestedAt: timeFilter },
          select: {
            status: true,
            requestedAt: true,
            completedAt: true
          }
        }
      }
    });

    const performanceData = providerPerformance.map(provider => ({
      providerId: provider.userId,
      name: provider.user.name,
      serviceType: provider.serviceType,
      totalJobs: provider.requests.length,
      completedJobs: provider.requests.filter(r => r.status === 'COMPLETED').length,
      rating: provider.rating,
      isOnline: provider.isOnline
    }));

    res.json({
      success: true,
      data: {
        responseTimes,
        locationData,
        providerPerformance: performanceData
      }
    });
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;