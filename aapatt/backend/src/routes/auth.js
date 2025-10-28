import { Router } from 'express';
import { providerLogin } from '../controllers/authController.js';

export function createRouter() {
  const router = Router();
  router.post('/provider/login', providerLogin);
  return router;
}
