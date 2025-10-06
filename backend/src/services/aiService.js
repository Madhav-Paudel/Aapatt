/**
 * AI Service
 * Integrates with Hugging Face API for first-aid guidance
 */

import axios from 'axios';

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;
const HUGGING_FACE_MODEL_URL = process.env.HUGGING_FACE_MODEL_URL || 
  'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';

/**
 * Analyze injury from image using vision model
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeInjury = async (imageBase64) => {
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    // Call Hugging Face API
    const response = await axios.post(
      HUGGING_FACE_MODEL_URL,
      imageBuffer,
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    // Process response
    const predictions = response.data;
    
    // Map predictions to injury types (simplified)
    const injuryType = mapPredictionToInjury(predictions);
    
    return {
      success: true,
      injuryType: injuryType.type,
      confidence: injuryType.confidence,
      severity: injuryType.severity,
      autoCall911: injuryType.autoCall911,
      predictions
    };
  } catch (error) {
    console.error('AI analysis failed:', error.message);
    
    // Return fallback response
    return {
      success: false,
      error: 'Unable to analyze image',
      message: 'Please describe your emergency or call 911 directly'
    };
  }
};

/**
 * Map AI predictions to injury types
 * @param {Array} predictions - Model predictions
 * @returns {Object} Injury information
 */
const mapPredictionToInjury = (predictions) => {
  // This is a simplified mapping. In production, you'd use a medical image
  // classification model trained on injury types
  
  if (!predictions || predictions.length === 0) {
    return {
      type: 'UNKNOWN',
      confidence: 0,
      severity: 'MEDIUM',
      autoCall911: false
    };
  }
  
  const topPrediction = predictions[0];
  const confidence = topPrediction.score || 0;
  
  // Simplified injury classification
  const label = topPrediction.label?.toLowerCase() || '';
  
  let injuryType = 'MINOR_INJURY';
  let severity = 'LOW';
  let autoCall911 = false;
  
  // Check for severe keywords
  if (label.includes('blood') || label.includes('wound') || label.includes('cut')) {
    injuryType = 'BLEEDING';
    severity = 'MEDIUM';
    if (confidence > 0.8) {
      severity = 'HIGH';
    }
  } else if (label.includes('burn') || label.includes('fire')) {
    injuryType = 'BURN';
    severity = 'MEDIUM';
  } else if (label.includes('break') || label.includes('fracture')) {
    injuryType = 'FRACTURE';
    severity = 'HIGH';
  }
  
  // Auto-call 911 for critical injuries
  if (confidence > 0.9 && severity === 'HIGH') {
    autoCall911 = true;
  }
  
  return {
    type: injuryType,
    confidence,
    severity,
    autoCall911
  };
};

/**
 * Get first-aid steps for injury type
 * @param {string} injuryType - Type of injury
 * @returns {Promise<Object>} First-aid guidance
 */
export const getFirstAidSteps = async (injuryType) => {
  // In production, this would query a database of first-aid guides
  const firstAidGuides = {
    BLEEDING: {
      title: 'Bleeding Control',
      severity: 'HIGH',
      steps: [
        'Apply direct pressure to the wound with a clean cloth',
        'Keep pressure for 10-15 minutes without checking',
        'Elevate the injured area above heart level if possible',
        'Do not remove the cloth if it becomes soaked - add more on top',
        'Call for medical help if bleeding doesn\'t stop'
      ],
      warnings: [
        'Do not use a tourniquet unless trained',
        'Do not remove embedded objects'
      ],
      videoUrl: null,
      autoCall911: false
    },
    BURN: {
      title: 'Burn Treatment',
      severity: 'MEDIUM',
      steps: [
        'Remove from heat source immediately',
        'Cool the burn with running water for 10-20 minutes',
        'Remove jewelry and tight clothing before swelling',
        'Cover with a sterile, non-stick bandage',
        'Do not apply ice, butter, or ointments'
      ],
      warnings: [
        'For burns larger than 3 inches, seek immediate medical help',
        'Do not break blisters'
      ],
      videoUrl: null,
      autoCall911: false
    },
    FRACTURE: {
      title: 'Fracture Care',
      severity: 'HIGH',
      steps: [
        'Do not move the injured area',
        'Immobilize the injury using splints if available',
        'Apply ice packs to reduce swelling',
        'Elevate the injured limb if possible',
        'Seek immediate medical attention'
      ],
      warnings: [
        'Do not try to realign the bone',
        'Do not move the person unless necessary'
      ],
      videoUrl: null,
      autoCall911: true
    },
    MINOR_INJURY: {
      title: 'Minor Injury Care',
      severity: 'LOW',
      steps: [
        'Clean the area with water',
        'Apply antiseptic if available',
        'Cover with a clean bandage',
        'Rest and elevate if possible',
        'Monitor for signs of infection'
      ],
      warnings: [
        'Seek medical help if pain worsens or infection develops'
      ],
      videoUrl: null,
      autoCall911: false
    },
    UNKNOWN: {
      title: 'General Emergency Care',
      severity: 'MEDIUM',
      steps: [
        'Ensure the scene is safe',
        'Check for responsiveness',
        'Call emergency services immediately',
        'Do not move the person unless in immediate danger',
        'Monitor breathing and consciousness'
      ],
      warnings: [
        'When in doubt, always call for professional help'
      ],
      videoUrl: null,
      autoCall911: true
    }
  };
  
  return firstAidGuides[injuryType] || firstAidGuides.UNKNOWN;
};

/**
 * Generate AI-powered emergency guidance
 * @param {string} symptoms - User-described symptoms
 * @returns {Promise<Object>} Emergency guidance
 */
export const generateEmergencyGuidance = async (symptoms) => {
  // Simplified keyword-based guidance
  // In production, use a medical NLP model
  
  const symptomsLower = symptoms.toLowerCase();
  
  let guidance = {
    urgency: 'MEDIUM',
    recommendedAction: 'Seek medical attention',
    immediateSteps: [],
    autoCall911: false
  };
  
  // Check for critical keywords
  const criticalKeywords = ['chest pain', 'can\'t breathe', 'unconscious', 'severe bleeding', 'heart attack', 'stroke'];
  const hasCritical = criticalKeywords.some(keyword => symptomsLower.includes(keyword));
  
  if (hasCritical) {
    guidance.urgency = 'CRITICAL';
    guidance.recommendedAction = 'Call 911 immediately';
    guidance.immediateSteps = [
      'Call emergency services now',
      'Stay with the person',
      'Do not give food or water',
      'Monitor breathing and consciousness'
    ];
    guidance.autoCall911 = true;
  }
  
  return guidance;
};

export default {
  analyzeInjury,
  getFirstAidSteps,
  generateEmergencyGuidance
};
