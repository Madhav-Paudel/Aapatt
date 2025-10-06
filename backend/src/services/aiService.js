const axios = require('axios');

class AIService {
  constructor() {
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';

    // Default model for injury analysis
    this.injuryAnalysisModel = 'google/vit-base-patch16-224';

    // First-aid instruction database
    this.firstAidInstructions = {
      cut: {
        steps: [
          'Clean the wound with clean water and mild soap',
          'Apply direct pressure with a clean cloth or bandage to stop bleeding',
          'Apply an antiseptic cream or ointment',
          'Cover with a sterile bandage or dressing',
          'Change the dressing daily and watch for signs of infection'
        ],
        emergency: 'Seek medical attention if bleeding is heavy, wound is deep, or shows signs of infection'
      },
      burn: {
        steps: [
          'Cool the burn under cool (not cold) running water for 10-20 minutes',
          'Remove any clothing or jewelry near the burn area',
          'Do not apply ice, butter, or any home remedies',
          'Cover loosely with a clean, dry cloth or bandage',
          'Take pain relief medication if needed'
        ],
        emergency: 'Seek immediate medical attention for severe burns, burns covering large areas, or burns to face/hands/genitals'
      },
      fracture: {
        steps: [
          'Do not move the injured person unless they are in immediate danger',
          'Immobilize the injured area with splints if available',
          'Apply ice wrapped in cloth to reduce swelling',
          'Keep the injured area elevated above heart level',
          'Do not attempt to realign broken bones'
        ],
        emergency: 'Call emergency services immediately. Do not let the person eat or drink if surgery may be needed'
      },
      sprain: {
        steps: [
          'Rest the injured area',
          'Apply ice wrapped in cloth for 15-20 minutes every 2-3 hours',
          'Compress with an elastic bandage (not too tight)',
          'Elevate the injured area above heart level',
          'Take over-the-counter pain medication if needed'
        ],
        emergency: 'Seek medical attention if swelling is severe, cannot bear weight, or joint appears deformed'
      },
      bruise: {
        steps: [
          'Apply ice wrapped in cloth for 15-20 minutes',
          'Elevate the injured area if possible',
          'Rest the area and avoid strenuous activity',
          'Use over-the-counter pain medication if needed',
          'Monitor for increased swelling or pain'
        ],
        emergency: 'Seek medical attention if bruising is severe, accompanied by severe pain, or if you suspect internal injury'
      },
      wound: {
        steps: [
          'Clean the wound with clean water',
          'Apply direct pressure to stop bleeding',
          'Apply antiseptic if available',
          'Cover with clean dressing',
          'Change dressing regularly and monitor for infection'
        ],
        emergency: 'Seek medical attention for deep wounds, heavy bleeding, or signs of infection'
      }
    };
  }

  /**
   * Analyze injury from image using Hugging Face Vision Transformer
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeInjury(imageBase64) {
    try {
      if (!this.huggingFaceApiKey) {
        console.warn('Hugging Face API key not configured, returning mock data');
        return this.getMockAnalysis();
      }

      // Prepare image for Hugging Face API
      const imageData = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const response = await axios.post(
        `${this.baseUrl}/${this.injuryAnalysisModel}`,
        {
          inputs: imageData
        },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      // Process Hugging Face response
      const predictions = response.data;
      const analysis = this.processPredictions(predictions);

      return {
        success: true,
        injury_type: analysis.injuryType,
        severity: analysis.severity,
        confidence: analysis.confidence,
        first_aid_steps: this.getFirstAidSteps(analysis.injuryType),
        emergency_note: this.getEmergencyNote(analysis.injuryType),
        raw_predictions: predictions
      };

    } catch (error) {
      console.error('Error analyzing injury:', error.message);

      // Return mock data as fallback
      return this.getMockAnalysis();
    }
  }

  /**
   * Process Hugging Face model predictions
   * @param {Array} predictions - Model predictions
   * @returns {Object} Processed analysis
   */
  processPredictions(predictions) {
    if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
      return { injuryType: 'wound', severity: 'unknown', confidence: 0.5 };
    }

    // Find the highest confidence prediction
    let bestPrediction = predictions[0];
    let maxConfidence = 0;

    predictions.forEach(prediction => {
      if (prediction.confidence > maxConfidence) {
        maxConfidence = prediction.confidence;
        bestPrediction = prediction;
      }
    });

    // Map model labels to injury types
    const injuryMapping = {
      'wound': 'wound',
      'cut': 'cut',
      'bruise': 'bruise',
      'burn': 'burn',
      'fracture': 'fracture',
      'sprain': 'sprain',
      'injury': 'wound',
      'bleeding': 'cut'
    };

    const label = bestPrediction.label.toLowerCase();
    const injuryType = injuryMapping[label] || 'wound';

    // Determine severity based on confidence and injury type
    let severity = 'low';
    if (maxConfidence > 0.8) {
      severity = injuryType === 'fracture' || injuryType === 'burn' ? 'high' : 'medium';
    } else if (maxConfidence > 0.6) {
      severity = 'medium';
    }

    return {
      injuryType,
      severity,
      confidence: maxConfidence
    };
  }

  /**
   * Get first aid steps for injury type
   * @param {string} injuryType - Type of injury
   * @returns {Array} First aid steps
   */
  getFirstAidSteps(injuryType) {
    const instructions = this.firstAidInstructions[injuryType];
    return instructions ? instructions.steps : this.firstAidInstructions.wound.steps;
  }

  /**
   * Get emergency note for injury type
   * @param {string} injuryType - Type of injury
   * @returns {string} Emergency guidance
   */
  getEmergencyNote(injuryType) {
    const instructions = this.firstAidInstructions[injuryType];
    return instructions ? instructions.emergency : this.firstAidInstructions.wound.emergency;
  }

  /**
   * Get mock analysis for development/testing
   * @returns {Object} Mock analysis result
   */
  getMockAnalysis() {
    const mockInjuries = ['cut', 'burn', 'bruise', 'sprain'];
    const randomInjury = mockInjuries[Math.floor(Math.random() * mockInjuries.length)];

    return {
      success: true,
      injury_type: randomInjury,
      severity: 'low',
      confidence: 0.75,
      first_aid_steps: this.getFirstAidSteps(randomInjury),
      emergency_note: this.getEmergencyNote(randomInjury),
      note: 'This is mock data. Configure Hugging Face API key for real analysis.'
    };
  }

  /**
   * Get first aid instructions by injury type
   * @param {string} injuryType - Type of injury
   * @returns {Object} First aid information
   */
  getFirstAidInstructions(injuryType) {
    const instructions = this.firstAidInstructions[injuryType.toLowerCase()];

    if (!instructions) {
      return {
        injury_type: injuryType,
        instructions: this.firstAidInstructions.wound.steps,
        emergency_note: this.firstAidInstructions.wound.emergency,
        note: 'General first aid instructions provided. Please consult medical professional.'
      };
    }

    return {
      injury_type: injuryType,
      instructions: instructions.steps,
      emergency_note: instructions.emergency
    };
  }

  /**
   * Emergency assessment based on symptoms
   * @param {Object} assessmentData - Symptoms and vitals
   * @returns {Object} Emergency assessment
   */
  assessEmergency(assessmentData) {
    const { symptoms, severity, vitals } = assessmentData;

    // Simple rule-based assessment
    let priorityLevel = 'low';
    let recommendedAction = 'seek_medical_attention';
    let estimatedResponseTime = 'within_24_hours';

    if (severity === 'high' || severity === 'critical') {
      priorityLevel = 'high';
      recommendedAction = 'call_emergency_services';
      estimatedResponseTime = 'immediate_response';
    } else if (severity === 'medium') {
      priorityLevel = 'medium';
      recommendedAction = 'visit_emergency_room';
      estimatedResponseTime = 'within_4_hours';
    }

    return {
      priority_level: priorityLevel,
      recommended_action: recommendedAction,
      estimated_response_time: estimatedResponseTime,
      emergency_type: assessmentData.emergencyType || 'medical',
      instructions: [
        'Stay calm and assess the situation',
        'Ensure safety of yourself and others',
        'Call emergency services if condition worsens',
        'Do not leave the person unattended',
        'Follow any specific first aid instructions provided'
      ]
    };
  }
}

// Export singleton instance
module.exports = new AIService();