/**
 * Aapatt Emergency Superapp - Providers Routes
 */

const express = require('express');
const { verifyToken, requireProvider } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { prisma, geoUtils } = require('../services/databaseService');
const { createApiResponse } = require('@aapatt/shared');

const router = express.Router();

// Get nearby providers
router.get('/nearby',
  asyncHandler(async (req, res) => {
    const { latitude, longitude, radius = 10, type } = req.query;
    
    const providers = await geoUtils.findNearbyProviders(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius),
      type
    );

    res.json(
      createApiResponse(true, { providers }, 'Nearby providers retrieved successfully')
    );
  })
);

// Update provider status
router.patch('/status',
  verifyToken,
  requireProvider,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    const provider = await prisma.provider.update({
      where: { id: req.provider.id },
      data: { status, lastSeen: new Date() }
    });

    res.json(
      createApiResponse(true, { provider }, 'Status updated successfully')
    );
  })
);

// Update provider location
router.post('/location',
  verifyToken,
  requireProvider,
  asyncHandler(async (req, res) => {
    const { latitude, longitude, requestId } = req.body;
    
    await prisma.provider.update({
      where: { id: req.provider.id },
      data: { latitude, longitude, lastSeen: new Date() }
    });

    if (requestId) {
      await prisma.locationUpdate.create({
        data: {
          providerId: req.provider.id,
          requestId,
          latitude,
          longitude,
          timestamp: new Date()
        }
      });
    }

    res.json(
      createApiResponse(true, null, 'Location updated successfully')
    );
  })
);

module.exports = router;