const { getPrisma } = require('../services/databaseService');
const { broadcastToProviders, broadcastToUser, broadcastToAdmin } = require('../services/socketService');
const { sendNotification } = require('../services/firebaseService');

// Calculate distance between two points using Haversine formula
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

// Find nearest available providers
const findNearestProviders = async (serviceType, latitude, longitude, limit = 5) => {
  const prisma = getPrisma();
  
  const providers = await prisma.providerProfile.findMany({
    where: {
      serviceType: serviceType,
      isOnline: true,
      isAvailable: true,
      currentLat: { not: null },
      currentLng: { not: null },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
        },
      },
    },
  });

  // Calculate distances and sort
  const providersWithDistance = providers.map(provider => ({
    ...provider,
    distance: calculateDistance(
      latitude, 
      longitude, 
      provider.currentLat, 
      provider.currentLng
    ),
  }));

  return providersWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

const createEmergencyRequest = async (req, res) => {
  try {
    const { requestType, description, address, latitude, longitude } = req.body;
    const userId = req.user.id;
    const prisma = getPrisma();

    // Validate location
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location coordinates required' });
    }

    // Create emergency request
    const request = await prisma.emergencyRequest.create({
      data: {
        requestType,
        description,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        requestedBy: userId,
        status: 'PENDING',
      },
    });

    // Find nearest providers
    const nearestProviders = await findNearestProviders(
      requestType, 
      latitude, 
      longitude
    );

    // Broadcast to providers
    broadcastToProviders(requestType, 'new-emergency-request', {
      requestId: request.id,
      requestType,
      description,
      address,
      latitude,
      longitude,
      distance: nearestProviders[0]?.distance || null,
      requestedAt: request.createdAt,
    });

    // Broadcast to admin dashboard
    broadcastToAdmin('new-emergency-request', {
      requestId: request.id,
      requestType,
      description,
      address,
      latitude,
      longitude,
      requestedBy: userId,
      requestedAt: request.createdAt,
    });

    // Send push notifications to nearest providers
    const providerTokens = nearestProviders
      .map(p => p.user.phoneNumber) // Using phone number as token for now
      .filter(Boolean);

    if (providerTokens.length > 0) {
      try {
        await sendNotification(
          providerTokens[0], // Send to nearest provider
          '🚨 New Emergency Request',
          `${requestType} needed at ${address || 'your location'}`,
          {
            requestId: request.id,
            type: 'emergency_request',
          }
        );
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
      }
    }

    res.status(201).json({
      message: 'Emergency request created successfully',
      request: {
        id: request.id,
        requestType: request.requestType,
        status: request.status,
        description: request.description,
        address: request.address,
        latitude: request.latitude,
        longitude: request.longitude,
        createdAt: request.createdAt,
        nearestProvider: nearestProviders[0] ? {
          id: nearestProviders[0].user.id,
          name: nearestProviders[0].user.name,
          distance: Math.round(nearestProviders[0].distance),
        } : null,
      },
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create emergency request' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;
    const prisma = getPrisma();

    const where = { requestedBy: userId };
    if (status) {
      where.status = status;
    }

    const requests = await prisma.emergencyRequest.findMany({
      where,
      include: {
        accepter: {
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
        accepter: request.accepter,
        latestUpdate: request.updates[0],
      })),
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
};

const getRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const prisma = getPrisma();

    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        OR: [
          { requestedBy: userId },
          { acceptedBy: userId },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        accepter: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        updates: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      request: {
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
        accepter: request.accepter,
        updates: request.updates,
      },
    });

  } catch (error) {
    console.error('Get request details error:', error);
    res.status(500).json({ error: 'Failed to get request details' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, message, latitude, longitude } = req.body;
    const userId = req.user.id;
    const prisma = getPrisma();

    // Verify user has access to this request
    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        OR: [
          { requestedBy: userId },
          { acceptedBy: userId },
        ],
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update request status
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });

    // Create status update record
    await prisma.requestUpdate.create({
      data: {
        requestId,
        status,
        message,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    // Broadcast updates
    broadcastToUser(request.requestedBy, 'request-update', {
      requestId,
      status,
      message,
      latitude,
      longitude,
      updatedAt: new Date(),
    });

    broadcastToAdmin('request-status-update', {
      requestId,
      status,
      message,
      updatedBy: userId,
    });

    res.json({
      message: 'Request status updated successfully',
      request: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        updatedAt: new Date(),
      },
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const prisma = getPrisma();

    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        requestedBy: userId,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or cannot be cancelled' });
    }

    // Update request status
    await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' },
    });

    // Create status update
    await prisma.requestUpdate.create({
      data: {
        requestId,
        status: 'CANCELLED',
        message: 'Request cancelled by user',
      },
    });

    // Notify provider if request was accepted
    if (request.acceptedBy) {
      broadcastToUser(request.acceptedBy, 'request-cancelled', {
        requestId,
        message: 'Request cancelled by user',
      });
    }

    // Notify admin
    broadcastToAdmin('request-cancelled', {
      requestId,
      cancelledBy: userId,
    });

    res.json({
      message: 'Request cancelled successfully',
    });

  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
};

module.exports = {
  createEmergencyRequest,
  getMyRequests,
  getRequestDetails,
  updateRequestStatus,
  cancelRequest,
};