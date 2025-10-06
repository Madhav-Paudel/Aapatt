/**
 * Aapatt Emergency Superapp - Admin Routes
 */

const express = require('express');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { prisma } = require('../services/databaseService');
const { createApiResponse } = require('@aapatt/shared');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard',
  verifyToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [
      activeRequests,
      availableProviders,
      totalRequestsToday,
      completedRequests
    ] = await Promise.all([
      prisma.emergencyRequest.count({
        where: {
          status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'] }
        }
      }),
      prisma.provider.count({
        where: { status: 'ONLINE', isVerified: true }
      }),
      prisma.emergencyRequest.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.emergencyRequest.count({
        where: { status: 'COMPLETED' }
      })
    ]);

    const stats = {
      activeRequests,
      availableProviders,
      totalRequestsToday,
      completedRequests,
      timestamp: new Date().toISOString()
    };

    res.json(
      createApiResponse(true, { stats }, 'Dashboard stats retrieved successfully')
    );
  })
);

module.exports = router;