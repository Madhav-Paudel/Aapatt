const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  createEmergencyRequest,
  getMyRequests,
  getRequestDetails,
  updateRequestStatus,
  cancelRequest,
} = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');

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

// @route   POST /api/requests
// @desc    Create emergency request
// @access  Private
router.post('/', [
  authenticateToken,
  body('requestType')
    .isIn(['AMBULANCE', 'FIRE_BRIGADE', 'AIR_AMBULANCE', 'POLICE', 'RESCUE'])
    .withMessage('Valid request type required'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude required'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude required'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description too long'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address too long'),
  validateRequest
], createEmergencyRequest);

// @route   GET /api/requests
// @desc    Get user's emergency requests
// @access  Private
router.get('/', [
  authenticateToken,
  query('status')
    .optional()
    .isIn(['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'EXPIRED'])
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
], getMyRequests);

// @route   GET /api/requests/:requestId
// @desc    Get request details
// @access  Private
router.get('/:requestId', [
  authenticateToken,
  param('requestId')
    .isUUID()
    .withMessage('Valid request ID required'),
  validateRequest
], getRequestDetails);

// @route   PUT /api/requests/:requestId/status
// @desc    Update request status
// @access  Private
router.put('/:requestId/status', [
  authenticateToken,
  param('requestId')
    .isUUID()
    .withMessage('Valid request ID required'),
  body('status')
    .isIn(['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'EXPIRED'])
    .withMessage('Valid status required'),
  body('message')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Message too long'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude required'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude required'),
  validateRequest
], updateRequestStatus);

// @route   POST /api/requests/:requestId/cancel
// @desc    Cancel emergency request
// @access  Private
router.post('/:requestId/cancel', [
  authenticateToken,
  param('requestId')
    .isUUID()
    .withMessage('Valid request ID required'),
  validateRequest
], cancelRequest);

module.exports = router;