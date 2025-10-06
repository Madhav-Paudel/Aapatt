/**
 * Aapatt Emergency Superapp - AI Service
 * Hugging Face integration for injury detection and first-aid guidance
 */

const axios = require('axios');
const logger = require('./loggerService');
const { prisma } = require('./databaseService');

// Hugging Face API configuration
const HF_API_URL = process.env.HUGGING_FACE_API_URL || 'https://api-inference.huggingface.co';
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

// Model endpoints
const MODELS = {
  INJURY_DETECTION: 'google/vit-base-patch16-224',
  IMAGE_CLASSIFICATION: 'microsoft/resnet-50',
  TEXT_CLASSIFICATION: 'distilbert-base-uncased-finetuned-sst-2-english'
};

// Create axios instance for Hugging Face API
const hfApi = axios.create({
  baseURL: HF_API_URL,
  headers: {
    'Authorization': `Bearer ${HF_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

/**
 * Analyze injury from image
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} imageType - Image type (jpg, png, etc.)
 * @returns {Promise<Object>} Analysis result
 */
async function analyzeInjury(imageBase64, imageType = 'jpg') {
  try {
    logger.ai('Starting injury analysis', { imageType });
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    // Call Hugging Face vision model
    const response = await hfApi.post(`/models/${MODELS.INJURY_DETECTION}`, imageBuffer, {
      headers: {
        'Content-Type': `image/${imageType}`
      }
    });

    const predictions = response.data;
    
    // Process predictions to determine injury type and severity
    const analysis = await processInjuryPredictions(predictions);
    
    logger.ai('Injury analysis completed', { 
      injuryType: analysis.injuryType,
      confidence: analysis.confidence,
      severity: analysis.severity
    });
    
    return analysis;
  } catch (error) {
    logger.error('Injury analysis failed:', error);
    
    // Return fallback response
    return {
      injuryType: 'unknown',
      confidence: 0.0,
      severity: 'medium',
      recommendations: ['Seek immediate medical attention'],
      requiresEmergencyCall: true,
      error: 'Analysis failed, please consult medical professional'
    };
  }
}

/**
 * Process injury predictions from AI model
 * @param {Array} predictions - Model predictions
 * @returns {Object} Processed analysis result
 */
async function processInjuryPredictions(predictions) {
  try {
    // Sort predictions by confidence
    const sortedPredictions = predictions.sort((a, b) => b.score - a.score);
    const topPrediction = sortedPredictions[0];
    
    // Map model labels to injury types
    const injuryMapping = {
      'wound': 'bleeding',
      'cut': 'bleeding',
      'burn': 'burns',
      'bruise': 'bruising',
      'fracture': 'fractures',
      'break': 'fractures',
      'swelling': 'inflammation',
      'rash': 'skin_condition'
    };
    
    // Determine injury type
    let injuryType = 'unknown';
    for (const [keyword, type] of Object.entries(injuryMapping)) {
      if (topPrediction.label.toLowerCase().includes(keyword)) {
        injuryType = type;
        break;
      }
    }
    
    // Determine severity based on confidence and injury type
    let severity = 'medium';
    const confidence = topPrediction.score;
    
    if (confidence > 0.8) {
      severity = injuryType === 'fractures' || injuryType === 'burns' ? 'high' : 'medium';
    } else if (confidence > 0.6) {
      severity = 'medium';
    } else {
      severity = 'low';
    }
    
    // Get first aid recommendations
    const firstAidGuide = await getFirstAidGuidance(injuryType);
    
    // Determine if emergency call is required
    const requiresEmergencyCall = severity === 'high' || 
                                 injuryType === 'fractures' || 
                                 injuryType === 'burns' ||
                                 confidence > 0.9;
    
    return {
      injuryType,
      confidence,
      severity,
      recommendations: firstAidGuide.steps.slice(0, 5), // First 5 steps
      requiresEmergencyCall,
      firstAidGuideId: firstAidGuide.id,
      rawPredictions: sortedPredictions
    };
  } catch (error) {
    logger.error('Error processing injury predictions:', error);
    throw error;
  }
}

/**
 * Get first aid guidance for injury type
 * @param {string} injuryType - Type of injury
 * @returns {Promise<Object>} First aid guide
 */
async function getFirstAidGuidance(injuryType) {
  try {
    // Try to find existing guide in database
    let guide = await prisma.firstAidGuide.findFirst({
      where: {
        category: injuryType
      }
    });
    
    // If no guide found, create default guide
    if (!guide) {
      guide = await createDefaultFirstAidGuide(injuryType);
    }
    
    return guide;
  } catch (error) {
    logger.error('Error getting first aid guidance:', error);
    
    // Return basic guidance
    return {
      id: 'default',
      category: injuryType,
      title: 'Basic First Aid',
      steps: [
        'Stay calm and assess the situation',
        'Ensure the area is safe',
        'Call emergency services if needed',
        'Apply appropriate first aid measures',
        'Monitor the person until help arrives'
      ],
      severity: 'medium',
      requiresEmergencyCall: true
    };
  }
}

/**
 * Create default first aid guide for injury type
 * @param {string} injuryType - Type of injury
 * @returns {Promise<Object>} Created first aid guide
 */
async function createDefaultFirstAidGuide(injuryType) {
  const guides = {
    bleeding: {
      title: 'Bleeding and Wound Care',
      description: 'First aid for cuts, wounds, and bleeding',
      steps: [
        'Apply direct pressure to the wound with a clean cloth',
        'Elevate the injured area above heart level if possible',
        'Maintain pressure until bleeding stops',
        'Clean the wound gently with clean water',
        'Apply sterile bandage or dressing',
        'Seek medical attention if bleeding is severe'
      ],
      severity: 'medium',
      requiresEmergencyCall: false
    },
    burns: {
      title: 'Burn Treatment',
      description: 'First aid for burns and scalds',
      steps: [
        'Remove from heat source immediately',
        'Cool the burn with cold running water for 10-20 minutes',
        'Remove any jewelry or tight clothing near the burn',
        'Do not apply ice, butter, or other home remedies',
        'Cover with sterile, non-stick bandage',
        'Seek immediate medical attention for severe burns'
      ],
      severity: 'high',
      requiresEmergencyCall: true
    },
    fractures: {
      title: 'Fracture and Bone Injury Care',
      description: 'First aid for suspected fractures',
      steps: [
        'Do not move the person unless in immediate danger',
        'Immobilize the injured area',
        'Apply ice wrapped in cloth to reduce swelling',
        'Do not try to realign the bone',
        'Support the injured area with splints if available',
        'Call emergency services immediately'
      ],
      severity: 'high',
      requiresEmergencyCall: true
    },
    bruising: {
      title: 'Bruise and Soft Tissue Injury',
      description: 'First aid for bruises and soft tissue injuries',
      steps: [
        'Apply ice wrapped in cloth for 15-20 minutes',
        'Elevate the injured area if possible',
        'Avoid applying heat for the first 24 hours',
        'Take over-the-counter pain relievers if needed',
        'Monitor for signs of serious injury',
        'Seek medical attention if pain persists'
      ],
      severity: 'low',
      requiresEmergencyCall: false
    }
  };
  
  const guideData = guides[injuryType] || guides.bleeding;
  
  try {
    const guide = await prisma.firstAidGuide.create({
      data: {
        category: injuryType,
        title: guideData.title,
        description: guideData.description,
        steps: guideData.steps,
        severity: guideData.severity,
        requiresEmergencyCall: guideData.requiresEmergencyCall,
        tags: [injuryType, 'first-aid', 'emergency']
      }
    });
    
    logger.ai('Created default first aid guide', { injuryType, guideId: guide.id });
    return guide;
  } catch (error) {
    logger.error('Error creating default first aid guide:', error);
    return guideData;
  }
}

/**
 * Detect emergency situation from text description
 * @param {string} description - Emergency description
 * @returns {Promise<Object>} Emergency detection result
 */
async function detectEmergencyFromText(description) {
  try {
    logger.ai('Analyzing emergency description', { descriptionLength: description.length });
    
    // Use text classification model
    const response = await hfApi.post(`/models/${MODELS.TEXT_CLASSIFICATION}`, {
      inputs: description
    });
    
    const classification = response.data[0];
    
    // Analyze keywords for emergency severity
    const emergencyKeywords = {
      critical: ['unconscious', 'not breathing', 'severe bleeding', 'cardiac arrest', 'stroke', 'overdose'],
      high: ['chest pain', 'difficulty breathing', 'severe pain', 'allergic reaction', 'poisoning'],
      medium: ['injury', 'accident', 'fall', 'cut', 'burn', 'pain'],
      low: ['minor', 'small', 'slight', 'mild']
    };
    
    let severity = 'medium';
    const lowerDescription = description.toLowerCase();
    
    for (const [level, keywords] of Object.entries(emergencyKeywords)) {
      if (keywords.some(keyword => lowerDescription.includes(keyword))) {
        severity = level;
        break;
      }
    }
    
    // Determine emergency type based on keywords
    const typeKeywords = {
      ambulance: ['medical', 'health', 'injury', 'pain', 'bleeding', 'breathing', 'heart', 'unconscious'],
      fire: ['fire', 'smoke', 'burning', 'explosion', 'gas leak', 'electrical'],
      air_ambulance: ['remote', 'inaccessible', 'mountain', 'water', 'critical', 'urgent transport']
    };
    
    let emergencyType = 'ambulance'; // default
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => lowerDescription.includes(keyword))) {
        emergencyType = type;
        break;
      }
    }
    
    const result = {
      emergencyType,
      severity,
      confidence: classification.score,
      keywords: extractKeywords(description),
      recommendations: getEmergencyRecommendations(emergencyType, severity),
      requiresImmediate: severity === 'critical' || severity === 'high'
    };
    
    logger.ai('Emergency detection completed', result);
    return result;
  } catch (error) {
    logger.error('Emergency detection failed:', error);
    
    // Return safe default
    return {
      emergencyType: 'ambulance',
      severity: 'medium',
      confidence: 0.5,
      keywords: [],
      recommendations: ['Call emergency services', 'Stay calm', 'Provide clear location'],
      requiresImmediate: true,
      error: 'Analysis failed'
    };
  }
}

/**
 * Extract keywords from text
 * @param {string} text - Input text
 * @returns {Array<string>} Extracted keywords
 */
function extractKeywords(text) {
  const commonWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for'];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));
  
  // Return unique words
  return [...new Set(words)];
}

/**
 * Get emergency recommendations based on type and severity
 * @param {string} emergencyType - Type of emergency
 * @param {string} severity - Severity level
 * @returns {Array<string>} Recommendations
 */
function getEmergencyRecommendations(emergencyType, severity) {
  const baseRecommendations = {
    ambulance: [
      'Call emergency services immediately',
      'Stay with the person',
      'Keep the person calm and comfortable',
      'Do not move the person unless necessary',
      'Monitor breathing and pulse'
    ],
    fire: [
      'Call fire department immediately',
      'Evacuate the area safely',
      'Do not use elevators',
      'Stay low to avoid smoke',
      'Meet at designated assembly point'
    ],
    air_ambulance: [
      'Call emergency services for air rescue',
      'Provide exact GPS coordinates',
      'Clear landing area if possible',
      'Signal with bright colors or lights',
      'Stay with the patient'
    ]
  };
  
  let recommendations = baseRecommendations[emergencyType] || baseRecommendations.ambulance;
  
  if (severity === 'critical') {
    recommendations.unshift('THIS IS A CRITICAL EMERGENCY - ACT IMMEDIATELY');
  }
  
  return recommendations;
}

/**
 * Get AI service health status
 * @returns {Promise<Object>} Health status
 */
async function getAIServiceHealth() {
  try {
    const start = Date.now();
    
    // Test API connection with a simple request
    await hfApi.get('/models');
    
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
      modelsAvailable: Object.keys(MODELS).length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('AI service health check failed:', error);
    
    return {
      status: 'down',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Batch process multiple images
 * @param {Array<Object>} images - Array of image objects
 * @returns {Promise<Array<Object>>} Analysis results
 */
async function batchAnalyzeImages(images) {
  const results = [];
  
  for (const image of images) {
    try {
      const result = await analyzeInjury(image.data, image.type);
      results.push({
        id: image.id,
        success: true,
        result
      });
    } catch (error) {
      results.push({
        id: image.id,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

module.exports = {
  analyzeInjury,
  getFirstAidGuidance,
  detectEmergencyFromText,
  getAIServiceHealth,
  batchAnalyzeImages,
  createDefaultFirstAidGuide
};