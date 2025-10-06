/**
 * Database Service
 * Handles database connection and queries using Prisma
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Connect to database
 */
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

/**
 * Disconnect from database
 */
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

/**
 * Find nearby providers using geospatial query
 * @param {number} latitude - User latitude
 * @param {number} longitude - User longitude
 * @param {string} serviceType - Type of emergency service
 * @param {number} radiusKm - Search radius in kilometers
 */
export const findNearbyProviders = async (latitude, longitude, serviceType, radiusKm = 10) => {
  // Note: This is a simplified version. In production with PostGIS:
  // Use ST_DWithin or ST_Distance_Sphere for accurate geospatial queries
  
  const providers = await prisma.provider.findMany({
    where: {
      serviceType,
      status: 'ONLINE',
      isVerified: true,
      latitude: { not: null },
      longitude: { not: null }
    },
    include: {
      user: {
        select: {
          name: true,
          phone: true
        }
      }
    }
  });
  
  // Calculate distances and filter by radius
  const providersWithDistance = providers
    .map(provider => {
      const distance = calculateDistance(
        latitude,
        longitude,
        provider.latitude,
        provider.longitude
      );
      return { ...provider, distance };
    })
    .filter(provider => provider.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
  
  return providersWithDistance;
};

/**
 * Calculate distance using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => degrees * (Math.PI / 180);

export { prisma };
export default prisma;
