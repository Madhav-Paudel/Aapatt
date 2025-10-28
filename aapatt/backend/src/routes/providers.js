import { Router } from 'express';
import { listNearbyProviders, updateProviderStatus, postProviderLocation } from '../controllers/providerController.js';

export function createRouter(io) {
  const router = Router();

  router.get('/nearby', (req, res) => listNearbyProviders(req, res));
  router.patch('/:id/status', (req, res) => updateProviderStatus(req, res));
  router.post('/:id/location', (req, res) => postProviderLocation(req, res, io));

  return router;
}
