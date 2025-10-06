/**
 * Aapatt Emergency Superapp - Emergency Requests Routes
 * Routes for creating, managing, and tracking emergency requests
 */

const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateEmergencyRequest, validateStatusUpdate, handleValidationErrors } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { prisma, geoUtils } = require('../services/databaseService');
const { getIO } = require('../services/socketService');
const { createApiResponse } = require('@aapatt/shared');

const router = express.Router();

// Create emergency request
router.post('/',
  verifyToken,
  validateEmergencyRequest(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { type, description, location, priority = 1, hasSecurityAlert = false } = req.body;
    
    const request = await prisma.emergencyRequest.create({
      data: {
        citizenId: req.userId,
        type,
        description,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        landmark: location.landmark,
        priority,
        status: 'PENDING'
      },
      include: {
        citizen: true
      }
    });

    // Notify nearby providers via Socket.IO
    const io = getIO();
    io.emit('new_emergency', { requestId: request.id });

    res.status(201).json(
      createApiResponse(true, { request }, 'Emergency request created successfully')
    );
  })
);

// Get user's requests
router.get('/my-requests',
  verifyToken,
  asyncHandler(async (req, res) => {
    const requests = await prisma.emergencyRequest.findMany({
      where: { citizenId: req.userId },
      include: {
        provider: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(
      createApiResponse(true, { requests }, 'Requests retrieved successfully')
    );
  })
);

// Get request by ID
router.get('/:id',
  verifyToken,
  asyncHandler(async (req, res) => {
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: req.params.id },
      include: {
        citizen: true,
        provider: {
          include: { user: true }
        },
        statusUpdates: true,
        locationUpdates: true
      }
    });

    if (!request) {
      return res.status(404).json(
        createApiResponse(false, null, 'Request not found', 404)
      );
    }

    res.json(
      createApiResponse(true, { request }, 'Request retrieved successfully')
    );
  })
);

// Update request status
router.patch('/:id/status',
  verifyToken,
  validateStatusUpdate(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { status, notes, eta } = req.body;
    
    const request = await prisma.emergencyRequest.update({
      where: { id: req.params.id },
      data: {
        status,
        eta,
        ...(status === 'ARRIVED' && { arrivedAt: new Date() }),
        ...(status === 'COMPLETED' && { completedAt: new Date() })
      }
    });

    // Create status update record
    await prisma.statusUpdate.create({
      data: {
        requestId: req.params.id,
        status,
        notes,
        updatedBy: req.userId
      }
    });

    res.json(
      createApiResponse(true, { request }, 'Status updated successfully')
    );
  })
);

module.exports = router;