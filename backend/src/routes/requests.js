/**
 * Emergency Request Routes
 */

import express from 'express';
import {
  createRequest,
  getRequest,
  getUserRequests,
  updateRequestStatus,
  cancelRequest
} from '../controllers/requestController.js';
import { authenticate } from '../middleware/auth.js';
import { validateEmergencyRequest, validateUUID } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new emergency request
router.post('/', validateEmergencyRequest, createRequest);

// Get user's requests
router.get('/user/me', getUserRequests);

// Get specific request
router.get('/:id', validateUUID, getRequest);

// Update request status
router.put('/:id/status', validateUUID, updateRequestStatus);

// Cancel request
router.post('/:id/cancel', validateUUID, cancelRequest);

export default router;
