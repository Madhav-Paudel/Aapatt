const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/ai/analyze-injury - Analyze injury from image
router.post('/analyze-injury', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    const analysis = await aiService.analyzeInjury(image);

    res.json({
      success: true,
      message: 'Injury analysis completed',
      data: analysis
    });

  } catch (error) {
    console.error('Error in injury analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze injury',
      error: error.message
    });
  }
});

// GET /api/ai/first-aid/:injuryType - Get first aid instructions
router.get('/first-aid/:injuryType', async (req, res) => {
  try {
    const { injuryType } = req.params;

    if (!injuryType) {
      return res.status(400).json({
        success: false,
        message: 'Injury type is required'
      });
    }

    const instructions = aiService.getFirstAidInstructions(injuryType);

    res.json({
      success: true,
      message: 'First aid instructions retrieved',
      data: instructions
    });

  } catch (error) {
    console.error('Error getting first aid instructions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get first aid instructions',
      error: error.message
    });
  }
});

// POST /api/ai/emergency-assessment - AI-powered emergency assessment
router.post('/emergency-assessment', async (req, res) => {
  try {
    const { symptoms, severity, vitals, emergencyType } = req.body;

    const assessment = aiService.assessEmergency({
      symptoms,
      severity,
      vitals,
      emergencyType
    });

    res.json({
      success: true,
      message: 'Emergency assessment completed',
      data: assessment
    });

  } catch (error) {
    console.error('Error in emergency assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assess emergency',
      error: error.message
    });
  }
});

module.exports = router;