/**
 * AI Controller
 * Handles AI-powered first-aid guidance
 */

import { analyzeInjury, getFirstAidSteps, generateEmergencyGuidance } from '../services/aiService.js';
import { prisma } from '../services/databaseService.js';

/**
 * Analyze injury from image
 */
export const analyzeInjuryImage = async (req, res) => {
  try {
    const { image } = req.body; // Base64 encoded image
    
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    // Analyze injury using AI
    const analysis = await analyzeInjury(image);
    
    if (!analysis.success) {
      return res.status(500).json({
        error: analysis.error,
        message: analysis.message
      });
    }
    
    // Get first-aid steps for detected injury
    const firstAid = await getFirstAidSteps(analysis.injuryType);
    
    res.json({
      analysis: {
        injuryType: analysis.injuryType,
        confidence: analysis.confidence,
        severity: analysis.severity,
        autoCall911: analysis.autoCall911
      },
      firstAid
    });
  } catch (error) {
    console.error('Injury analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze injury' });
  }
};

/**
 * Get first-aid steps for injury type
 */
export const getFirstAid = async (req, res) => {
  try {
    const { injuryType } = req.params;
    
    if (!injuryType) {
      return res.status(400).json({ error: 'Injury type is required' });
    }
    
    // Check database first
    const guide = await prisma.firstAidGuide.findUnique({
      where: { injuryType: injuryType.toUpperCase() }
    });
    
    if (guide) {
      return res.json({ firstAid: guide });
    }
    
    // Fall back to service
    const firstAid = await getFirstAidSteps(injuryType.toUpperCase());
    
    res.json({ firstAid });
  } catch (error) {
    console.error('Get first-aid error:', error);
    res.status(500).json({ error: 'Failed to fetch first-aid steps' });
  }
};

/**
 * Get emergency guidance from symptoms
 */
export const getEmergencyGuidance = async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms are required' });
    }
    
    const guidance = await generateEmergencyGuidance(symptoms);
    
    res.json({ guidance });
  } catch (error) {
    console.error('Emergency guidance error:', error);
    res.status(500).json({ error: 'Failed to generate guidance' });
  }
};

/**
 * Get all first-aid guides
 */
export const getAllFirstAidGuides = async (req, res) => {
  try {
    const guides = await prisma.firstAidGuide.findMany({
      orderBy: { title: 'asc' }
    });
    
    res.json({ guides });
  } catch (error) {
    console.error('Get all guides error:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
};

export default {
  analyzeInjuryImage,
  getFirstAid,
  getEmergencyGuidance,
  getAllFirstAidGuides
};
