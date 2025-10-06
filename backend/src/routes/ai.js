const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, analyzeImageSchema } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');
const { analyzeInjury, getFirstAidGuidance, detectEmergency } = require('../services/aiService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const router = express.Router();

// Apply rate limiting
router.use(rateLimiter.generalLimiter);

// Analyze injury from image
router.post('/analyze-injury', 
  authenticateToken,
  validateRequest(analyzeImageSchema),
  async (req, res) => {
    try {
      const { image, requestId } = req.body;
      const userId = req.user.id;

      // Analyze the image
      const analysis = await analyzeInjury(image, requestId);

      // If requestId is provided, update the request with AI analysis
      if (requestId) {
        await prisma.emergencyRequest.update({
          where: { id: requestId },
          data: {
            aiAnalysis: analysis,
            injuryType: analysis.injuryType,
            severity: analysis.severity?.toUpperCase()
          }
        });
      }

      res.json({
        success: true,
        message: 'Image analysis completed.',
        data: { analysis }
      });
    } catch (error) {
      console.error('❌ Analyze injury error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: 'INTERNAL_ERROR'
      });
    }
  }
);

// Get first aid guidance for specific injury type
router.get('/first-aid/:injuryType', authenticateToken, async (req, res) => {
  try {
    const { injuryType } = req.params;

    const guidance = getFirstAidGuidance(injuryType);

    if (!guidance) {
      return res.status(404).json({
        success: false,
        message: 'Injury type not found.',
        error: 'INJURY_TYPE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        injuryType,
        guidance
      }
    });
  } catch (error) {
    console.error('❌ Get first aid guidance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Get all available injury types and their guidance
router.get('/injury-types', authenticateToken, async (req, res) => {
  try {
    const injuryTypes = Object.keys(require('../services/aiService').FIRST_AID_GUIDANCE);
    
    const guidanceList = injuryTypes.map(type => ({
      type,
      ...getFirstAidGuidance(type)
    }));

    res.json({
      success: true,
      data: {
        injuryTypes: guidanceList
      }
    });
  } catch (error) {
    console.error('❌ Get injury types error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Check if situation requires emergency call
router.post('/check-emergency', authenticateToken, async (req, res) => {
  try {
    const { injuryType, severity, symptoms } = req.body;

    const isEmergency = detectEmergency(injuryType, severity);

    // Additional emergency indicators based on symptoms
    const emergencySymptoms = [
      'unconscious', 'not breathing', 'severe bleeding', 'chest pain',
      'difficulty breathing', 'severe burn', 'head injury', 'seizure'
    ];

    const hasEmergencySymptoms = symptoms && symptoms.some(symptom => 
      emergencySymptoms.some(emergencySymptom => 
        symptom.toLowerCase().includes(emergencySymptom)
      )
    );

    const requiresEmergency = isEmergency || hasEmergencySymptoms;

    res.json({
      success: true,
      data: {
        requiresEmergency,
        reason: requiresEmergency ? 
          (isEmergency ? 'Injury type requires emergency care' : 'Symptoms indicate emergency') :
          'Situation can be handled with first aid',
        recommendation: requiresEmergency ? 
          'Call emergency services immediately' : 
          'Follow first aid guidance and monitor condition'
      }
    });
  } catch (error) {
    console.error('❌ Check emergency error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Get AI-powered emergency assessment
router.post('/emergency-assessment', authenticateToken, async (req, res) => {
  try {
    const { 
      image, 
      description, 
      symptoms, 
      location, 
      timeOfDay,
      requestId 
    } = req.body;

    let analysis = null;
    
    // Analyze image if provided
    if (image) {
      analysis = await analyzeInjury(image, requestId);
    }

    // Basic assessment based on description and symptoms
    const emergencyKeywords = [
      'unconscious', 'not breathing', 'severe bleeding', 'chest pain',
      'heart attack', 'stroke', 'severe burn', 'head injury', 'seizure',
      'overdose', 'poisoning', 'drowning', 'electrocution'
    ];

    const descriptionText = (description + ' ' + (symptoms || '')).toLowerCase();
    const hasEmergencyKeywords = emergencyKeywords.some(keyword => 
      descriptionText.includes(keyword)
    );

    const assessment = {
      severity: analysis?.severity || (hasEmergencyKeywords ? 'severe' : 'moderate'),
      requiresEmergency: analysis?.emergency || hasEmergencyKeywords,
      confidence: analysis?.confidence || 0.7,
      recommendations: [],
      firstAidSteps: analysis?.firstAidSteps || getFirstAidGuidance('cut').steps
    };

    // Add specific recommendations
    if (assessment.requiresEmergency) {
      assessment.recommendations.push('Call emergency services immediately');
      assessment.recommendations.push('Stay with the person until help arrives');
    } else {
      assessment.recommendations.push('Follow first aid guidance');
      assessment.recommendations.push('Monitor the person\'s condition');
    }

    if (location === 'remote' || location === 'rural') {
      assessment.recommendations.push('Consider air ambulance if available');
    }

    if (timeOfDay === 'night') {
      assessment.recommendations.push('Ensure good lighting for first aid');
    }

    res.json({
      success: true,
      data: {
        assessment,
        analysis: analysis || null
      }
    });
  } catch (error) {
    console.error('❌ Emergency assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;