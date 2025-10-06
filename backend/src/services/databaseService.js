/**
 * Aapatt Emergency Superapp - Database Service
 * Prisma client initialization and database utilities
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('./loggerService');

// Initialize Prisma client with logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  errorFormat: 'pretty',
});

// Database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database health check passed');
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Disconnect database
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

// Database health check
async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'down',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Geospatial query utilities
const geoUtils = {
  /**
   * Find providers within radius of a location
   * @param {number} latitude - Center latitude
   * @param {number} longitude - Center longitude
   * @param {number} radiusKm - Search radius in kilometers
   * @param {string} type - Provider type filter
   * @returns {Promise<Array>} Array of nearby providers
   */
  async findNearbyProviders(latitude, longitude, radiusKm = 10, type = null) {
    const radiusMeters = radiusKm * 1000;
    
    // Use PostGIS ST_DWithin for efficient geospatial queries
    let whereClause = `
      ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${longitude}, ${latitude})::geography,
        ${radiusMeters}
      ) AND status = 'ONLINE' AND "isVerified" = true
    `;
    
    if (type) {
      whereClause += ` AND type = '${type}'`;
    }
    
    try {
      const providers = await prisma.$queryRawUnsafe(`
        SELECT 
          p.*,
          u.name,
          u."phoneNumber",
          ST_Distance(
            ST_MakePoint(p.longitude, p.latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography
          ) as distance
        FROM providers p
        JOIN users u ON p."userId" = u.id
        WHERE ${whereClause}
        ORDER BY distance ASC
        LIMIT 20
      `);
      
      return providers;
    } catch (error) {
      logger.error('Error finding nearby providers:', error);
      throw error;
    }
  },

  /**
   * Calculate distance between two points
   * @param {number} lat1 - First point latitude
   * @param {number} lon1 - First point longitude
   * @param {number} lat2 - Second point latitude
   * @param {number} lon2 - Second point longitude
   * @returns {Promise<number>} Distance in meters
   */
  async calculateDistance(lat1, lon1, lat2, lon2) {
    try {
      const result = await prisma.$queryRaw`
        SELECT ST_Distance(
          ST_MakePoint(${lon1}, ${lat1})::geography,
          ST_MakePoint(${lon2}, ${lat2})::geography
        ) as distance
      `;
      
      return result[0]?.distance || 0;
    } catch (error) {
      logger.error('Error calculating distance:', error);
      throw error;
    }
  },

  /**
   * Check if location is within geofence area
   * @param {number} latitude - Point latitude
   * @param {number} longitude - Point longitude
   * @param {string} areaId - Geofence area ID
   * @returns {Promise<boolean>} True if within area
   */
  async isLocationInArea(latitude, longitude, areaId) {
    try {
      const area = await prisma.geofenceArea.findUnique({
        where: { id: areaId, isActive: true }
      });
      
      if (!area) return false;
      
      const result = await prisma.$queryRaw`
        SELECT ST_Within(
          ST_MakePoint(${longitude}, ${latitude}),
          ST_GeomFromGeoJSON(${JSON.stringify(area.boundaries)})
        ) as within_area
      `;
      
      return result[0]?.within_area || false;
    } catch (error) {
      logger.error('Error checking geofence:', error);
      return false;
    }
  }
};

// Transaction wrapper
async function withTransaction(callback) {
  return await prisma.$transaction(callback);
}

// Cleanup old records
async function cleanupOldRecords() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Delete old location updates (older than 7 days)
    const deletedLocationUpdates = await prisma.locationUpdate.deleteMany({
      where: {
        timestamp: {
          lt: sevenDaysAgo
        }
      }
    });
    
    // Delete old analytics (older than 30 days)
    const deletedAnalytics = await prisma.analytics.deleteMany({
      where: {
        timestamp: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    // Delete old system health records (older than 7 days)
    const deletedHealthRecords = await prisma.systemHealth.deleteMany({
      where: {
        timestamp: {
          lt: sevenDaysAgo
        }
      }
    });
    
    logger.info(`Cleanup completed: ${deletedLocationUpdates.count} location updates, ${deletedAnalytics.count} analytics, ${deletedHealthRecords.count} health records deleted`);
    
  } catch (error) {
    logger.error('Error during cleanup:', error);
  }
}

// Database statistics
async function getDatabaseStats() {
  try {
    const [
      userCount,
      providerCount,
      activeRequestCount,
      completedRequestCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.emergencyRequest.count({
        where: {
          status: {
            in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED']
          }
        }
      }),
      prisma.emergencyRequest.count({
        where: {
          status: 'COMPLETED'
        }
      })
    ]);
    
    return {
      users: userCount,
      providers: providerCount,
      activeRequests: activeRequestCount,
      completedRequests: completedRequestCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error getting database stats:', error);
    throw error;
  }
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
  geoUtils,
  withTransaction,
  cleanupOldRecords,
  getDatabaseStats
};