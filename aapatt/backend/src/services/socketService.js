const { getPrisma } = require('./databaseService');

let io;

const initializeSocketIO = (socketIO) => {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Provider joins their service type room
    socket.on('join-provider-room', (serviceType) => {
      socket.join(`providers-${serviceType}`);
      console.log(`Provider joined ${serviceType} room`);
    });

    // Provider goes online/offline
    socket.on('provider-status', async (data) => {
      try {
        const { userId, isOnline, latitude, longitude } = data;
        const prisma = getPrisma();
        
        await prisma.providerProfile.update({
          where: { userId },
          data: {
            isOnline,
            currentLat: latitude,
            currentLng: longitude,
          },
        });

        // Broadcast to admin dashboard
        io.to('admin-dashboard').emit('provider-status-update', {
          userId,
          isOnline,
          latitude,
          longitude,
        });

        console.log(`Provider ${userId} status updated: ${isOnline ? 'online' : 'offline'}`);
      } catch (error) {
        console.error('Error updating provider status:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Provider location update
    socket.on('location-update', async (data) => {
      try {
        const { userId, latitude, longitude, accuracy } = data;
        const prisma = getPrisma();
        
        // Update provider location
        await prisma.providerProfile.update({
          where: { userId },
          data: {
            currentLat: latitude,
            currentLng: longitude,
          },
        });

        // Store location history
        await prisma.locationUpdate.create({
          data: {
            userId,
            latitude,
            longitude,
            accuracy,
          },
        });

        // Broadcast to admin dashboard
        io.to('admin-dashboard').emit('provider-location-update', {
          userId,
          latitude,
          longitude,
        });

      } catch (error) {
        console.error('Error updating location:', error);
      }
    });

    // Emergency request created
    socket.on('emergency-request', async (data) => {
      try {
        const { requestId, serviceType, latitude, longitude } = data;
        
        // Notify all providers of this service type
        io.to(`providers-${serviceType}`).emit('new-emergency-request', {
          requestId,
          ...data,
        });

        // Notify admin dashboard
        io.to('admin-dashboard').emit('new-emergency-request', {
          requestId,
          ...data,
        });

        console.log(`Emergency request ${requestId} broadcasted to ${serviceType} providers`);
      } catch (error) {
        console.error('Error broadcasting emergency request:', error);
      }
    });

    // Request status update
    socket.on('request-status-update', async (data) => {
      try {
        const { requestId, status, message, latitude, longitude } = data;
        const prisma = getPrisma();
        
        // Update request status
        await prisma.requestUpdate.create({
          data: {
            requestId,
            status,
            message,
            latitude,
            longitude,
          },
        });

        // Notify requester
        const request = await prisma.emergencyRequest.findUnique({
          where: { id: requestId },
          include: { requester: true },
        });

        if (request) {
          io.to(`user-${request.requestedBy}`).emit('request-update', {
            requestId,
            status,
            message,
            latitude,
            longitude,
          });
        }

        // Notify admin dashboard
        io.to('admin-dashboard').emit('request-status-update', {
          requestId,
          status,
          message,
        });

        console.log(`Request ${requestId} status updated to ${status}`);
      } catch (error) {
        console.error('Error updating request status:', error);
      }
    });

    // Admin joins dashboard room
    socket.on('join-admin-dashboard', () => {
      socket.join('admin-dashboard');
      console.log('Admin joined dashboard room');
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

const broadcastToProviders = (serviceType, event, data) => {
  if (io) {
    io.to(`providers-${serviceType}`).emit(event, data);
  }
};

const broadcastToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

const broadcastToAdmin = (event, data) => {
  if (io) {
    io.to('admin-dashboard').emit(event, data);
  }
};

module.exports = {
  initializeSocketIO,
  getIO,
  broadcastToProviders,
  broadcastToUser,
  broadcastToAdmin
};