/**
 * AI First-Aid Routes
 */

import express from 'express';
import {
  analyzeInjuryImage,
  getFirstAid,
  getEmergencyGuidance,
  getAllFirstAidGuides
} from '../controllers/aiController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Analyze injury image (requires auth)
router.post('/analyze-injury', authenticate, analyzeInjuryImage);

// Get emergency guidance from symptoms
router.post('/guidance', authenticate, getEmergencyGuidance);

// Get first-aid steps (public or authenticated)
router.get('/first-aid/:injuryType', optionalAuth, getFirstAid);

// Get all first-aid guides (public)
router.get('/first-aid', getAllFirstAidGuides);

export default router;
