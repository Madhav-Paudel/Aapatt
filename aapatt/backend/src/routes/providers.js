const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  updateProviderProfile,
  updateProviderStatus,
  getAvailableRequests,
  acceptRequest,
  getMyAcceptedRequests,
  updateRequestLocation,
} = require('../controllers/providerController');
const { authenticateToken, requireProvider } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// @route   PUT /api/providers/profile
// @desc    Update provider profile
// @access  Private (Provider)
router.put('/profile', [
  authenticateToken,
  requireProvider,
  body('serviceType')
    .optional()
    .isIn(['AMBULANCE', 'FIRE_BRIGADE', 'AIR_AMBULANCE', 'POLICE', 'RESCUE'])
    .withMessage('Valid service type required'),
  body('licenseNumber')
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage('License number must be 5-50 characters'),
  body('vehicleInfo')
    .optional()
    .isObject()
    .withMessage('Vehicle info must be an object'),
  validateRequest
], updateProviderProfile);

// @route   PUT /api/providers/status
// @desc    Update provider online/available status
// @access  Private (Provider)
router.put('/status', [
  authenticateToken,
  requireProvider,
  body('isOnline')
    .optional()
    .isBoolean()
    .withMessage('isOnline must be boolean'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be boolean'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude required'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude required'),
  validateRequest
], updateProviderStatus);

// @route   GET /api/providers/requests
// @desc    Get available emergency requests for provider
// @access  Private (Provider)
router.get('/requests', [
  authenticateToken,
  requireProvider,
  validateRequest
], getAvailableRequests);

// @route   POST /api/providers/requests/:requestId/accept
// @desc    Accept an emergency request
// @access  Private (Provider)
router.post('/requests/:requestId/accept', [
  authenticateToken,
  requireProvider,
  param('requestId')
    .isUUID()
    .withMessage('Valid request ID required'),
  validateRequest
], acceptRequest);

// @route   GET /api/providers/my-requests
// @desc    Get provider's accepted requests
// @access  Private (Provider)
router.get('/my-requests', [
  authenticateToken,
  requireProvider,
  query('status')
    .optional()
    .isIn(['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status filter'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
  validateRequest
], getMyAcceptedRequests);

// @route   PUT /api/providers/requests/:requestId/location
// @desc    Update location for accepted request
// @access  Private (Provider)
router.put('/requests/:requestId/location', [
  authenticateToken,
  requireProvider,
  param('requestId')
    .isUUID()
    .withMessage('Valid request ID required'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude required'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude required'),
  body('status')
    .optional()
    .isIn(['EN_ROUTE', 'ARRIVED', 'COMPLETED'])
    .withMessage('Valid status required'),
  body('message')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Message too long'),
  validateRequest
], updateRequestLocation);

module.exports = router;