const { getPrisma } = require('../services/databaseService');
const { broadcastToUser, broadcastToAdmin } = require('../services/socketService');
const { sendNotification } = require('../services/firebaseService');

const updateProviderProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceType, licenseNumber, vehicleInfo } = req.body;
    const prisma = getPrisma();

    // Check if provider profile exists
    let profile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create new provider profile
      profile = await prisma.providerProfile.create({
        data: {
          userId,
          serviceType: serviceType || 'AMBULANCE',
          licenseNumber,
          vehicleInfo: vehicleInfo || {},
          isAvailable: false,
          isOnline: false,
        },
      });
    } else {
      // Update existing profile
      profile = await prisma.providerProfile.update({
        where: { userId },
        data: {
          serviceType: serviceType || profile.serviceType,
          licenseNumber: licenseNumber || profile.licenseNumber,
          vehicleInfo: vehicleInfo || profile.vehicleInfo,
        },
      });
    }

    res.json({
      message: 'Provider profile updated successfully',
      profile: {
        id: profile.id,
        serviceType: profile.serviceType,
        licenseNumber: profile.licenseNumber,
        vehicleInfo: profile.vehicleInfo,
        isAvailable: profile.isAvailable,
        isOnline: profile.isOnline,
        rating: profile.rating,
        totalJobs: profile.totalJobs,
      },
    });

  } catch (error) {
    console.error('Update provider profile error:', error);
    res.status(500).json({ error: 'Failed to update provider profile' });
  }
};

const updateProviderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isOnline, isAvailable, latitude, longitude } = req.body;
    const prisma = getPrisma();

    const profile = await prisma.providerProfile.update({
      where: { userId },
      data: {
        isOnline: isOnline !== undefined ? isOnline : undefined,
        isAvailable: isAvailable !== undefined ? isAvailable : undefined,
        currentLat: latitude ? parseFloat(latitude) : undefined,
        currentLng: longitude ? parseFloat(longitude) : undefined,
      },
    });

    // Broadcast status update to admin dashboard
    broadcastToAdmin('provider-status-update', {
      userId,
      isOnline: profile.isOnline,
      isAvailable: profile.isAvailable,
      latitude: profile.currentLat,
      longitude: profile.currentLng,
    });

    res.json({
      message: 'Provider status updated successfully',
      status: {
        isOnline: profile.isOnline,
        isAvailable: profile.isAvailable,
        latitude: profile.currentLat,
        longitude: profile.currentLng,
      },
    });

  } catch (error) {
    console.error('Update provider status error:', error);
    res.status(500).json({ error: 'Failed to update provider status' });
  }
};

const getAvailableRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const prisma = getPrisma();

    // Get provider's service type
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { serviceType: true, currentLat: true, currentLng: true },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    if (!provider.currentLat || !provider.currentLng) {
      return res.status(400).json({ error: 'Provider location not set' });
    }

    // Get pending requests for this service type
    const requests = await prisma.emergencyRequest.findMany({
      where: {
        requestType: provider.serviceType,
        status: 'PENDING',
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
        },
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Calculate distances
    const requestsWithDistance = requests.map(request => {
      const distance = calculateDistance(
        provider.currentLat,
        provider.currentLng,
        request.latitude,
        request.longitude
      );
      
      return {
        ...request,
        distance: Math.round(distance),
      };
    });

    res.json({
      requests: requestsWithDistance.map(request => ({
        id: request.id,
        requestType: request.requestType,
        description: request.description,
        address: request.address,
        latitude: request.latitude,
        longitude: request.longitude,
        distance: request.distance,
        createdAt: request.createdAt,
        requester: request.requester,
      })),
    });

  } catch (error) {
    console.error('Get available requests error:', error);
    res.status(500).json({ error: 'Failed to get available requests' });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const prisma = getPrisma();

    // Check if request exists and is pending
    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        status: 'PENDING',
      },
      include: {
        requester: true,
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already accepted' });
    }

    // Check if provider is available
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!provider || !provider.isAvailable || !provider.isOnline) {
      return res.status(400).json({ error: 'Provider not available' });
    }

    // Update request
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED',
        acceptedBy: userId,
      },
    });

    // Create status update
    await prisma.requestUpdate.create({
      data: {
        requestId,
        status: 'ACCEPTED',
        message: 'Request accepted by provider',
      },
    });

    // Notify requester
    broadcastToUser(request.requestedBy, 'request-accepted', {
      requestId,
      providerId: userId,
      message: 'Your emergency request has been accepted',
    });

    // Notify admin
    broadcastToAdmin('request-accepted', {
      requestId,
      providerId: userId,
      requesterId: request.requestedBy,
    });

    // Send push notification to requester
    try {
      await sendNotification(
        request.requester.phoneNumber,
        '✅ Request Accepted',
        'Your emergency request has been accepted and help is on the way',
        {
          requestId,
          type: 'request_accepted',
        }
      );
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
    }

    res.json({
      message: 'Request accepted successfully',
      request: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        acceptedAt: new Date(),
      },
    });

  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
};

const getMyAcceptedRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;
    const prisma = getPrisma();

    const where = { acceptedBy: userId };
    if (status) {
      where.status = status;
    }

    const requests = await prisma.emergencyRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    res.json({
      requests: requests.map(request => ({
        id: request.id,
        requestType: request.requestType,
        status: request.status,
        description: request.description,
        address: request.address,
        latitude: request.latitude,
        longitude: request.longitude,
        eta: request.eta,
        createdAt: request.createdAt,
        completedAt: request.completedAt,
        requester: request.requester,
        latestUpdate: request.updates[0],
      })),
    });

  } catch (error) {
    console.error('Get accepted requests error:', error);
    res.status(500).json({ error: 'Failed to get accepted requests' });
  }
};

const updateRequestLocation = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { latitude, longitude, status, message } = req.body;
    const userId = req.user.id;
    const prisma = getPrisma();

    // Verify provider has accepted this request
    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        acceptedBy: userId,
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not accepted by you' });
    }

    // Update provider location
    await prisma.providerProfile.update({
      where: { userId },
      data: {
        currentLat: parseFloat(latitude),
        currentLng: parseFloat(longitude),
      },
    });

    // Create location update record
    await prisma.locationUpdate.create({
      data: {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    // Update request status if provided
    if (status) {
      await prisma.emergencyRequest.update({
        where: { id: requestId },
        data: { status },
      });

      await prisma.requestUpdate.create({
        data: {
          requestId,
          status,
          message: message || 'Location updated',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      });

      // Notify requester
      broadcastToUser(request.requestedBy, 'request-update', {
        requestId,
        status,
        message,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        updatedAt: new Date(),
      });
    }

    res.json({
      message: 'Location updated successfully',
    });

  } catch (error) {
    console.error('Update request location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Distance in meters
};

module.exports = {
  updateProviderProfile,
  updateProviderStatus,
  getAvailableRequests,
  acceptRequest,
  getMyAcceptedRequests,
  updateRequestLocation,
};