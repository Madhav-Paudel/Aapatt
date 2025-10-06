/**
 * Aapatt Emergency Superapp - Socket.IO Service
 * Real-time communication for emergency requests and location tracking
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { prisma } = require('./databaseService');
const logger = require('./loggerService');
const { SOCKET_EVENTS } = require('@aapatt/shared');

let io;
const connectedUsers = new Map(); // userId -> socketId mapping
const connectedProviders = new Map(); // providerId -> socketId mapping

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user details
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          provider: true
        }
      });

      if (!user || !user.isActive) {
        return next(new Error('Invalid or inactive user'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      socket.provider = user.provider;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    handleConnection(socket);
  });

  logger.info('✅ Socket.IO server initialized');
  return io;
}

/**
 * Handle new socket connection
 * @param {Object} socket - Socket instance
 */
function handleConnection(socket) {
  const userId = socket.userId;
  const userRole = socket.userRole;
  const provider = socket.provider;

  logger.info(`User connected: ${userId} (${userRole})`);

  // Store connection
  connectedUsers.set(userId, socket.id);
  
  if (provider) {
    connectedProviders.set(provider.id, socket.id);
    
    // Join provider room for targeted notifications
    socket.join(`provider:${provider.id}`);
    socket.join(`provider_type:${provider.type}`);
  }

  // Join user room
  socket.join(`user:${userId}`);
  
  // Join role-based rooms
  socket.join(`role:${userRole}`);

  // Event handlers
  setupEventHandlers(socket);

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    handleDisconnection(socket, reason);
  });

  // Send connection confirmation
  socket.emit('connected', {
    success: true,
    userId,
    userRole,
    providerId: provider?.id,
    timestamp: new Date().toISOString()
  });
}

/**
 * Setup event handlers for socket
 * @param {Object} socket - Socket instance
 */
function setupEventHandlers(socket) {
  const userId = socket.userId;
  const provider = socket.provider;

  // Emergency request events
  socket.on(SOCKET_EVENTS.NEW_EMERGENCY, async (data) => {
    try {
      await handleNewEmergency(socket, data);
    } catch (error) {
      logger.error('Error handling new emergency:', error);
      socket.emit('error', { message: 'Failed to process emergency request' });
    }
  });

  // Provider response events
  socket.on(SOCKET_EVENTS.REQUEST_ACCEPTED, async (data) => {
    try {
      await handleRequestAccepted(socket, data);
    } catch (error) {
      logger.error('Error handling request acceptance:', error);
      socket.emit('error', { message: 'Failed to accept request' });
    }
  });

  socket.on(SOCKET_EVENTS.REQUEST_DECLINED, async (data) => {
    try {
      await handleRequestDeclined(socket, data);
    } catch (error) {
      logger.error('Error handling request decline:', error);
      socket.emit('error', { message: 'Failed to decline request' });
    }
  });

  // Location update events
  socket.on(SOCKET_EVENTS.PROVIDER_LOCATION_UPDATE, async (data) => {
    try {
      if (provider) {
        await handleLocationUpdate(socket, data);
      }
    } catch (error) {
      logger.error('Error handling location update:', error);
    }
  });

  // Status update events
  socket.on(SOCKET_EVENTS.STATUS_UPDATE, async (data) => {
    try {
      await handleStatusUpdate(socket, data);
    } catch (error) {
      logger.error('Error handling status update:', error);
      socket.emit('error', { message: 'Failed to update status' });
    }
  });

  // Provider status change
  socket.on(SOCKET_EVENTS.PROVIDER_STATUS_CHANGE, async (data) => {
    try {
      if (provider) {
        await handleProviderStatusChange(socket, data);
      }
    } catch (error) {
      logger.error('Error handling provider status change:', error);
    }
  });

  // Join request room for real-time updates
  socket.on('join_request', (requestId) => {
    socket.join(`request:${requestId}`);
    logger.info(`User ${userId} joined request room: ${requestId}`);
  });

  // Leave request room
  socket.on('leave_request', (requestId) => {
    socket.leave(`request:${requestId}`);
    logger.info(`User ${userId} left request room: ${requestId}`);
  });
}

/**
 * Handle new emergency request
 * @param {Object} socket - Socket instance
 * @param {Object} data - Emergency request data
 */
async function handleNewEmergency(socket, data) {
  const { requestId } = data;
  
  // Fetch the request details
  const request = await prisma.emergencyRequest.findUnique({
    where: { id: requestId },
    include: {
      citizen: true
    }
  });

  if (!request) {
    throw new Error('Request not found');
  }

  // Find nearby providers
  const { geoUtils } = require('./databaseService');
  const nearbyProviders = await geoUtils.findNearbyProviders(
    request.latitude,
    request.longitude,
    10, // 10km radius
    request.type
  );

  // Notify nearby providers
  for (const provider of nearbyProviders) {
    const providerSocketId = connectedProviders.get(provider.id);
    if (providerSocketId) {
      io.to(providerSocketId).emit(SOCKET_EVENTS.NEW_EMERGENCY, {
        request: {
          id: request.id,
          type: request.type,
          description: request.description,
          location: {
            latitude: request.latitude,
            longitude: request.longitude,
            address: request.address
          },
          priority: request.priority,
          distance: Math.round(provider.distance),
          citizenName: request.citizen.name,
          createdAt: request.createdAt
        }
      });
    }
  }

  // Also broadcast to provider type rooms
  socket.to(`provider_type:${request.type}`).emit(SOCKET_EVENTS.NEW_EMERGENCY, {
    request: {
      id: request.id,
      type: request.type,
      description: request.description,
      location: {
        latitude: request.latitude,
        longitude: request.longitude,
        address: request.address
      },
      priority: request.priority,
      citizenName: request.citizen.name,
      createdAt: request.createdAt
    }
  });

  logger.info(`Emergency request ${requestId} broadcasted to ${nearbyProviders.length} nearby providers`);
}

/**
 * Handle request acceptance
 * @param {Object} socket - Socket instance
 * @param {Object} data - Request acceptance data
 */
async function handleRequestAccepted(socket, data) {
  const { requestId, eta } = data;
  const providerId = socket.provider.id;

  // Update request status
  const updatedRequest = await prisma.emergencyRequest.update({
    where: { id: requestId },
    data: {
      status: 'ACCEPTED',
      providerId,
      acceptedAt: new Date(),
      eta
    },
    include: {
      citizen: true,
      provider: {
        include: {
          user: true
        }
      }
    }
  });

  // Notify citizen
  const citizenSocketId = connectedUsers.get(updatedRequest.citizenId);
  if (citizenSocketId) {
    io.to(citizenSocketId).emit(SOCKET_EVENTS.REQUEST_ACCEPTED, {
      request: updatedRequest,
      provider: {
        id: updatedRequest.provider.id,
        name: updatedRequest.provider.user.name,
        phoneNumber: updatedRequest.provider.user.phoneNumber,
        vehicleNumber: updatedRequest.provider.vehicleNumber,
        rating: updatedRequest.provider.rating,
        eta
      }
    });
  }

  // Notify other providers that request is no longer available
  socket.to(`provider_type:${updatedRequest.type}`).emit('request_unavailable', {
    requestId
  });

  logger.info(`Request ${requestId} accepted by provider ${providerId}`);
}

/**
 * Handle request decline
 * @param {Object} socket - Socket instance
 * @param {Object} data - Request decline data
 */
async function handleRequestDeclined(socket, data) {
  const { requestId, reason } = data;
  const providerId = socket.provider.id;

  // Log the decline
  logger.info(`Request ${requestId} declined by provider ${providerId}: ${reason || 'No reason provided'}`);

  // Could implement logic to track declines and find alternative providers
  // For now, just log the event
}

/**
 * Handle location updates
 * @param {Object} socket - Socket instance
 * @param {Object} data - Location update data
 */
async function handleLocationUpdate(socket, data) {
  const { latitude, longitude, requestId, accuracy, speed, heading } = data;
  const providerId = socket.provider.id;

  // Save location update
  const locationUpdate = await prisma.locationUpdate.create({
    data: {
      providerId,
      requestId,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      timestamp: new Date()
    }
  });

  // Update provider's current location
  await prisma.provider.update({
    where: { id: providerId },
    data: {
      latitude,
      longitude,
      lastSeen: new Date()
    }
  });

  // If this is for an active request, notify the citizen
  if (requestId) {
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId }
    });

    if (request) {
      // Calculate updated ETA
      const { geoUtils } = require('./databaseService');
      const distance = await geoUtils.calculateDistance(
        latitude, longitude,
        request.latitude, request.longitude
      );
      
      const eta = Math.ceil(distance / 1000 / 40 * 60); // Assuming 40 km/h average speed

      // Update ETA in database
      await prisma.emergencyRequest.update({
        where: { id: requestId },
        data: { eta }
      });

      // Notify citizen
      const citizenSocketId = connectedUsers.get(request.citizenId);
      if (citizenSocketId) {
        io.to(citizenSocketId).emit(SOCKET_EVENTS.PROVIDER_LOCATION_UPDATE, {
          providerId,
          location: { latitude, longitude },
          eta,
          distance: Math.round(distance),
          timestamp: locationUpdate.timestamp
        });
      }

      // Notify request room
      io.to(`request:${requestId}`).emit(SOCKET_EVENTS.ETA_UPDATE, {
        eta,
        distance: Math.round(distance)
      });
    }
  }
}

/**
 * Handle status updates
 * @param {Object} socket - Socket instance
 * @param {Object} data - Status update data
 */
async function handleStatusUpdate(socket, data) {
  const { requestId, status, notes } = data;

  // Update request status
  const updatedRequest = await prisma.emergencyRequest.update({
    where: { id: requestId },
    data: {
      status,
      ...(status === 'ARRIVED' && { arrivedAt: new Date() }),
      ...(status === 'COMPLETED' && { completedAt: new Date() })
    },
    include: {
      citizen: true,
      provider: {
        include: {
          user: true
        }
      }
    }
  });

  // Create status update record
  await prisma.statusUpdate.create({
    data: {
      requestId,
      status,
      notes,
      updatedBy: socket.userId
    }
  });

  // Notify all parties
  io.to(`request:${requestId}`).emit(SOCKET_EVENTS.STATUS_UPDATE, {
    request: updatedRequest,
    status,
    notes,
    timestamp: new Date().toISOString()
  });

  // If completed, update provider stats
  if (status === 'COMPLETED') {
    await prisma.provider.update({
      where: { id: updatedRequest.providerId },
      data: {
        totalJobs: { increment: 1 },
        completedJobs: { increment: 1 },
        status: 'ONLINE' // Make provider available again
      }
    });
  }

  logger.info(`Request ${requestId} status updated to ${status}`);
}

/**
 * Handle provider status changes
 * @param {Object} socket - Socket instance
 * @param {Object} data - Status change data
 */
async function handleProviderStatusChange(socket, data) {
  const { status } = data;
  const providerId = socket.provider.id;

  // Update provider status
  await prisma.provider.update({
    where: { id: providerId },
    data: {
      status,
      lastSeen: new Date()
    }
  });

  // Notify admin dashboard
  io.to('role:ADMIN').emit(SOCKET_EVENTS.PROVIDER_STATUS_CHANGE, {
    providerId,
    status,
    timestamp: new Date().toISOString()
  });

  logger.info(`Provider ${providerId} status changed to ${status}`);
}

/**
 * Handle socket disconnection
 * @param {Object} socket - Socket instance
 * @param {string} reason - Disconnection reason
 */
function handleDisconnection(socket, reason) {
  const userId = socket.userId;
  const provider = socket.provider;

  logger.info(`User disconnected: ${userId} (${reason})`);

  // Remove from connected users
  connectedUsers.delete(userId);
  
  if (provider) {
    connectedProviders.delete(provider.id);
    
    // Update last seen time
    prisma.provider.update({
      where: { id: provider.id },
      data: { lastSeen: new Date() }
    }).catch(error => {
      logger.error('Error updating provider last seen:', error);
    });
  }
}

/**
 * Send notification to specific user
 * @param {string} userId - Target user ID
 * @param {Object} notification - Notification data
 */
function sendNotificationToUser(userId, notification) {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(SOCKET_EVENTS.PUSH_NOTIFICATION, notification);
    return true;
  }
  return false;
}

/**
 * Send notification to provider
 * @param {string} providerId - Target provider ID
 * @param {Object} notification - Notification data
 */
function sendNotificationToProvider(providerId, notification) {
  const socketId = connectedProviders.get(providerId);
  if (socketId) {
    io.to(socketId).emit(SOCKET_EVENTS.PUSH_NOTIFICATION, notification);
    return true;
  }
  return false;
}

/**
 * Broadcast system alert
 * @param {Object} alert - Alert data
 * @param {string} targetRole - Target user role (optional)
 */
function broadcastSystemAlert(alert, targetRole = null) {
  const room = targetRole ? `role:${targetRole}` : 'connected';
  io.to(room).emit(SOCKET_EVENTS.SYSTEM_ALERT, alert);
}

/**
 * Get connected users count
 * @returns {Object} Connection statistics
 */
function getConnectionStats() {
  return {
    totalConnections: connectedUsers.size,
    connectedProviders: connectedProviders.size,
    connectedCitizens: connectedUsers.size - connectedProviders.size,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  initializeSocket,
  sendNotificationToUser,
  sendNotificationToProvider,
  broadcastSystemAlert,
  getConnectionStats,
  getIO: () => io
};