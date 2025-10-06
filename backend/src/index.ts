import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authRouter } from './routes/auth';
import { requestRouter } from './routes/requests';
import { providerRouter } from './routes/providers';
import { aiRouter } from './routes/ai';
import { notificationRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';
import { initializeSocket } from './services/socketService';
import { initializeFirebase } from './services/firebaseService';
import { connectDatabase } from './services/databaseService';
import { startCronJobs } from './services/cronService';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

if (NODE_ENV === 'production') {
  app.use(rateLimiter); // Rate limiting in production
}

if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
  app.use(morgan('combined')); // HTTP request logging
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/requests', requestRouter);
app.use('/api/providers', providerRouter);
app.use('/api/ai', aiRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected');

    // Initialize Firebase
    await initializeFirebase();
    console.log('✅ Firebase initialized');

    // Initialize Socket.IO handlers
    initializeSocket(io);
    console.log('✅ Socket.IO initialized');

    // Start cron jobs
    startCronJobs();
    console.log('✅ Cron jobs started');

  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    httpServer.listen(PORT, () => {
      console.log(`
🚀 Aapatt Backend Server Running!
📍 Environment: ${NODE_ENV}
🌐 Port: ${PORT}
📝 Health Check: http://localhost:${PORT}/health
🔌 Socket.IO: Ready for real-time connections
      `);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, io };