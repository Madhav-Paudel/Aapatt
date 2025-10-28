import { Router } from 'express';
import { createEmergencyRequest, getRequest, acceptRequest } from '../controllers/requestController.js';

export function createRouter(io) {
  const router = Router();

  router.post('/', (req, res) => createEmergencyRequest(req, res, io));
  router.get('/:id', (req, res) => getRequest(req, res));
  router.post('/:id/accept', (req, res) => acceptRequest(req, res, io));

  return router;
}
