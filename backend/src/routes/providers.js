/**
 * Provider Routes
 */

import express from 'express';
import {
  registerProvider,
  getProvider,
  updateProviderStatus,
  updateLocation,
  acceptRequest,
  declineRequest,
  getProviderRequests,
  getProviderStats
} from '../controllers/providerController.js';
import { authenticate, requireProvider } from '../middleware/auth.js';
import {
  validateProviderRegistration,
  validateLocationUpdate,
  validateUUID
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Register as provider
router.post('/register', validateProviderRegistration, registerProvider);

// Get provider profile
router.get('/:id', validateUUID, getProvider);

// Protected provider routes
router.put('/status', requireProvider, updateProviderStatus);
router.post('/location', requireProvider, validateLocationUpdate, updateLocation);
router.post('/accept', requireProvider, acceptRequest);
router.post('/decline', requireProvider, declineRequest);
router.get('/me/requests', requireProvider, getProviderRequests);
router.get('/me/stats', requireProvider, getProviderStats);

export default router;
