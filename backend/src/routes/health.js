/**
 * Aapatt Emergency Superapp - Health Check Routes
 */

const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { checkDatabaseHealth } = require('../services/databaseService');
const { getAIServiceHealth } = require('../services/aiService');
const { createApiResponse } = require('@aapatt/shared');

const router = express.Router();

// Basic health check
router.get('/',
  asyncHandler(async (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Aapatt Emergency API',
      version: '1.0.0'
    });
  })
);

// Detailed health check
router.get('/detailed',
  asyncHandler(async (req, res) => {
    const [dbHealth, aiHealth] = await Promise.all([
      checkDatabaseHealth(),
      getAIServiceHealth()
    ]);

    const overallStatus = dbHealth.status === 'healthy' && aiHealth.status === 'healthy' 
      ? 'healthy' 
      : 'degraded';

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        ai: aiHealth
      }
    });
  })
);

module.exports = router;