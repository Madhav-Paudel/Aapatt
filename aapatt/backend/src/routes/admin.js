const express = require('express');
const { param, query, body, validationResult } = require('express-validator');
const {
  getDashboardStats,
  getLiveMapData,
  getProviders,
  updateProviderStatus,
  getAnalytics,
  getSystemHealth,
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', [
  authenticateToken,
  requireAdmin,
  validateRequest
], getDashboardStats);

// @route   GET /api/admin/live-map
// @desc    Get live map data (requests and providers)
// @access  Private (Admin)
router.get('/live-map', [
  authenticateToken,
  requireAdmin,
  validateRequest
], getLiveMapData);

// @route   GET /api/admin/providers
// @desc    Get all providers with filtering
// @access  Private (Admin)
router.get('/providers', [
  authenticateToken,
  requireAdmin,
  query('status')
    .optional()
    .isIn(['online', 'offline', 'available'])
    .withMessage('Invalid status filter'),
  query('serviceType')
    .optional()
    .isIn(['AMBULANCE', 'FIRE_BRIGADE', 'AIR_AMBULANCE', 'POLICE', 'RESCUE'])
    .withMessage('Invalid service type filter'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
  validateRequest
], getProviders);

// @route   PUT /api/admin/providers/:providerId/status
// @desc    Update provider status
// @access  Private (Admin)
router.put('/providers/:providerId/status', [
  authenticateToken,
  requireAdmin,
  param('providerId')
    .isUUID()
    .withMessage('Valid provider ID required'),
  body('isOnline')
    .optional()
    .isBoolean()
    .withMessage('isOnline must be boolean'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be boolean'),
  validateRequest
], updateProviderStatus);

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin)
router.get('/analytics', [
  authenticateToken,
  requireAdmin,
  query('period')
    .optional()
    .isIn(['1d', '7d', '30d'])
    .withMessage('Period must be 1d, 7d, or 30d'),
  validateRequest
], getAnalytics);

// @route   GET /api/admin/health
// @desc    Get system health status
// @access  Private (Admin)
router.get('/health', [
  authenticateToken,
  requireAdmin,
  validateRequest
], getSystemHealth);

module.exports = router;