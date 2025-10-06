class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.connectedProviders = new Map(); // providerId -> socketId
  }

  init(io) {
    this.io = io;
    this.setupSocketHandlers();
    console.log('🔌 Socket.IO service initialized');
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`📱 Client connected: ${socket.id}`);

      // User authentication
      socket.on('authenticate', (data) => {
        const { userId, userType, token } = data;
        
        // Verify token here
        socket.userId = userId;
        socket.userType = userType;
        
        if (userType === 'citizen') {
          this.connectedUsers.set(userId, socket.id);
          socket.join('citizens');
        } else if (userType === 'provider') {
          this.connectedProviders.set(userId, socket.id);
          socket.join('providers');
        } else if (userType === 'admin') {
          socket.join('admins');
        }

        console.log(`✅ ${userType} authenticated: ${userId}`);
        socket.emit('authenticated', { success: true });
      });

      // Emergency request events
      socket.on('emergency_request_created', (data) => {
        // Notify nearby providers
        socket.to('providers').emit('new_emergency_request', data);
        
        // Notify admins
        socket.to('admins').emit('new_emergency_request', data);
        
        console.log(`🚨 Emergency request broadcasted: ${data.requestId}`);
      });

      // Provider location updates
      socket.on('provider_location_update', (data) => {
        const { providerId, latitude, longitude, requestId } = data;
        
        // Update location in database
        // Broadcast to citizen if there's an active request
        if (requestId) {
          this.notifyCitizen(requestId, 'provider_location_update', {
            latitude,
            longitude,
            providerId
          });
        }

        // Notify admins
        socket.to('admins').emit('provider_location_update', data);
      });

      // Request status updates
      socket.on('request_status_update', (data) => {
        const { requestId, status, providerId, citizenId } = data;
        
        // Notify citizen
        if (citizenId) {
          this.notifyCitizen(citizenId, 'request_status_update', data);
        }
        
        // Notify provider
        if (providerId) {
          this.notifyProvider(providerId, 'request_status_update', data);
        }
        
        // Notify admins
        socket.to('admins').emit('request_status_update', data);
        
        console.log(`📊 Status update: ${requestId} -> ${status}`);
      });

      // Provider accepts/declines request
      socket.on('provider_response', (data) => {
        const { requestId, response, providerId, citizenId, eta } = data;
        
        // Notify citizen
        this.notifyCitizen(citizenId, 'provider_response', {
          requestId,
          response,
          providerId,
          eta
        });
        
        // Notify other providers to stop showing this request
        if (response === 'accepted') {
          socket.to('providers').emit('request_taken', { requestId });
        }
        
        // Notify admins
        socket.to('admins').emit('provider_response', data);
        
        console.log(`✅ Provider ${response} request: ${requestId}`);
      });

      // AI first aid events
      socket.on('ai_analysis_request', (data) => {
        // This will be handled by the AI service
        console.log(`🤖 AI analysis requested: ${data.requestId}`);
      });

      // Admin manual assignment
      socket.on('admin_assign_provider', (data) => {
        const { requestId, providerId, citizenId } = data;
        
        // Notify specific provider
        this.notifyProvider(providerId, 'manual_assignment', {
          requestId,
          message: 'You have been manually assigned to this emergency'
        });
        
        // Notify citizen
        this.notifyCitizen(citizenId, 'provider_assigned', {
          requestId,
          providerId
        });
        
        console.log(`👨‍💼 Manual assignment: ${providerId} -> ${requestId}`);
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        console.log(`📱 Client disconnected: ${socket.id}`);
        
        // Remove from tracking maps
        if (socket.userType === 'citizen' && socket.userId) {
          this.connectedUsers.delete(socket.userId);
        } else if (socket.userType === 'provider' && socket.userId) {
          this.connectedProviders.delete(socket.userId);
        }
      });
    });
  }

  // Utility methods
  notifyCitizen(citizenId, event, data) {
    const socketId = this.connectedUsers.get(citizenId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  notifyProvider(providerId, event, data) {
    const socketId = this.connectedProviders.get(providerId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  broadcastToProviders(event, data) {
    this.io.to('providers').emit(event, data);
  }

  broadcastToAdmins(event, data) {
    this.io.to('admins').emit(event, data);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  // Emergency broadcast (high priority)
  emergencyBroadcast(data) {
    this.io.emit('emergency_broadcast', {
      ...data,
      priority: 'HIGH',
      timestamp: new Date().toISOString()
    });
    console.log(`🚨 EMERGENCY BROADCAST: ${data.message}`);
  }

  getConnectedStats() {
    return {
      totalConnected: this.io.sockets.sockets.size,
      citizens: this.connectedUsers.size,
      providers: this.connectedProviders.size,
      admins: this.io.sockets.adapter.rooms.get('admins')?.size || 0
    };
  }
}

const socketService = new SocketService();
module.exports = socketService;