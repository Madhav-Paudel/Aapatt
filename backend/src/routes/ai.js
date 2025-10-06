/**
 * Aapatt Emergency Superapp - AI Routes
 */

const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { validateImageAnalysis, handleValidationErrors } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { analyzeInjury, getFirstAidGuidance, detectEmergencyFromText } = require('../services/aiService');
const { createApiResponse } = require('@aapatt/shared');

const router = express.Router();

// Analyze injury from image
router.post('/analyze-injury',
  verifyToken,
  validateImageAnalysis(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { image, imageType = 'jpg' } = req.body;
    
    const analysis = await analyzeInjury(image, imageType);

    res.json(
      createApiResponse(true, { analysis }, 'Injury analysis completed')
    );
  })
);

// Get first aid guidance
router.get('/first-aid/:category',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { category } = req.params;
    
    const guide = await getFirstAidGuidance(category);

    res.json(
      createApiResponse(true, { guide }, 'First aid guide retrieved successfully')
    );
  })
);

// Detect emergency from text
router.post('/emergency-detection',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { description } = req.body;
    
    const detection = await detectEmergencyFromText(description);

    res.json(
      createApiResponse(true, { detection }, 'Emergency detection completed')
    );
  })
);

module.exports = router;