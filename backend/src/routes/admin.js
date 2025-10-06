/**
 * Admin Routes
 */

import express from 'express';
import {
  getDashboardStats,
  getAllRequests,
  getAllProviders,
  verifyProvider,
  assignRequest,
  getAnalytics
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireRole(['ADMIN']));

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Analytics
router.get('/analytics', getAnalytics);

// Requests management
router.get('/requests', getAllRequests);
router.post('/requests/:id/assign', validateUUID, assignRequest);

// Provider management
router.get('/providers', getAllProviders);
router.put('/providers/:id/verify', validateUUID, verifyProvider);

export default router;
