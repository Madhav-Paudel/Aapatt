const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let io = null;

const initializeSocketIO = (socketIO) => {
  io = socketIO;
  
  io.on('connection', async (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Authenticate socket connection
    socket.on('authenticate', async (data) => {
      try {
        const { token } = data;
        if (!token) {
          socket.emit('auth_error', { message: 'Token required' });
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { providerProfile: true }
        });

        if (!user || !user.isActive) {
          socket.emit('auth_error', { message: 'Invalid user' });
          return;
        }

        socket.userId = user.id;
        socket.userType = user.userType;
        socket.join(`user_${user.id}`);
        
        if (user.userType === 'PROVIDER') {
          socket.join(`providers_${user.providerProfile?.serviceType}`);
        }

        socket.emit('authenticated', { 
          userId: user.id, 
          userType: user.userType 
        });

        console.log(`✅ User authenticated: ${user.id} (${user.userType})`);
      } catch (error) {
        console.error('❌ Socket authentication failed:', error.message);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Handle location updates from providers
    socket.on('location_update', async (data) => {
      try {
        if (socket.userType !== 'PROVIDER') {
          socket.emit('error', { message: 'Only providers can send location updates' });
          return;
        }

        const { latitude, longitude, requestId, accuracy, speed, heading } = data;
        
        // Update provider location in database
        await prisma.providerProfile.update({
          where: { userId: socket.userId },
          data: {
            currentLatitude: latitude,
            currentLongitude: longitude,
            lastLocationUpdate: new Date()
          }
        });

        // Store location update for request tracking
        if (requestId) {
          await prisma.locationUpdate.create({
            data: {
              requestId,
              latitude,
              longitude,
              accuracy,
              speed,
              heading
            }
          });

          // Notify citizen about location update
          const request = await prisma.emergencyRequest.findUnique({
            where: { id: requestId },
            include: { citizen: true }
          });

          if (request) {
            socket.to(`user_${request.citizenId}`).emit('provider_location_update', {
              requestId,
              latitude,
              longitude,
              timestamp: new Date().toISOString()
            });
          }
        }

        console.log(`📍 Location updated for provider ${socket.userId}`);
      } catch (error) {
        console.error('❌ Location update failed:', error.message);
        socket.emit('error', { message: 'Location update failed' });
      }
    });

    // Handle provider status updates
    socket.on('provider_status_update', async (data) => {
      try {
        if (socket.userType !== 'PROVIDER') {
          socket.emit('error', { message: 'Only providers can update status' });
          return;
        }

        const { isOnline, serviceType } = data;
        
        await prisma.providerProfile.update({
          where: { userId: socket.userId },
          data: { isOnline }
        });

        // Broadcast status to admin dashboard
        io.to('admin_dashboard').emit('provider_status_changed', {
          providerId: socket.userId,
          isOnline,
          serviceType,
          timestamp: new Date().toISOString()
        });

        console.log(`🔄 Provider ${socket.userId} status updated: ${isOnline ? 'online' : 'offline'}`);
      } catch (error) {
        console.error('❌ Provider status update failed:', error.message);
        socket.emit('error', { message: 'Status update failed' });
      }
    });

    // Handle admin dashboard connection
    socket.on('join_admin_dashboard', () => {
      if (socket.userType === 'ADMIN') {
        socket.join('admin_dashboard');
        console.log('👨‍💼 Admin joined dashboard');
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
      
      // Mark provider as offline if they disconnect
      if (socket.userType === 'PROVIDER' && socket.userId) {
        prisma.providerProfile.update({
          where: { userId: socket.userId },
          data: { isOnline: false }
        }).catch(console.error);
      }
    });
  });

  console.log('🔌 Socket.IO service initialized');
};

// Helper functions for emitting events
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToProviders = (serviceType, event, data) => {
  if (io) {
    io.to(`providers_${serviceType}`).emit(event, data);
  }
};

const emitToAdmin = (event, data) => {
  if (io) {
    io.to('admin_dashboard').emit(event, data);
  }
};

const emitEmergencyRequest = (serviceType, requestData) => {
  if (io) {
    io.to(`providers_${serviceType}`).emit('new_emergency_request', requestData);
  }
};

const emitRequestStatusUpdate = (requestId, status, data) => {
  if (io) {
    io.emit('request_status_update', {
      requestId,
      status,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  initializeSocketIO,
  emitToUser,
  emitToProviders,
  emitToAdmin,
  emitEmergencyRequest,
  emitRequestStatusUpdate
};