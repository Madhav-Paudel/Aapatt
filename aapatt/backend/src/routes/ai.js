const express = require('express');
const { body, query, validationResult } = require('express-validator');
const {
  analyzeInjury,
  getFirstAidGuidance,
  getEmergencyContacts,
} = require('../controllers/aiController');
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

// @route   POST /api/ai/analyze-injury
// @desc    Analyze injury from image using AI
// @access  Private
router.post('/analyze-injury', [
  authenticateToken,
  body('imageBase64')
    .notEmpty()
    .withMessage('Image data required'),
  validateRequest
], analyzeInjury);

// @route   GET /api/ai/first-aid-guidance
// @desc    Get first aid guidance for specific injury
// @access  Private
router.get('/first-aid-guidance', [
  authenticateToken,
  query('injuryType')
    .isIn(['cut', 'burn', 'fall', 'choking', 'heart_attack', 'stroke'])
    .withMessage('Valid injury type required'),
  query('severity')
    .isIn(['minor', 'major'])
    .withMessage('Valid severity level required'),
  validateRequest
], getFirstAidGuidance);

// @route   GET /api/ai/emergency-contacts
// @desc    Get emergency contacts for location
// @access  Private
router.get('/emergency-contacts', [
  authenticateToken,
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude required'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude required'),
  validateRequest
], getEmergencyContacts);

module.exports = router;