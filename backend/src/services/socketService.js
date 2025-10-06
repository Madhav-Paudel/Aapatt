/**
 * Socket.IO Service
 * Handles real-time communication between clients
 */

const connectedUsers = new Map(); // userId -> socketId
const connectedProviders = new Map(); // providerId -> socketId

/**
 * Initialize Socket.IO event handlers
 * @param {Server} io - Socket.IO server instance
 */
export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // User authentication
    socket.on('authenticate', (data) => {
      const { userId, role, providerId } = data;
      
      if (role === 'PROVIDER' && providerId) {
        connectedProviders.set(providerId, socket.id);
        socket.providerId = providerId;
        socket.join(`provider:${providerId}`);
        console.log(`✅ Provider authenticated: ${providerId}`);
      }
      
      if (userId) {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user:${userId}`);
        console.log(`✅ User authenticated: ${userId}`);
      }
      
      socket.emit('authenticated', { success: true });
    });
    
    // Provider location update
    socket.on('provider:location_update', (data) => {
      const { providerId, latitude, longitude, requestId } = data;
      
      // Broadcast to the citizen who made the request
      if (requestId) {
        io.to(`request:${requestId}`).emit('provider_location_update', {
          providerId,
          latitude,
          longitude,
          timestamp: Date.now()
        });
      }
      
      // Broadcast to admin dashboard
      io.to('admin').emit('provider_location_update', {
        providerId,
        latitude,
        longitude,
        timestamp: Date.now()
      });
    });
    
    // Provider status change
    socket.on('provider:status_change', (data) => {
      const { providerId, status } = data;
      
      io.to('admin').emit('provider_status_change', {
        providerId,
        status,
        timestamp: Date.now()
      });
    });
    
    // Join request room (for real-time updates)
    socket.on('join_request', (requestId) => {
      socket.join(`request:${requestId}`);
      console.log(`User ${socket.id} joined request room: ${requestId}`);
    });
    
    // Leave request room
    socket.on('leave_request', (requestId) => {
      socket.leave(`request:${requestId}`);
      console.log(`User ${socket.id} left request room: ${requestId}`);
    });
    
    // Join admin room
    socket.on('join_admin', () => {
      socket.join('admin');
      console.log(`Admin ${socket.id} joined admin room`);
    });
    
    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      
      // Remove from connected users
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
      
      // Remove from connected providers
      if (socket.providerId) {
        connectedProviders.delete(socket.providerId);
      }
    });
  });
  
  return io;
};

/**
 * Emit new emergency request to nearby providers
 * @param {Server} io - Socket.IO instance
 * @param {Array} providerIds - Array of provider IDs
 * @param {Object} request - Emergency request data
 */
export const notifyProvidersOfNewRequest = (io, providerIds, request) => {
  providerIds.forEach(providerId => {
    io.to(`provider:${providerId}`).emit('new_request', request);
  });
  
  // Also notify admin dashboard
  io.to('admin').emit('new_request', request);
};

/**
 * Notify citizen of request status change
 * @param {Server} io - Socket.IO instance
 * @param {string} userId - Citizen user ID
 * @param {Object} update - Status update data
 */
export const notifyRequestUpdate = (io, userId, update) => {
  io.to(`user:${userId}`).emit('request_updated', update);
  io.to('admin').emit('request_updated', update);
};

/**
 * Broadcast request accepted event
 * @param {Server} io - Socket.IO instance
 * @param {string} requestId - Request ID
 * @param {Object} data - Acceptance data
 */
export const broadcastRequestAccepted = (io, requestId, data) => {
  io.to(`request:${requestId}`).emit('request_accepted', data);
  io.to('admin').emit('request_accepted', data);
};

/**
 * Broadcast ETA update
 * @param {Server} io - Socket.IO instance
 * @param {string} requestId - Request ID
 * @param {Object} etaData - ETA data
 */
export const broadcastETAUpdate = (io, requestId, etaData) => {
  io.to(`request:${requestId}`).emit('eta_update', etaData);
};

/**
 * Check if provider is online
 * @param {string} providerId - Provider ID
 * @returns {boolean}
 */
export const isProviderOnline = (providerId) => {
  return connectedProviders.has(providerId);
};

/**
 * Check if user is online
 * @param {string} userId - User ID
 * @returns {boolean}
 */
export const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

export default {
  initializeSocket,
  notifyProvidersOfNewRequest,
  notifyRequestUpdate,
  broadcastRequestAccepted,
  broadcastETAUpdate,
  isProviderOnline,
  isUserOnline
};
