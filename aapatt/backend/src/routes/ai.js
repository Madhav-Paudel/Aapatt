const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');

// Import database service
const { getPrismaClient } = require('../services/databaseService');

const router = express.Router();
const prisma = getPrismaClient();

// Hugging Face API configuration
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;
const HUGGING_FACE_MODEL_URL = process.env.HUGGING_FACE_MODEL_URL ||
  'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';

// First-aid knowledge base
const FIRST_AID_GUIDE = {
  'burn': {
    title: 'Burn Injury',
    severity: 'moderate',
    steps: [
      'Cool the burn immediately with cool (not cold) running water for at least 20 minutes',
      'Remove clothing or jewelry near the burn if not stuck to the skin',
      'Cover the burn with a clean, non-stick bandage or cloth',
      'Do not apply ointments, butter, or ice to the burn',
      'Elevate the burned area if possible',
      'Take pain medication if needed (ibuprofen or acetaminophen)',
      'Seek medical attention for burns larger than palm size or on face/hands'
    ],
    emergency: true,
    call911: true
  },
  'cut': {
    title: 'Cut or Laceration',
    severity: 'low',
    steps: [
      'Apply pressure with a clean cloth or bandage to stop bleeding',
      'Elevate the injured area above heart level if possible',
      'Clean the wound gently with soap and water',
      'Apply antibiotic ointment if available',
      'Cover with a sterile bandage',
      'Watch for signs of infection (redness, swelling, pus)',
      'Seek medical attention if bleeding doesn\'t stop or wound is deep'
    ],
    emergency: false,
    call911: false
  },
  'fracture': {
    title: 'Possible Fracture',
    severity: 'high',
    steps: [
      'Keep the injured person still and calm',
      'Do not try to straighten or move the injured limb',
      'Apply ice wrapped in cloth for 15-20 minutes',
      'Support the injured area with splints if trained to do so',
      'Monitor for shock symptoms (pale skin, rapid heartbeat)',
      'Seek immediate medical attention',
      'Call emergency services'
    ],
    emergency: true,
    call911: true
  },
  'concussion': {
    title: 'Head Injury/Concussion',
    severity: 'high',
    steps: [
      'Have the person rest in a quiet, dark room',
      'Apply ice pack wrapped in cloth to reduce swelling',
      'Monitor for worsening symptoms (vomiting, confusion, seizures)',
      'Do not give food, drink, or medication without medical advice',
      'Wake the person every 2-3 hours if they fall asleep',
      'Seek immediate medical attention',
      'Call emergency services'
    ],
    emergency: true,
    call911: true
  },
  'choking': {
    title: 'Choking',
    severity: 'critical',
    steps: [
      'Ask "Are you choking?" If they can speak or cough, encourage coughing',
      'If they cannot speak or breathe, perform abdominal thrusts (Heimlich)',
      'For pregnant women or obese, use chest thrusts instead',
      'Continue until object is dislodged or person becomes unconscious',
      'If unconscious, start CPR and call emergency services',
      'Call 911 immediately'
    ],
    emergency: true,
    call911: true
  },
  'heart_attack': {
    title: 'Heart Attack',
    severity: 'critical',
    steps: [
      'Call emergency services immediately',
      'Help the person into a comfortable position (usually sitting)',
      'If they have aspirin and no allergies, give them one adult aspirin to chew',
      'Loosen tight clothing',
      'Stay with the person and monitor breathing',
      'If unconscious and no breathing, start CPR',
      'Do not give anything to eat or drink'
    ],
    emergency: true,
    call911: true
  },
  'stroke': {
    title: 'Stroke',
    severity: 'critical',
    steps: [
      'Call emergency services immediately - time is critical',
      'Note the time when symptoms started',
      'Check for FAST symptoms: Face drooping, Arm weakness, Speech difficulty',
      'Keep the person comfortable and calm',
      'Do not give food, drink, or medication',
      'If unconscious, check breathing and start CPR if needed'
    ],
    emergency: true,
    call911: true
  },
  'allergic_reaction': {
    title: 'Allergic Reaction',
    severity: 'high',
    steps: [
      'Call emergency services if severe symptoms',
      'Remove the allergen if possible',
      'Administer epinephrine auto-injector if available and trained',
      'Help the person into a comfortable position',
      'Monitor breathing and consciousness',
      'If they have antihistamine medication, help them take it',
      'Watch for anaphylaxis symptoms (difficulty breathing, swelling)'
    ],
    emergency: true,
    call911: true
  },
  'default': {
    title: 'General Injury',
    severity: 'unknown',
    steps: [
      'Ensure the scene is safe for you and the injured person',
      'Check for responsiveness and breathing',
      'Call emergency services if needed',
      'Control any bleeding with direct pressure',
      'Keep the person comfortable and warm',
      'Do not move the person unless absolutely necessary',
      'Wait for professional medical help'
    ],
    emergency: false,
    call911: false
  }
};

// Analyze image for injury detection
router.post('/analyze-injury',
  [
    body('image').isBase64().withMessage('Image must be base64 encoded'),
    body('emergencyId').optional().isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { image, emergencyId } = req.body;

      // For demo purposes, we'll simulate AI analysis
      // In production, you would send the image to Hugging Face
      const mockAnalysis = await simulateInjuryAnalysis(image);

      // Get first-aid guidance based on detected injury
      const firstAidGuide = FIRST_AID_GUIDE[mockAnalysis.injuryType] || FIRST_AID_GUIDE.default;

      // Store analysis if emergency ID provided
      if (emergencyId) {
        await prisma.emergencyRequest.update({
          where: { id: emergencyId },
          data: {
            aiAnalysis: {
              injuryType: mockAnalysis.injuryType,
              confidence: mockAnalysis.confidence,
              severity: firstAidGuide.severity,
              emergency: firstAidGuide.emergency,
              call911: firstAidGuide.call911,
              analysis: mockAnalysis
            }
          }
        });
      }

      res.json({
        success: true,
        analysis: {
          injuryType: mockAnalysis.injuryType,
          confidence: mockAnalysis.confidence,
          severity: firstAidGuide.severity,
          emergency: firstAidGuide.emergency,
          call911: firstAidGuide.call911,
          firstAidGuide,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('AI analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  }
);

// Get first-aid guidance for specific injury type
router.get('/first-aid/:injuryType',
  [
    param('injuryType').isIn(['burn', 'cut', 'fracture', 'concussion', 'choking', 'heart_attack', 'stroke', 'allergic_reaction'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { injuryType } = req.params;
      const firstAidGuide = FIRST_AID_GUIDE[injuryType] || FIRST_AID_GUIDE.default;

      res.json({
        success: true,
        firstAidGuide
      });

    } catch (error) {
      console.error('Get first-aid guidance error:', error);
      res.status(500).json({ error: 'Failed to get first-aid guidance' });
    }
  }
);

// Get emergency contact information
router.get('/emergency-contacts', async (req, res) => {
  try {
    const contacts = {
      emergency: {
        phone: '911',
        description: 'Emergency Services'
      },
      ambulance: {
        phone: '911',
        description: 'Ambulance Services'
      },
      fire: {
        phone: '911',
        description: 'Fire Department'
      },
      police: {
        phone: '911',
        description: 'Police Department'
      },
      poison_control: {
        phone: '1-800-222-1222',
        description: 'Poison Control Center'
      },
      crisis_hotline: {
        phone: '988',
        description: 'Suicide & Crisis Lifeline'
      }
    };

    res.json({
      success: true,
      contacts
    });

  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ error: 'Failed to get emergency contacts' });
  }
});

// Simulate injury analysis (replace with actual Hugging Face API call)
async function simulateInjuryAnalysis(imageBase64) {
  // In production, you would:
  // const response = await axios.post(HUGGING_FACE_MODEL_URL, {
  //   image: imageBase64
  // }, {
  //   headers: {
  //     'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   }
  // });

  // For demo purposes, return mock analysis
  const injuryTypes = ['burn', 'cut', 'fracture', 'concussion'];
  const randomInjury = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];

  return {
    injuryType: randomInjury,
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    detectedObjects: [randomInjury],
    description: `Detected ${randomInjury} injury with high confidence`
  };
}

module.exports = router;