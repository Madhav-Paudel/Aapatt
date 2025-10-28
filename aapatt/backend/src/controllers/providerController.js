import { prisma } from '../services/databaseService.js';
import { emitToRequest } from '../services/socketService.js';

export async function listNearbyProviders(req, res) {
  const { type } = req.query;
  if (!type) return res.status(400).json({ error: 'type required' });
  const list = await prisma.provider.findMany({ where: { type, isOnline: true }, take: 20 });
  return res.json(list);
}

export async function updateProviderStatus(req, res) {
  const { isOnline, latitude, longitude } = req.body;
  const id = req.params.id;
  const updated = await prisma.provider.update({ where: { id }, data: { isOnline, latitude, longitude } });
  return res.json(updated);
}

export async function postProviderLocation(req, res, io) {
  const id = req.params.id;
  const { requestId, latitude, longitude } = req.body;
  await prisma.provider.update({ where: { id }, data: { latitude, longitude } });
  if (requestId) emitToRequest(io, requestId, 'provider:location', { providerId: id, latitude, longitude });
  return res.json({ ok: true });
}
