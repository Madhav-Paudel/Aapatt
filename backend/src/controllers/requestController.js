const { PrismaClient } = require('@prisma/client');
const { findNearestProviders, calculateETA, reverseGeocode } = require('../services/locationService');
const { emitEmergencyRequest, emitRequestStatusUpdate } = require('../services/socketService');
const { sendPushNotification, sendMulticastNotification } = require('../services/firebaseService');

const prisma = new PrismaClient();

// Create emergency request
const createEmergencyRequest = async (req, res) => {
  try {
    const {
      serviceType,
      latitude,
      longitude,
      address,
      landmark,
      description,
      injuryType,
      severity,
      isSecurityAlert
    } = req.body;

    const citizenId = req.user.id;

    // Get address if not provided
    let requestAddress = address;
    if (!requestAddress) {
      const geocodeResult = await reverseGeocode(latitude, longitude);
      if (geocodeResult.success) {
        requestAddress = geocodeResult.address;
      }
    }

    // Create emergency request
    const emergencyRequest = await prisma.emergencyRequest.create({
      data: {
        citizenId,
        serviceType: serviceType.toUpperCase(),
        latitude,
        longitude,
        address: requestAddress,
        landmark,
        description,
        injuryType,
        severity: severity?.toUpperCase(),
        isSecurityAlert: isSecurityAlert || false,
        status: 'PENDING',
        priority: severity === 'CRITICAL' || severity === 'FATAL' ? 'CRITICAL' : 'MEDIUM'
      }
    });

    // Find nearest available providers
    const nearestProviders = await findNearestProviders(
      prisma,
      serviceType.toUpperCase(),
      latitude,
      longitude,
      5, // Limit to 5 nearest providers
      50000 // 50km max distance
    );

    if (nearestProviders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available providers found in your area.',
        error: 'NO_PROVIDERS_AVAILABLE',
        data: { requestId: emergencyRequest.id }
      });
    }

    // Calculate ETA for nearest provider
    const nearestProvider = nearestProviders[0];
    const etaResult = await calculateETA(
      nearestProvider.currentLatitude,
      nearestProvider.currentLongitude,
      latitude,
      longitude
    );

    // Update request with ETA
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id: emergencyRequest.id },
      data: {
        estimatedArrival: etaResult.success ? 
          new Date(Date.now() + etaResult.duration * 1000) : 
          new Date(Date.now() + 15 * 60 * 1000) // 15 minutes fallback
      },
      include: {
        citizen: {
          select: {
            name: true,
            phoneNumber: true
          }
        }
      }
    });

    // Prepare request data for providers
    const requestData = {
      id: updatedRequest.id,
      serviceType: updatedRequest.serviceType,
      citizen: updatedRequest.citizen,
      latitude: updatedRequest.latitude,
      longitude: updatedRequest.longitude,
      address: updatedRequest.address,
      landmark: updatedRequest.landmark,
      description: updatedRequest.description,
      injuryType: updatedRequest.injuryType,
      severity: updatedRequest.severity,
      priority: updatedRequest.priority,
      isSecurityAlert: updatedRequest.isSecurityAlert,
      requestedAt: updatedRequest.requestedAt,
      estimatedArrival: updatedRequest.estimatedArrival,
      distance: nearestProvider.distance,
      eta: etaResult.success ? Math.round(etaResult.duration / 60) : 15 // minutes
    };

    // Emit to providers via Socket.IO
    emitEmergencyRequest(serviceType.toUpperCase(), requestData);

    // Send push notifications to providers
    const providerTokens = nearestProviders
      .map(p => p.user?.fcmToken)
      .filter(token => token);

    if (providerTokens.length > 0) {
      await sendMulticastNotification(
        providerTokens,
        `🚨 New ${serviceType} Emergency`,
        `Emergency request from ${updatedRequest.citizen.name || 'Citizen'} - ${Math.round(nearestProvider.distance)}m away`,
        {
          requestId: updatedRequest.id,
          serviceType: updatedRequest.serviceType,
          type: 'EMERGENCY_REQUEST'
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Emergency request created successfully.',
      data: {
        request: updatedRequest,
        nearestProvider: {
          id: nearestProvider.userId,
          name: nearestProvider.user.name,
          distance: Math.round(nearestProvider.distance),
          eta: etaResult.success ? Math.round(etaResult.duration / 60) : 15
        },
        availableProviders: nearestProviders.length
      }
    });
  } catch (error) {
    console.error('❌ Create emergency request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Get user's emergency requests
const getUserRequests = async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const whereClause = {
      citizenId: userId
    };

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const requests = await prisma.emergencyRequest.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            providerProfile: {
              select: {
                serviceType: true,
                vehicleNumber: true,
                rating: true
              }
            }
          }
        }
      },
      orderBy: { requestedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: requests.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Get specific emergency request
const getEmergencyRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        OR: [
          { citizenId: userId },
          { providerId: userId }
        ]
      },
      include: {
        citizen: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            providerProfile: {
              select: {
                serviceType: true,
                vehicleNumber: true,
                rating: true,
                currentLatitude: true,
                currentLongitude: true
              }
            }
          }
        },
        locationUpdates: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found.',
        error: 'REQUEST_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: { request }
    });
  } catch (error) {
    console.error('❌ Get emergency request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Cancel emergency request
const cancelEmergencyRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        citizenId: userId,
        status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE'] }
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found or cannot be cancelled.',
        error: 'REQUEST_NOT_FOUND'
      });
    }

    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date()
      }
    });

    // Notify provider if request was accepted
    if (request.providerId) {
      emitRequestStatusUpdate(requestId, 'CANCELLED', {
        reason: 'Cancelled by citizen'
      });
    }

    res.json({
      success: true,
      message: 'Emergency request cancelled successfully.',
      data: { request: updatedRequest }
    });
  } catch (error) {
    console.error('❌ Cancel emergency request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Update request status (for providers)
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, latitude, longitude } = req.body;
    const providerId = req.user.id;

    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        providerId: providerId
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found.',
        error: 'REQUEST_NOT_FOUND'
      });
    }

    const updateData = { status: status.toUpperCase() };

    // Add timestamp based on status
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        updateData.acceptedAt = new Date();
        break;
      case 'EN_ROUTE':
        // No specific timestamp needed
        break;
      case 'ARRIVED':
        updateData.arrivedAt = new Date();
        break;
      case 'COMPLETED':
        updateData.completedAt = new Date();
        break;
    }

    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        citizen: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        },
        provider: {
          select: {
            id: true,
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
      }
    });

    // Emit status update to citizen
    emitRequestStatusUpdate(requestId, status.toUpperCase(), {
      provider: updatedRequest.provider,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Request status updated successfully.',
      data: { request: updatedRequest }
    });
  } catch (error) {
    console.error('❌ Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  createEmergencyRequest,
  getUserRequests,
  getEmergencyRequest,
  cancelEmergencyRequest,
  updateRequestStatus
};