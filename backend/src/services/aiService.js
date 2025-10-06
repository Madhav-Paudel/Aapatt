const axios = require('axios');

const HUGGING_FACE_API_URL = process.env.HUGGING_FACE_MODEL_URL || 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

// First aid guidance database
const FIRST_AID_GUIDANCE = {
  'burn': {
    steps: [
      'Remove the person from the source of the burn',
      'Cool the burn with cool (not cold) running water for 10-15 minutes',
      'Remove any clothing or jewelry near the burn area',
      'Cover the burn with a clean, dry cloth or sterile bandage',
      'Do not apply ice, butter, or ointments to severe burns',
      'Seek medical attention for severe burns'
    ],
    severity: 'moderate',
    emergency: true
  },
  'cut': {
    steps: [
      'Apply direct pressure to stop bleeding',
      'Clean the wound with clean water if available',
      'Cover with a clean bandage or cloth',
      'Elevate the injured area if possible',
      'Seek medical attention if bleeding is severe or won\'t stop'
    ],
    severity: 'minor',
    emergency: false
  },
  'head_injury': {
    steps: [
      'Keep the person still and calm',
      'Do not move them unless absolutely necessary',
      'Apply ice wrapped in cloth to reduce swelling',
      'Monitor consciousness and breathing',
      'Seek immediate medical attention for any head injury'
    ],
    severity: 'severe',
    emergency: true
  },
  'chest_pain': {
    steps: [
      'Have the person sit down and rest',
      'Loosen tight clothing',
      'If they have medication for chest pain, help them take it',
      'Call emergency services immediately',
      'Stay with the person until help arrives'
    ],
    severity: 'critical',
    emergency: true
  },
  'breathing_difficulty': {
    steps: [
      'Help the person sit up straight',
      'Loosen any tight clothing around the neck and chest',
      'Encourage slow, deep breathing',
      'If they have an inhaler, help them use it',
      'Call emergency services if breathing doesn\'t improve'
    ],
    severity: 'severe',
    emergency: true
  },
  'unconscious': {
    steps: [
      'Check for responsiveness by gently shaking and shouting',
      'Check for breathing and pulse',
      'If not breathing, begin CPR if trained',
      'If breathing, place in recovery position',
      'Call emergency services immediately'
    ],
    severity: 'critical',
    emergency: true
  }
};

const analyzeInjury = async (imageBase64, requestId = null) => {
  try {
    if (!HUGGING_FACE_API_KEY) {
      // Mock analysis for development
      return mockInjuryAnalysis();
    }

    const response = await axios.post(
      HUGGING_FACE_API_URL,
      {
        inputs: imageBase64,
        parameters: {
          return_all_scores: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const predictions = response.data;
    const topPrediction = predictions[0];
    
    // Map prediction to injury type
    const injuryType = mapPredictionToInjuryType(topPrediction.label);
    const confidence = topPrediction.score;
    
    const guidance = FIRST_AID_GUIDANCE[injuryType] || FIRST_AID_GUIDANCE['cut'];
    
    return {
      success: true,
      injuryType,
      confidence,
      severity: guidance.severity,
      emergency: guidance.emergency,
      firstAidSteps: guidance.steps,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ AI analysis failed:', error.message);
    
    // Return fallback analysis
    return {
      success: false,
      injuryType: 'unknown',
      confidence: 0,
      severity: 'moderate',
      emergency: true,
      firstAidSteps: [
        'Assess the situation carefully',
        'Ensure your own safety first',
        'Call emergency services if needed',
        'Provide basic first aid if trained',
        'Stay with the person until help arrives'
      ],
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

const mockInjuryAnalysis = () => {
  const injuryTypes = Object.keys(FIRST_AID_GUIDANCE);
  const randomInjury = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];
  const guidance = FIRST_AID_GUIDANCE[randomInjury];
  
  return {
    success: true,
    injuryType: randomInjury,
    confidence: 0.85 + Math.random() * 0.15,
    severity: guidance.severity,
    emergency: guidance.emergency,
    firstAidSteps: guidance.steps,
    timestamp: new Date().toISOString()
  };
};

const mapPredictionToInjuryType = (label) => {
  const labelMap = {
    'burn': 'burn',
    'fire': 'burn',
    'flame': 'burn',
    'cut': 'cut',
    'wound': 'cut',
    'bleeding': 'cut',
    'head': 'head_injury',
    'head injury': 'head_injury',
    'concussion': 'head_injury',
    'chest': 'chest_pain',
    'heart': 'chest_pain',
    'breathing': 'breathing_difficulty',
    'asthma': 'breathing_difficulty',
    'unconscious': 'unconscious',
    'fainted': 'unconscious'
  };
  
  const lowerLabel = label.toLowerCase();
  for (const [key, value] of Object.entries(labelMap)) {
    if (lowerLabel.includes(key)) {
      return value;
    }
  }
  
  return 'cut'; // Default fallback
};

const getFirstAidGuidance = (injuryType) => {
  return FIRST_AID_GUIDANCE[injuryType] || FIRST_AID_GUIDANCE['cut'];
};

const detectEmergency = (injuryType, severity) => {
  const guidance = FIRST_AID_GUIDANCE[injuryType];
  if (!guidance) return true; // Default to emergency if unknown
  
  return guidance.emergency || severity === 'critical' || severity === 'severe';
};

module.exports = {
  analyzeInjury,
  getFirstAidGuidance,
  detectEmergency,
  FIRST_AID_GUIDANCE
};