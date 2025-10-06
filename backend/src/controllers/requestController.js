/**
 * Request Controller
 * Handles emergency request operations
 */

import { prisma, findNearbyProviders } from '../services/databaseService.js';
import { notifyProvidersOfNewRequest, notifyRequestUpdate } from '../services/socketService.js';

/**
 * Create new emergency request
 */
export const createRequest = async (req, res) => {
  try {
    const { type, latitude, longitude, description, address, requiresSecurity } = req.body;
    const userId = req.userId;
    
    // Check for active requests
    const activeRequest = await prisma.emergencyRequest.findFirst({
      where: {
        userId,
        status: {
          in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED']
        }
      }
    });
    
    if (activeRequest) {
      return res.status(400).json({
        error: 'You already have an active emergency request'
      });
    }
    
    // Find nearby providers
    const nearbyProviders = await findNearbyProviders(latitude, longitude, type, 50);
    
    if (nearbyProviders.length === 0) {
      return res.status(404).json({
        error: 'No providers available in your area',
        message: 'Please try again or contact emergency services directly'
      });
    }
    
    // Calculate initial ETA from closest provider
    const closestProvider = nearbyProviders[0];
    const estimatedTime = Math.ceil(closestProvider.distance / 0.67); // Assume 40 km/h average speed
    
    // Create request
    const request = await prisma.emergencyRequest.create({
      data: {
        userId,
        type,
        latitude,
        longitude,
        address,
        description,
        requiresSecurity,
        estimatedTime,
        distance: closestProvider.distance
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });
    
    // Notify nearby providers via Socket.IO
    const io = req.app.get('io');
    const providerIds = nearbyProviders.map(p => p.id);
    notifyProvidersOfNewRequest(io, providerIds, {
      ...request,
      distance: closestProvider.distance
    });
    
    res.status(201).json({
      message: 'Emergency request created',
      request,
      nearbyProviders: nearbyProviders.slice(0, 5).map(p => ({
        id: p.id,
        distance: p.distance,
        rating: p.rating
      }))
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create emergency request' });
  }
};

/**
 * Get request by ID
 */
export const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await prisma.emergencyRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        },
        statusUpdates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Check authorization
    if (req.user.role !== 'ADMIN' && 
        request.userId !== req.userId && 
        request.providerId !== req.user.provider?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json({ request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
};

/**
 * Get user's requests
 */
export const getUserRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.userId;
    
    const where = { userId };
    
    if (status) {
      where.status = status;
    }
    
    const requests = await prisma.emergencyRequest.findMany({
      where,
      include: {
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
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ requests });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

/**
 * Update request status
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, latitude, longitude } = req.body;
    
    const request = await prisma.emergencyRequest.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Update request
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id },
      data: {
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() })
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
    
    // Create status update
    await prisma.statusUpdate.create({
      data: {
        requestId: id,
        status,
        message,
        latitude,
        longitude
      }
    });
    
    // Notify user via Socket.IO
    const io = req.app.get('io');
    notifyRequestUpdate(io, request.userId, {
      requestId: id,
      status,
      message,
      timestamp: new Date()
    });
    
    res.json({
      message: 'Request status updated',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
};

/**
 * Cancel request
 */
export const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await prisma.emergencyRequest.findUnique({
      where: { id }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.userId !== req.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot cancel completed or cancelled request' });
    }
    
    // Update request
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    
    // Notify provider if accepted
    if (request.providerId) {
      const io = req.app.get('io');
      io.to(`provider:${request.providerId}`).emit('request_cancelled', {
        requestId: id,
        reason: 'Cancelled by user'
      });
    }
    
    res.json({
      message: 'Request cancelled',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
};

export default {
  createRequest,
  getRequest,
  getUserRequests,
  updateRequestStatus,
  cancelRequest
};
