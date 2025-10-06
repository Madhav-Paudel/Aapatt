const { getPrisma } = require('../services/databaseService');
const { broadcastToAdmin } = require('../services/socketService');

const getDashboardStats = async (req, res) => {
  try {
    const prisma = getPrisma();

    // Get current date range
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get active requests count
    const activeRequests = await prisma.emergencyRequest.count({
      where: {
        status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'] }
      }
    });

    // Get completed requests today
    const completedToday = await prisma.emergencyRequest.count({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: todayStart
        }
      }
    });

    // Get total providers online
    const providersOnline = await prisma.providerProfile.count({
      where: {
        isOnline: true
      }
    });

    // Get available providers
    const providersAvailable = await prisma.providerProfile.count({
      where: {
        isOnline: true,
        isAvailable: true
      }
    });

    // Get average response time (last 7 days)
    const completedRequests = await prisma.emergencyRequest.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: weekStart
        }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    const avgResponseTime = completedRequests.length > 0 
      ? completedRequests.reduce((sum, req) => {
          const responseTime = (req.completedAt - req.createdAt) / (1000 * 60); // minutes
          return sum + responseTime;
        }, 0) / completedRequests.length
      : 0;

    // Get requests by type (last 7 days)
    const requestsByType = await prisma.emergencyRequest.groupBy({
      by: ['requestType'],
      where: {
        createdAt: {
          gte: weekStart
        }
      },
      _count: {
        id: true
      }
    });

    // Get requests by status
    const requestsByStatus = await prisma.emergencyRequest.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    res.json({
      stats: {
        activeRequests,
        completedToday,
        providersOnline,
        providersAvailable,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
        requestsByType: requestsByType.map(item => ({
          type: item.requestType,
          count: item._count.id
        })),
        requestsByStatus: requestsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
};

const getLiveMapData = async (req, res) => {
  try {
    const prisma = getPrisma();

    // Get active requests
    const activeRequests = await prisma.emergencyRequest.findMany({
      where: {
        status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'] }
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        },
        accepter: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        }
      }
    });

    // Get online providers
    const onlineProviders = await prisma.providerProfile.findMany({
      where: {
        isOnline: true,
        currentLat: { not: null },
        currentLng: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        }
      }
    });

    res.json({
      requests: activeRequests.map(request => ({
        id: request.id,
        type: request.requestType,
        status: request.status,
        description: request.description,
        address: request.address,
        latitude: request.latitude,
        longitude: request.longitude,
        createdAt: request.createdAt,
        requester: request.requester,
        accepter: request.accepter
      })),
      providers: onlineProviders.map(provider => ({
        id: provider.user.id,
        name: provider.user.name,
        serviceType: provider.serviceType,
        isAvailable: provider.isAvailable,
        latitude: provider.currentLat,
        longitude: provider.currentLng,
        rating: provider.rating,
        totalJobs: provider.totalJobs
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get live map data error:', error);
    res.status(500).json({ error: 'Failed to get live map data' });
  }
};

const getProviders = async (req, res) => {
  try {
    const { status, serviceType, limit = 50, offset = 0 } = req.query;
    const prisma = getPrisma();

    const where = {};
    if (status === 'online') {
      where.isOnline = true;
    } else if (status === 'offline') {
      where.isOnline = false;
    } else if (status === 'available') {
      where.isOnline = true;
      where.isAvailable = true;
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    const providers = await prisma.providerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
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

    const totalCount = await prisma.providerProfile.count({ where });

    res.json({
      providers: providers.map(provider => ({
        id: provider.id,
        userId: provider.userId,
        serviceType: provider.serviceType,
        licenseNumber: provider.licenseNumber,
        vehicleInfo: provider.vehicleInfo,
        isOnline: provider.isOnline,
        isAvailable: provider.isAvailable,
        currentLat: provider.currentLat,
        currentLng: provider.currentLng,
        rating: provider.rating,
        totalJobs: provider.totalJobs,
        createdAt: provider.createdAt,
        user: provider.user
      })),
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to get providers' });
  }
};

const updateProviderStatus = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { isOnline, isAvailable } = req.body;
    const prisma = getPrisma();

    const provider = await prisma.providerProfile.update({
      where: { userId: providerId },
      data: {
        isOnline: isOnline !== undefined ? isOnline : undefined,
        isAvailable: isAvailable !== undefined ? isAvailable : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        }
      }
    });

    // Broadcast update to admin dashboard
    broadcastToAdmin('provider-status-update', {
      userId: providerId,
      isOnline: provider.isOnline,
      isAvailable: provider.isAvailable,
      updatedBy: req.user.id
    });

    res.json({
      message: 'Provider status updated successfully',
      provider: {
        id: provider.id,
        userId: provider.userId,
        serviceType: provider.serviceType,
        isOnline: provider.isOnline,
        isAvailable: provider.isAvailable,
        user: provider.user
      }
    });

  } catch (error) {
    console.error('Update provider status error:', error);
    res.status(500).json({ error: 'Failed to update provider status' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const prisma = getPrisma();

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get requests in period
    const requests = await prisma.emergencyRequest.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        requestType: true,
        status: true,
        createdAt: true,
        completedAt: true
      }
    });

    // Calculate metrics
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'COMPLETED').length;
    const completionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    // Average response time
    const completedWithTime = requests.filter(r => 
      r.status === 'COMPLETED' && r.completedAt
    );
    const avgResponseTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, req) => {
          return sum + (req.completedAt - req.createdAt) / (1000 * 60); // minutes
        }, 0) / completedWithTime.length
      : 0;

    // Requests by type
    const requestsByType = requests.reduce((acc, req) => {
      acc[req.requestType] = (acc[req.requestType] || 0) + 1;
      return acc;
    }, {});

    // Requests by status
    const requestsByStatus = requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    // Daily breakdown
    const dailyBreakdown = {};
    requests.forEach(req => {
      const date = req.createdAt.toISOString().split('T')[0];
      dailyBreakdown[date] = (dailyBreakdown[date] || 0) + 1;
    });

    res.json({
      analytics: {
        period,
        totalRequests,
        completedRequests,
        completionRate: Math.round(completionRate * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        requestsByType,
        requestsByStatus,
        dailyBreakdown
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const prisma = getPrisma();

    // Check database connection
    const dbHealth = await prisma.$queryRaw`SELECT 1 as health`
      .then(() => 'healthy')
      .catch(() => 'unhealthy');

    // Get system metrics
    const totalUsers = await prisma.user.count();
    const totalProviders = await prisma.providerProfile.count();
    const activeRequests = await prisma.emergencyRequest.count({
      where: {
        status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'] }
      }
    });

    // Check for stuck requests (older than 1 hour)
    const stuckRequests = await prisma.emergencyRequest.count({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: new Date(Date.now() - 60 * 60 * 1000)
        }
      }
    });

    res.json({
      health: {
        database: dbHealth,
        overall: dbHealth === 'healthy' ? 'healthy' : 'unhealthy'
      },
      metrics: {
        totalUsers,
        totalProviders,
        activeRequests,
        stuckRequests
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({ error: 'Failed to get system health' });
  }
};

module.exports = {
  getDashboardStats,
  getLiveMapData,
  getProviders,
  updateProviderStatus,
  getAnalytics,
  getSystemHealth,
};