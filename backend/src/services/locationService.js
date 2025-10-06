const axios = require('axios');

const OSRM_API_URL = process.env.OSRM_API_URL || 'http://router.project-osrm.org/route/v1/driving';

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Calculate ETA using OSRM routing service
const calculateETA = async (fromLat, fromLon, toLat, toLon) => {
  try {
    const url = `${OSRM_API_URL}/${fromLon},${fromLat};${toLon},${toLat}?overview=false&steps=false`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const route = response.data.routes[0];
    
    if (!route) {
      throw new Error('No route found');
    }
    
    return {
      duration: route.duration, // in seconds
      distance: route.distance, // in meters
      success: true
    };
  } catch (error) {
    console.error('❌ ETA calculation failed:', error.message);
    
    // Fallback to straight-line distance calculation
    const distance = calculateDistance(fromLat, fromLon, toLat, toLon);
    const estimatedDuration = distance / 13.89; // Assuming 50 km/h average speed
    
    return {
      duration: estimatedDuration,
      distance: distance,
      success: false,
      fallback: true
    };
  }
};

// Find nearest providers using PostGIS (if available) or simple distance calculation
const findNearestProviders = async (prisma, serviceType, latitude, longitude, limit = 10, maxDistance = 50000) => {
  try {
    // Try PostGIS query first
    const providers = await prisma.$queryRaw`
      SELECT 
        p.*,
        u.name,
        u.phoneNumber,
        ST_Distance(
          ST_GeogFromText('POINT(${longitude} ${latitude})'),
          ST_GeogFromText('POINT(p."currentLongitude" p."currentLatitude")')
        ) as distance
      FROM "provider_profiles" p
      JOIN "users" u ON p."userId" = u.id
      WHERE p."serviceType" = ${serviceType}
        AND p."isOnline" = true
        AND p."isVerified" = true
        AND p."currentLatitude" IS NOT NULL
        AND p."currentLongitude" IS NOT NULL
        AND ST_DWithin(
          ST_GeogFromText('POINT(${longitude} ${latitude})'),
          ST_GeogFromText('POINT(p."currentLongitude" p."currentLatitude")'),
          ${maxDistance}
        )
      ORDER BY distance
      LIMIT ${limit}
    `;
    
    return providers;
  } catch (error) {
    console.warn('⚠️ PostGIS query failed, using fallback:', error.message);
    
    // Fallback to simple distance calculation
    const providers = await prisma.providerProfile.findMany({
      where: {
        serviceType: serviceType,
        isOnline: true,
        isVerified: true,
        currentLatitude: { not: null },
        currentLongitude: { not: null }
      },
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true
          }
        }
      }
    });
    
    // Calculate distances and filter
    const providersWithDistance = providers
      .map(provider => ({
        ...provider,
        distance: calculateDistance(
          latitude,
          longitude,
          provider.currentLatitude,
          provider.currentLongitude
        )
      }))
      .filter(provider => provider.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return providersWithDistance;
  }
};

// Get route coordinates for navigation
const getRouteCoordinates = async (fromLat, fromLon, toLat, toLon) => {
  try {
    const url = `${OSRM_API_URL}/${fromLon},${fromLat};${toLon},${toLat}?overview=full&steps=true`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const route = response.data.routes[0];
    
    if (!route) {
      throw new Error('No route found');
    }
    
    // Decode polyline if needed, or return coordinates directly
    return {
      coordinates: route.geometry.coordinates.map(coord => ({
        longitude: coord[0],
        latitude: coord[1]
      })),
      duration: route.duration,
      distance: route.distance,
      success: true
    };
  } catch (error) {
    console.error('❌ Route calculation failed:', error.message);
    return {
      coordinates: [],
      duration: 0,
      distance: 0,
      success: false,
      error: error.message
    };
  }
};

// Reverse geocoding to get address from coordinates
const reverseGeocode = async (latitude, longitude) => {
  try {
    // Using Nominatim (OpenStreetMap) for free reverse geocoding
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'Aapatt-Emergency-App/1.0'
        },
        timeout: 10000
      }
    );
    
    const data = response.data;
    const address = data.display_name || 'Unknown location';
    
    return {
      success: true,
      address,
      components: {
        houseNumber: data.address?.house_number,
        road: data.address?.road,
        suburb: data.address?.suburb,
        city: data.address?.city || data.address?.town,
        state: data.address?.state,
        country: data.address?.country,
        postcode: data.address?.postcode
      }
    };
  } catch (error) {
    console.error('❌ Reverse geocoding failed:', error.message);
    return {
      success: false,
      address: 'Unknown location',
      error: error.message
    };
  }
};

module.exports = {
  calculateDistance,
  calculateETA,
  findNearestProviders,
  getRouteCoordinates,
  reverseGeocode
};