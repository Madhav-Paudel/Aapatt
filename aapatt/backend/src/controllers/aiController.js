const axios = require('axios');

const analyzeInjury = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data required' });
    }

    // For now, we'll simulate AI analysis since Hugging Face API requires proper setup
    // In production, you would call the actual Hugging Face API here
    
    // Simulate injury detection
    const mockAnalysis = {
      injuryType: 'cut',
      severity: 'minor',
      confidence: 0.85,
      firstAidSteps: [
        {
          step: 1,
          title: 'Stop the bleeding',
          description: 'Apply direct pressure to the wound with a clean cloth or bandage',
          image: 'https://example.com/step1.jpg',
          video: 'https://example.com/step1.mp4'
        },
        {
          step: 2,
          title: 'Clean the wound',
          description: 'Rinse the wound with clean water to remove dirt and debris',
          image: 'https://example.com/step2.jpg',
          video: 'https://example.com/step2.mp4'
        },
        {
          step: 3,
          title: 'Apply bandage',
          description: 'Cover the wound with a sterile bandage or gauze',
          image: 'https://example.com/step3.jpg',
          video: 'https://example.com/step3.mp4'
        }
      ],
      emergencyCallNeeded: false,
      additionalAdvice: 'Monitor for signs of infection. Seek medical attention if the wound becomes red, swollen, or shows signs of infection.'
    };

    // In production, replace with actual Hugging Face API call:
    /*
    const response = await axios.post(
      process.env.HUGGING_FACE_MODEL_URL,
      {
        inputs: imageBase64
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    */

    res.json({
      analysis: mockAnalysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze injury' });
  }
};

const getFirstAidGuidance = async (req, res) => {
  try {
    const { injuryType, severity } = req.query;

    // First aid guidance database
    const guidanceDatabase = {
      cut: {
        minor: {
          title: 'Minor Cut First Aid',
          steps: [
            {
              step: 1,
              title: 'Stop the bleeding',
              description: 'Apply direct pressure to the wound with a clean cloth or bandage',
              duration: '2-3 minutes',
              image: 'https://example.com/cut-minor-step1.jpg'
            },
            {
              step: 2,
              title: 'Clean the wound',
              description: 'Rinse the wound with clean water to remove dirt and debris',
              duration: '1-2 minutes',
              image: 'https://example.com/cut-minor-step2.jpg'
            },
            {
              step: 3,
              title: 'Apply bandage',
              description: 'Cover the wound with a sterile bandage or gauze',
              duration: '1 minute',
              image: 'https://example.com/cut-minor-step3.jpg'
            }
          ],
          emergencyCallNeeded: false,
          warningSigns: ['Excessive bleeding', 'Deep wound', 'Signs of infection']
        },
        major: {
          title: 'Major Cut First Aid',
          steps: [
            {
              step: 1,
              title: 'Apply pressure',
              description: 'Apply firm pressure to stop bleeding immediately',
              duration: '5-10 minutes',
              image: 'https://example.com/cut-major-step1.jpg'
            },
            {
              step: 2,
              title: 'Elevate the wound',
              description: 'Raise the injured area above heart level if possible',
              duration: 'Ongoing',
              image: 'https://example.com/cut-major-step2.jpg'
            },
            {
              step: 3,
              title: 'Call emergency services',
              description: 'Call 911 or emergency services immediately',
              duration: 'Immediate',
              image: 'https://example.com/cut-major-step3.jpg'
            }
          ],
          emergencyCallNeeded: true,
          warningSigns: ['Heavy bleeding', 'Deep wound', 'Loss of consciousness']
        }
      },
      burn: {
        minor: {
          title: 'Minor Burn First Aid',
          steps: [
            {
              step: 1,
              title: 'Cool the burn',
              description: 'Run cool (not cold) water over the burn for 10-15 minutes',
              duration: '10-15 minutes',
              image: 'https://example.com/burn-minor-step1.jpg'
            },
            {
              step: 2,
              title: 'Remove jewelry',
              description: 'Remove any jewelry or tight clothing near the burn',
              duration: '1 minute',
              image: 'https://example.com/burn-minor-step2.jpg'
            },
            {
              step: 3,
              title: 'Apply aloe vera',
              description: 'Apply aloe vera gel or a mild moisturizer',
              duration: '1 minute',
              image: 'https://example.com/burn-minor-step3.jpg'
            }
          ],
          emergencyCallNeeded: false,
          warningSigns: ['Large burn area', 'Blisters', 'Signs of infection']
        },
        major: {
          title: 'Major Burn First Aid',
          steps: [
            {
              step: 1,
              title: 'Remove from heat source',
              description: 'Move away from the heat source and stop the burning process',
              duration: 'Immediate',
              image: 'https://example.com/burn-major-step1.jpg'
            },
            {
              step: 2,
              title: 'Call emergency services',
              description: 'Call 911 immediately for major burns',
              duration: 'Immediate',
              image: 'https://example.com/burn-major-step2.jpg'
            },
            {
              step: 3,
              title: 'Cover the burn',
              description: 'Cover with a clean, dry cloth or bandage',
              duration: '1 minute',
              image: 'https://example.com/burn-major-step3.jpg'
            }
          ],
          emergencyCallNeeded: true,
          warningSigns: ['Large burn area', 'Third-degree burns', 'Difficulty breathing']
        }
      },
      fall: {
        minor: {
          title: 'Minor Fall First Aid',
          steps: [
            {
              step: 1,
              title: 'Assess the situation',
              description: 'Check for any obvious injuries or pain',
              duration: '1-2 minutes',
              image: 'https://example.com/fall-minor-step1.jpg'
            },
            {
              step: 2,
              title: 'Apply ice',
              description: 'Apply ice pack to any bruised or swollen areas',
              duration: '15-20 minutes',
              image: 'https://example.com/fall-minor-step2.jpg'
            },
            {
              step: 3,
              title: 'Rest and monitor',
              description: 'Rest and monitor for any worsening symptoms',
              duration: 'Ongoing',
              image: 'https://example.com/fall-minor-step3.jpg'
            }
          ],
          emergencyCallNeeded: false,
          warningSigns: ['Severe pain', 'Inability to move', 'Loss of consciousness']
        },
        major: {
          title: 'Major Fall First Aid',
          steps: [
            {
              step: 1,
              title: 'Do not move the person',
              description: 'Do not move the person unless they are in immediate danger',
              duration: 'Immediate',
              image: 'https://example.com/fall-major-step1.jpg'
            },
            {
              step: 2,
              title: 'Call emergency services',
              description: 'Call 911 immediately for serious falls',
              duration: 'Immediate',
              image: 'https://example.com/fall-major-step2.jpg'
            },
            {
              step: 3,
              title: 'Keep warm and still',
              description: 'Keep the person warm and still until help arrives',
              duration: 'Ongoing',
              image: 'https://example.com/fall-major-step3.jpg'
            }
          ],
          emergencyCallNeeded: true,
          warningSigns: ['Loss of consciousness', 'Severe pain', 'Visible deformity']
        }
      }
    };

    const guidance = guidanceDatabase[injuryType]?.[severity];

    if (!guidance) {
      return res.status(404).json({ 
        error: 'Guidance not found for this injury type and severity' 
      });
    }

    res.json({
      guidance,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get guidance error:', error);
    res.status(500).json({ error: 'Failed to get first aid guidance' });
  }
};

const getEmergencyContacts = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Mock emergency contacts based on location
    // In production, this would query a real database of emergency services
    const emergencyContacts = {
      ambulance: {
        name: 'Emergency Ambulance Service',
        phone: '108',
        description: '24/7 emergency medical services',
        responseTime: '8-12 minutes'
      },
      fire: {
        name: 'Fire Department',
        phone: '101',
        description: 'Fire and rescue services',
        responseTime: '5-10 minutes'
      },
      police: {
        name: 'Police Emergency',
        phone: '100',
        description: 'Police emergency services',
        responseTime: '5-15 minutes'
      },
      airAmbulance: {
        name: 'Air Ambulance Service',
        phone: '108',
        description: 'Air medical transport',
        responseTime: '15-30 minutes'
      }
    };

    res.json({
      contacts: emergencyContacts,
      location: {
        latitude: parseFloat(latitude) || null,
        longitude: parseFloat(longitude) || null,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ error: 'Failed to get emergency contacts' });
  }
};

module.exports = {
  analyzeInjury,
  getFirstAidGuidance,
  getEmergencyContacts,
};