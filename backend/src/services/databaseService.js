const { PrismaClient } = require('@prisma/client');

class DatabaseService {
  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('📊 Database connection established');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      console.log('📊 Database connection closed');
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }

  // Emergency Requests
  async createEmergencyRequest(data) {
    return await this.prisma.emergencyRequest.create({
      data,
      include: {
        citizen: true,
        provider: true
      }
    });
  }

  async getEmergencyRequest(id) {
    return await this.prisma.emergencyRequest.findUnique({
      where: { id },
      include: {
        citizen: true,
        provider: true,
        statusUpdates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async updateEmergencyRequest(id, data) {
    return await this.prisma.emergencyRequest.update({
      where: { id },
      data,
      include: {
        citizen: true,
        provider: true
      }
    });
  }

  async getActiveRequests() {
    return await this.prisma.emergencyRequest.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACCEPTED', 'EN_ROUTE']
        }
      },
      include: {
        citizen: true,
        provider: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Providers
  async createProvider(data) {
    return await this.prisma.provider.create({
      data
    });
  }

  async getProvider(id) {
    return await this.prisma.provider.findUnique({
      where: { id },
      include: {
        emergencyRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async getAvailableProviders(type, latitude, longitude, radius = 10000) {
    // Using raw SQL for PostGIS distance calculation
    return await this.prisma.$queryRaw`
      SELECT * FROM "Provider" 
      WHERE "isOnline" = true 
      AND "type" = ${type}
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326),
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
        ${radius}
      )
      ORDER BY ST_Distance(
        ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326),
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      LIMIT 10
    `;
  }

  async updateProviderLocation(id, latitude, longitude) {
    return await this.prisma.provider.update({
      where: { id },
      data: {
        latitude,
        longitude,
        lastLocationUpdate: new Date()
      }
    });
  }

  // Citizens
  async createCitizen(data) {
    return await this.prisma.citizen.create({
      data
    });
  }

  async getCitizen(id) {
    return await this.prisma.citizen.findUnique({
      where: { id },
      include: {
        emergencyRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  // Status Updates
  async createStatusUpdate(data) {
    return await this.prisma.statusUpdate.create({
      data
    });
  }

  // Analytics
  async getAnalytics(startDate, endDate) {
    const totalRequests = await this.prisma.emergencyRequest.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const completedRequests = await this.prisma.emergencyRequest.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const averageResponseTime = await this.prisma.emergencyRequest.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _avg: {
        responseTimeMinutes: true
      }
    });

    return {
      totalRequests,
      completedRequests,
      averageResponseTime: averageResponseTime._avg.responseTimeMinutes || 0,
      completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0
    };
  }
}

const databaseService = new DatabaseService();
module.exports = databaseService;