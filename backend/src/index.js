/**
 * Aapatt Backend API Server
 * Main entry point for the Express application
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import providerRoutes from './routes/providers.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

// Import services
import { initializeFirebase } from './services/firebaseService.js';
import { initializeSocket } from './services/socketService.js';
import { connectDatabase } from './services/databaseService.js';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST']
  }
});

// Global middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Aapatt Emergency API',
    version: '1.0.0',
    description: 'Backend API for Aapatt Emergency Response System',
    tagline: 'Saving lives through intelligent technology',
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize services
const startServer = async () => {
  try {
    console.log('🚀 Starting Aapatt Backend Server...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected');
    
    // Initialize Firebase
    initializeFirebase();
    console.log('✅ Firebase initialized');
    
    // Initialize Socket.IO
    initializeSocket(io);
    console.log('✅ Socket.IO initialized');
    
    // Start server
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Socket.IO ready for real-time connections`);
      console.log(`🚨 Aapatt API is ready to save lives!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, io };
