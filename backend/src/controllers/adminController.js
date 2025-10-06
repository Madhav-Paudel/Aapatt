/**
 * Admin Controller
 * Handles admin operations and analytics
 */

import { prisma } from '../services/databaseService.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Active emergencies
    const activeEmergencies = await prisma.emergencyRequest.count({
      where: {
        status: {
          in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED']
        }
      }
    });
    
    // Available providers by type
    const availableProviders = await prisma.provider.groupBy({
      by: ['serviceType', 'status'],
      where: {
        isVerified: true
      },
      _count: true
    });
    
    // Today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStats = await prisma.emergencyRequest.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: today
        }
      },
      _count: true
    });
    
    // Average response time (simplified)
    const completedToday = await prisma.emergencyRequest.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: today
        },
        acceptedAt: {
          not: null
        }
      },
      select: {
        createdAt: true,
        acceptedAt: true
      }
    });
    
    let avgResponseTime = 0;
    if (completedToday.length > 0) {
      const totalTime = completedToday.reduce((sum, req) => {
        const diff = new Date(req.acceptedAt) - new Date(req.createdAt);
        return sum + diff;
      }, 0);
      avgResponseTime = Math.round(totalTime / completedToday.length / 1000 / 60); // Convert to minutes
    }
    
    // Total requests this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyRequests = await prisma.emergencyRequest.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });
    
    res.json({
      stats: {
        activeEmergencies,
        availableProviders: availableProviders.filter(p => p.status === 'ONLINE'),
        todayStats,
        avgResponseTime,
        weeklyRequests
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

/**
 * Get all emergency requests with filters
 */
export const getAllRequests = async (req, res) => {
  try {
    const { status, type, startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    const [requests, total] = await Promise.all([
      prisma.emergencyRequest.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              phone: true
            }
          },
          provider: {
            include: {
              user: {
                select: {
                  name: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.emergencyRequest.count({ where })
    ]);
    
    res.json({
      requests,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

/**
 * Get all providers
 */
export const getAllProviders = async (req, res) => {
  try {
    const { serviceType, status, isVerified } = req.query;
    
    const where = {};
    
    if (serviceType) {
      where.serviceType = serviceType;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }
    
    const providers = await prisma.provider.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ providers });
  } catch (error) {
    console.error('Get all providers error:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
};

/**
 * Verify provider
 */
export const verifyProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    
    const provider = await prisma.provider.update({
      where: { id },
      data: { isVerified },
      include: {
        user: true
      }
    });
    
    res.json({
      message: `Provider ${isVerified ? 'verified' : 'unverified'}`,
      provider
    });
  } catch (error) {
    console.error('Verify provider error:', error);
    res.status(500).json({ error: 'Failed to verify provider' });
  }
};

/**
 * Manually assign request to provider
 */
export const assignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { providerId } = req.body;
    
    const request = await prisma.emergencyRequest.findUnique({
      where: { id }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request already assigned' });
    }
    
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    if (provider.status !== 'ONLINE') {
      return res.status(400).json({ error: 'Provider is not available' });
    }
    
    // Assign request
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id },
      data: {
        providerId,
        status: 'ACCEPTED',
        acceptedAt: new Date()
      },
      include: {
        user: true,
        provider: {
          include: {
            user: true
          }
        }
      }
    });
    
    // Update provider status
    await prisma.provider.update({
      where: { id: providerId },
      data: { status: 'BUSY' }
    });
    
    // Notify both parties
    const io = req.app.get('io');
    io.to(`user:${request.userId}`).emit('request_accepted', {
      provider: updatedRequest.provider
    });
    io.to(`provider:${providerId}`).emit('request_assigned', {
      request: updatedRequest
    });
    
    res.json({
      message: 'Request assigned successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Assign request error:', error);
    res.status(500).json({ error: 'Failed to assign request' });
  }
};

/**
 * Get analytics data
 */
export const getAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // Requests by type
    const requestsByType = await prisma.emergencyRequest.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: true
    });
    
    // Requests by status
    const requestsByStatus = await prisma.emergencyRequest.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: true
    });
    
    // Daily breakdown
    const requests = await prisma.emergencyRequest.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    });
    
    // Group by day
    const dailyData = {};
    requests.forEach(req => {
      const date = req.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { total: 0, completed: 0 };
      }
      dailyData[date].total++;
      if (req.status === 'COMPLETED') {
        dailyData[date].completed++;
      }
    });
    
    res.json({
      analytics: {
        period,
        requestsByType,
        requestsByStatus,
        dailyData
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export default {
  getDashboardStats,
  getAllRequests,
  getAllProviders,
  verifyProvider,
  assignRequest,
  getAnalytics
};
