const databaseService = require('../services/databaseService');
const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');
const locationService = require('../services/locationService');

class RequestController {
  // Create new emergency request
  async createEmergencyRequest(req, res) {
    try {
      const { userId } = req.user;
      const { 
        type, 
        description, 
        latitude, 
        longitude, 
        address,
        severity,
        needsPolice 
      } = req.body;

      // Validate emergency type
      const validTypes = ['AMBULANCE', 'FIRE_BRIGADE', 'AIR_AMBULANCE'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: 'Invalid emergency type' 
        });
      }

      // Create emergency request
      const emergencyRequest = await databaseService.createEmergencyRequest({
        citizenId: userId,
        type,
        description: description || `Emergency ${type.toLowerCase()} request`,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || 'Location not specified',
        severity: severity || 'MEDIUM',
        needsPolice: needsPolice || false,
        status: 'PENDING',
        createdAt: new Date()
      });

      // Find nearby available providers
      const nearbyProviders = await databaseService.getAvailableProviders(
        type,
        latitude,
        longitude,
        10000 // 10km radius
      );

      // Calculate ETAs for nearby providers
      const providersWithETA = await Promise.all(
        nearbyProviders.map(async (provider) => {
          const eta = await locationService.calculateETA(
            { lat: latitude, lng: longitude },
            { lat: provider.latitude, lng: provider.longitude }
          );
          return { ...provider, eta };
        })
      );

      // Create status update
      await databaseService.createStatusUpdate({
        emergencyRequestId: emergencyRequest.id,
        status: 'PENDING',
        message: 'Emergency request created, searching for providers...',
        createdAt: new Date()
      });

      // Real-time notifications
      socketService.broadcastToProviders('new_emergency_request', {
        requestId: emergencyRequest.id,
        type,
        description,
        latitude,
        longitude,
        address,
        severity,
        citizenName: emergencyRequest.citizen.name,
        distance: providersWithETA.length > 0 ? providersWithETA[0].distance : null,
        eta: providersWithETA.length > 0 ? providersWithETA[0].eta : null
      });

      // Send push notifications to nearby providers
      const providerTokens = nearbyProviders
        .filter(p => p.deviceToken)
        .map(p => p.deviceToken);

      if (providerTokens.length > 0) {
        await notificationService.sendToDevices(providerTokens, {
          title: `🚨 New ${type.replace('_', ' ')} Emergency`,
          body: `Emergency request near you. Tap to view details.`,
          data: {
            requestId: emergencyRequest.id,
            type: 'emergency_request'
          }
        });
      }

      // Notify admins
      socketService.broadcastToAdmins('new_emergency_request', {
        requestId: emergencyRequest.id,
        type,
        citizenId: userId,
        location: { latitude, longitude },
        nearbyProviders: providersWithETA.length,
        severity
      });

      res.status(201).json({
        success: true,
        message: 'Emergency request created successfully',
        data: {
          requestId: emergencyRequest.id,
          status: 'PENDING',
          estimatedResponse: providersWithETA.length > 0 ? 
            `${Math.min(...providersWithETA.map(p => p.eta))} minutes` : 
            'Searching for available providers...',
          nearbyProviders: providersWithETA.length
        }
      });

    } catch (error) {
      console.error('Create emergency request error:', error);
      res.status(500).json({ 
        error: 'Failed to create emergency request',
        message: error.message 
      });
    }
  }

  // Get emergency request details
  async getEmergencyRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { userId, userType } = req.user;

      const request = await databaseService.getEmergencyRequest(requestId);

      if (!request) {
        return res.status(404).json({ 
          error: 'Emergency request not found' 
        });
      }

      // Check access permissions
      if (userType === 'citizen' && request.citizenId !== userId) {
        return res.status(403).json({ 
          error: 'Access denied' 
        });
      }
      if (userType === 'provider' && request.providerId !== userId) {
        return res.status(403).json({ 
          error: 'Access denied' 
        });
      }

      res.json({
        success: true,
        data: request
      });

    } catch (error) {
      console.error('Get emergency request error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch emergency request',
        message: error.message 
      });
    }
  }

  // Provider accepts emergency request
  async acceptRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { userId } = req.user;
      const { estimatedArrival } = req.body;

      // Get the request
      const request = await databaseService.getEmergencyRequest(requestId);

      if (!request) {
        return res.status(404).json({ 
          error: 'Emergency request not found' 
        });
      }

      if (request.status !== 'PENDING') {
        return res.status(400).json({ 
          error: 'Request already assigned or completed' 
        });
      }

      // Update request with provider
      const updatedRequest = await databaseService.updateEmergencyRequest(requestId, {
        providerId: userId,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null
      });

      // Create status update
      await databaseService.createStatusUpdate({
        emergencyRequestId: requestId,
        status: 'ACCEPTED',
        message: 'Provider accepted the request and is on the way',
        createdAt: new Date()
      });

      // Notify citizen
      socketService.notifyCitizen(request.citizenId, 'provider_response', {
        requestId,
        response: 'accepted',
        providerId: userId,
        providerName: updatedRequest.provider.name,
        vehicleNumber: updatedRequest.provider.vehicleNumber,
        phoneNumber: updatedRequest.provider.phoneNumber,
        estimatedArrival
      });

      // Send push notification to citizen
      if (request.citizen.deviceToken) {
        await notificationService.sendToDevice(request.citizen.deviceToken, {
          title: '✅ Help is on the way!',
          body: `${updatedRequest.provider.name} is coming to help you.`,
          data: {
            requestId,
            type: 'provider_accepted'
          }
        });
      }

      // Notify other providers that request is taken
      socketService.broadcastToProviders('request_taken', { requestId });

      // Notify admins
      socketService.broadcastToAdmins('provider_response', {
        requestId,
        response: 'accepted',
        providerId: userId,
        citizenId: request.citizenId
      });

      res.json({
        success: true,
        message: 'Request accepted successfully',
        data: {
          requestId,
          status: 'ACCEPTED',
          citizenLocation: {
            latitude: request.latitude,
            longitude: request.longitude,
            address: request.address
          }
        }
      });

    } catch (error) {
      console.error('Accept request error:', error);
      res.status(500).json({ 
        error: 'Failed to accept request',
        message: error.message 
      });
    }
  }

  // Update request status
  async updateRequestStatus(req, res) {
    try {
      const { requestId } = req.params;
      const { userId, userType } = req.user;
      const { status, message, location } = req.body;

      const validStatuses = ['EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status' 
        });
      }

      // Get the request
      const request = await databaseService.getEmergencyRequest(requestId);

      if (!request) {
        return res.status(404).json({ 
          error: 'Emergency request not found' 
        });
      }

      // Check permissions
      if (userType === 'provider' && request.providerId !== userId) {
        return res.status(403).json({ 
          error: 'Access denied' 
        });
      }

      // Update request
      const updateData = { status };
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
        updateData.responseTimeMinutes = Math.floor(
          (new Date() - new Date(request.createdAt)) / 60000
        );
      }

      const updatedRequest = await databaseService.updateEmergencyRequest(
        requestId, 
        updateData
      );

      // Create status update
      await databaseService.createStatusUpdate({
        emergencyRequestId: requestId,
        status,
        message: message || `Status updated to ${status}`,
        location: location ? JSON.stringify(location) : null,
        createdAt: new Date()
      });

      // Real-time notifications
      const statusData = {
        requestId,
        status,
        message,
        timestamp: new Date().toISOString(),
        location
      };

      // Notify citizen
      socketService.notifyCitizen(request.citizenId, 'request_status_update', statusData);

      // Notify admins
      socketService.broadcastToAdmins('request_status_update', statusData);

      // Send push notification to citizen
      if (request.citizen.deviceToken) {
        const statusMessages = {
          EN_ROUTE: 'Provider is on the way',
          ARRIVED: 'Provider has arrived at your location',
          COMPLETED: 'Emergency request completed',
          CANCELLED: 'Emergency request cancelled'
        };

        await notificationService.sendToDevice(request.citizen.deviceToken, {
          title: 'Status Update',
          body: statusMessages[status],
          data: {
            requestId,
            type: 'status_update'
          }
        });
      }

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: statusData
      });

    } catch (error) {
      console.error('Update request status error:', error);
      res.status(500).json({ 
        error: 'Failed to update status',
        message: error.message 
      });
    }
  }

  // Get user's request history
  async getRequestHistory(req, res) {
    try {
      const { userId, userType } = req.user;
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;

      let requests;
      if (userType === 'citizen') {
        requests = await databaseService.prisma.emergencyRequest.findMany({
          where: { citizenId: userId },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                type: true,
                vehicleNumber: true,
                phoneNumber: true
              }
            },
            statusUpdates: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        });
      } else if (userType === 'provider') {
        requests = await databaseService.prisma.emergencyRequest.findMany({
          where: { providerId: userId },
          include: {
            citizen: {
              select: {
                id: true,
                name: true,
                phoneNumber: true
              }
            },
            statusUpdates: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        });
      }

      res.json({
        success: true,
        data: {
          requests,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: requests.length === parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get request history error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch request history',
        message: error.message 
      });
    }
  }

  // Get active requests (for providers and admins)
  async getActiveRequests(req, res) {
    try {
      const { userType } = req.user;

      if (!['provider', 'admin'].includes(userType)) {
        return res.status(403).json({ 
          error: 'Access denied' 
        });
      }

      const activeRequests = await databaseService.getActiveRequests();

      res.json({
        success: true,
        data: activeRequests
      });

    } catch (error) {
      console.error('Get active requests error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch active requests',
        message: error.message 
      });
    }
  }
}

module.exports = new RequestController();