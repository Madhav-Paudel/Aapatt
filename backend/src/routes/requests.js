const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, createRequestSchema, updateRequestStatusSchema } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');
const {
  createEmergencyRequest,
  getUserRequests,
  getEmergencyRequest,
  cancelEmergencyRequest,
  updateRequestStatus
} = require('../controllers/requestController');

const router = express.Router();

// Apply rate limiting
router.use(rateLimiter.generalLimiter);

// Create emergency request (citizens only)
router.post('/', 
  authenticateToken,
  rateLimiter.emergencyLimiter,
  validateRequest(createRequestSchema),
  createEmergencyRequest
);

// Get user's emergency requests
router.get('/', authenticateToken, getUserRequests);

// Get specific emergency request
router.get('/:requestId', authenticateToken, getEmergencyRequest);

// Cancel emergency request (citizens only)
router.put('/:requestId/cancel', authenticateToken, cancelEmergencyRequest);

// Update request status (providers only)
router.put('/:requestId/status', 
  authenticateToken,
  validateRequest(updateRequestStatusSchema),
  updateRequestStatus
);

module.exports = router;