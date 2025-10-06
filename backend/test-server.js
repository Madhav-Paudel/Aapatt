console.log('🚀 Starting Aapatt Backend Test...');

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Aapatt Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    data: 'Test endpoint successful'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Aapatt Emergency API Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔥 Environment: ${process.env.NODE_ENV || 'development'}`);
});

console.log('✅ Backend initialization complete');