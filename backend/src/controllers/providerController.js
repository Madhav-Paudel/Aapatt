/**
 * Provider Controller
 * Handles provider operations and request management
 */

import { prisma } from '../services/databaseService.js';
import { broadcastRequestAccepted, notifyRequestUpdate } from '../services/socketService.js';

/**
 * Register as provider
 */
export const registerProvider = async (req, res) => {
  try {
    const { serviceType, vehicleNumber, licenseNumber } = req.body;
    const userId = req.userId;
    
    // Check if already a provider
    const existingProvider = await prisma.provider.findUnique({
      where: { userId }
    });
    
    if (existingProvider) {
      return res.status(400).json({ error: 'Already registered as provider' });
    }
    
    // Create provider profile
    const provider = await prisma.provider.create({
      data: {
        userId,
        serviceType,
        vehicleNumber,
        licenseNumber,
        status: 'OFFLINE',
        isVerified: false // Requires admin verification
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
    
    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'PROVIDER' }
    });
    
    res.status(201).json({
      message: 'Provider registration successful. Awaiting verification.',
      provider
    });
  } catch (error) {
    console.error('Provider registration error:', error);
    res.status(500).json({ error: 'Provider registration failed' });
  }
};

/**
 * Get provider profile
 */
export const getProvider = async (req, res) => {
  try {
    const { id } = req.params;
    
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        requests: {
          where: {
            status: {
              in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED']
            }
          },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json({ provider });
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
};

/**
 * Update provider status (online/offline)
 */
export const updateProviderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const providerId = req.provider.id;
    
    if (!['ONLINE', 'OFFLINE', 'BUSY'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const provider = await prisma.provider.update({
      where: { id: providerId },
      data: { status }
    });
    
    // Notify admin dashboard
    const io = req.app.get('io');
    io.to('admin').emit('provider_status_change', {
      providerId,
      status,
      timestamp: new Date()
    });
    
    res.json({
      message: 'Status updated',
      provider
    });
  } catch (error) {
    console.error('Update provider status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

/**
 * Update provider location
 */
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, speed, accuracy } = req.body;
    const providerId = req.provider.id;
    
    // Update provider location
    await prisma.provider.update({
      where: { id: providerId },
      data: { latitude, longitude }
    });
    
    // Store location history
    await prisma.locationHistory.create({
      data: {
        providerId,
        latitude,
        longitude,
        speed,
        accuracy
      }
    });
    
    // Broadcast to active requests
    const activeRequest = await prisma.emergencyRequest.findFirst({
      where: {
        providerId,
        status: {
          in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED']
        }
      }
    });
    
    if (activeRequest) {
      const io = req.app.get('io');
      io.to(`request:${activeRequest.id}`).emit('provider_location_update', {
        providerId,
        latitude,
        longitude,
        timestamp: Date.now()
      });
    }
    
    res.json({ message: 'Location updated' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

/**
 * Accept emergency request
 */
export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const providerId = req.provider.id;
    
    // Check if provider has active request
    const activeRequest = await prisma.emergencyRequest.findFirst({
      where: {
        providerId,
        status: {
          in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED']
        }
      }
    });
    
    if (activeRequest) {
      return res.status(400).json({
        error: 'You already have an active request'
      });
    }
    
    // Get request
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request already accepted' });
    }
    
    // Accept request
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        providerId,
        status: 'ACCEPTED',
        acceptedAt: new Date()
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
    
    // Update provider status
    await prisma.provider.update({
      where: { id: providerId },
      data: { status: 'BUSY' }
    });
    
    // Create status update
    await prisma.statusUpdate.create({
      data: {
        requestId,
        status: 'ACCEPTED',
        message: 'Provider is on the way'
      }
    });
    
    // Notify citizen
    const io = req.app.get('io');
    broadcastRequestAccepted(io, requestId, {
      provider: updatedRequest.provider,
      estimatedTime: request.estimatedTime
    });
    
    res.json({
      message: 'Request accepted',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
};

/**
 * Decline emergency request
 */
export const declineRequest = async (req, res) => {
  try {
    const { requestId, reason } = req.body;
    
    res.json({
      message: 'Request declined',
      requestId
    });
  } catch (error) {
    console.error('Decline request error:', error);
    res.status(500).json({ error: 'Failed to decline request' });
  }
};

/**
 * Get provider's request history
 */
export const getProviderRequests = async (req, res) => {
  try {
    const providerId = req.provider.id;
    const { status, limit = 50 } = req.query;
    
    const where = { providerId };
    
    if (status) {
      where.status = status;
    }
    
    const requests = await prisma.emergencyRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    
    res.json({ requests });
  } catch (error) {
    console.error('Get provider requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

/**
 * Get provider statistics
 */
export const getProviderStats = async (req, res) => {
  try {
    const providerId = req.provider.id;
    
    const stats = await prisma.emergencyRequest.groupBy({
      by: ['status'],
      where: { providerId },
      _count: true
    });
    
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });
    
    res.json({
      stats: {
        completedJobs: provider.completedJobs,
        rating: provider.rating,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Get provider stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

export default {
  registerProvider,
  getProvider,
  updateProviderStatus,
  updateLocation,
  acceptRequest,
  declineRequest,
  getProviderRequests,
  getProviderStats
};
