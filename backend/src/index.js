const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

console.log('🚀 Starting Aapatt Backend...');

// Import routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const providerRoutes = require('./routes/providers');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

console.log('✅ Routes imported successfully');

// Import services
const socketService = require('./services/socketService');
const databaseService = require('./services/databaseService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize socket service
socketService.init(io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Aapatt Emergency Response API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚨 Aapatt Emergency Response System',
    tagline: 'Saving lives through intelligent technology',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      requests: '/api/requests',
      providers: '/api/providers',
      ai: '/api/ai',
      admin: '/api/admin'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3000;

// Start server without database for testing
console.log('🔧 Starting server in development mode (without database)...');

server.listen(PORT, () => {
  console.log(`🚀 Aapatt Emergency API Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Socket.IO enabled for real-time features`);
  console.log(`🔥 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚠️  Database connection disabled for testing`);
});

// Initialize database connection (optional)
// databaseService.connect()
//   .then(() => {
//     console.log('✅ Database connected successfully');
//   })
//   .catch((error) => {
//     console.error('❌ Database connection failed:', error);
//   });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});