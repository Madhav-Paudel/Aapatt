const socketService = {
  // Store active connections
  connections: new Map(),

  // Handle new socket connection
  handleConnection: (socket, prisma) => {
    console.log('New socket connection:', socket.id);

    // Handle user authentication
    socket.on('authenticate', async (data) => {
      try {
        const { userId, role } = data;

        // Store user connection
        socketService.connections.set(socket.id, {
          userId,
          role,
          connectedAt: new Date()
        });

        // Join role-specific room
        socket.join(`role_${role}`);

        // Join user-specific room
        socket.join(`user_${userId}`);

        socket.emit('authenticated', { success: true });
        console.log(`User ${userId} authenticated as ${role}`);

      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authentication_error', { message: 'Authentication failed' });
      }
    });

    // Handle location updates from providers
    socket.on('location_update', async (data) => {
      try {
        const { userId, location, heading, speed } = data;
        const connection = socketService.connections.get(socket.id);

        if (!connection || connection.role !== 'PROVIDER') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Update provider location in database
        await prisma.providerLocation.create({
          data: {
            providerId: userId,
            location: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            },
            heading,
            speed,
            timestamp: new Date()
          }
        });

        // Broadcast location update to relevant users
        socket.to(`user_${userId}`).emit('provider_location_update', {
          location,
          heading,
          speed,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle emergency request creation
    socket.on('emergency_request', async (data) => {
      try {
        const { requestId, userId } = data;

        // Notify all available providers
        socket.to('role_PROVIDER').emit('new_emergency_request', {
          requestId,
          userId,
          timestamp: new Date()
        });

        console.log(`Emergency request ${requestId} broadcasted to providers`);

      } catch (error) {
        console.error('Emergency request broadcast error:', error);
        socket.emit('error', { message: 'Failed to broadcast emergency request' });
      }
    });

    // Handle request acceptance by provider
    socket.on('accept_request', async (data) => {
      try {
        const { requestId, providerId, userId } = data;

        // Update request status in database
        await prisma.emergencyRequest.update({
          where: { id: requestId },
          data: {
            providerId,
            status: 'ACCEPTED'
          }
        });

        // Create request update
        await prisma.requestUpdate.create({
          data: {
            requestId,
            status: 'ACCEPTED',
            message: 'Provider has accepted your request'
          }
        });

        // Notify citizen
        socket.to(`user_${userId}`).emit('request_accepted', {
          requestId,
          providerId,
          timestamp: new Date()
        });

        // Notify other providers that request is taken
        socket.to('role_PROVIDER').emit('request_taken', {
          requestId,
          providerId
        });

        console.log(`Request ${requestId} accepted by provider ${providerId}`);

      } catch (error) {
        console.error('Accept request error:', error);
        socket.emit('error', { message: 'Failed to accept request' });
      }
    });

    // Handle provider status updates (en route, arrived, completed)
    socket.on('status_update', async (data) => {
      try {
        const { requestId, status, message, location } = data;
        const connection = socketService.connections.get(socket.id);

        // Create request update
        await prisma.requestUpdate.create({
          data: {
            requestId,
            status,
            message,
            location: location ? {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            } : null
          }
        });

        // Update request status if it's a final status
        if (['ARRIVED', 'COMPLETED', 'CANCELLED'].includes(status)) {
          await prisma.emergencyRequest.update({
            where: { id: requestId },
            data: { status }
          });
        }

        // Get request details to notify the right user
        const request = await prisma.emergencyRequest.findUnique({
          where: { id: requestId },
          select: { userId: true }
        });

        if (request) {
          socket.to(`user_${request.userId}`).emit('status_update', {
            requestId,
            status,
            message,
            location,
            timestamp: new Date()
          });
        }

        console.log(`Status update for request ${requestId}: ${status}`);

      } catch (error) {
        console.error('Status update error:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle citizen location updates
    socket.on('citizen_location_update', async (data) => {
      try {
        const { userId, location } = data;

        // Store citizen location
        await prisma.userLocation.create({
          data: {
            userId,
            location: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            }
          }
        });

      } catch (error) {
        console.error('Citizen location update error:', error);
      }
    });
  },

  // Handle socket disconnection
  handleDisconnection: (socket) => {
    socketService.connections.delete(socket.id);
    console.log('Socket connection removed:', socket.id);
  },

  // Send notification to specific user
  sendToUser: (userId, event, data) => {
    // This would need access to io instance
    // For now, this is a placeholder for the pattern
    console.log(`Send to user ${userId}:`, event, data);
  },

  // Broadcast to all users with specific role
  broadcastToRole: (role, event, data) => {
    // This would need access to io instance
    console.log(`Broadcast to role ${role}:`, event, data);
  },

  // Get active connections for a user
  getUserConnections: (userId) => {
    const connections = [];
    for (const [socketId, connection] of socketService.connections.entries()) {
      if (connection.userId === userId) {
        connections.push({ socketId, ...connection });
      }
    }
    return connections;
  },

  // Get connection count by role
  getConnectionStats: () => {
    const stats = {};
    for (const connection of socketService.connections.values()) {
      stats[connection.role] = (stats[connection.role] || 0) + 1;
    }
    return stats;
  }
};

module.exports = socketService;