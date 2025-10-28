import { Router } from 'express';
import { analyzeInjury } from '../controllers/aiController.js';

export function createRouter() {
  const router = Router();
  router.post('/analyze', analyzeInjury);
  return router;
}
