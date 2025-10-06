import { prisma } from '../services/databaseService.js';
import { emitToRequest } from '../services/socketService.js';
import { getEtaSeconds } from '../services/locationService.js';

export async function createEmergencyRequest(req, res, io) {
  try {
    const { type, latitude, longitude, description, citizenId } = req.body;
    if (!['AMBULANCE', 'FIRE', 'AIR'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ error: 'Invalid coordinates' });

    const request = await prisma.request.create({
      data: { type, latitude, longitude, description, citizenId }
    });

    io.emit('request:created', { id: request.id, type, latitude, longitude });
    return res.json({ id: request.id, eta: null });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create request' });
  }
}

export async function getRequest(req, res) {
  const r = await prisma.request.findUnique({ where: { id: req.params.id } });
  if (!r) return res.status(404).json({ error: 'Not found' });
  return res.json(r);
}

export async function acceptRequest(req, res, io) {
  try {
    const { providerId } = req.body;
    const requestId = req.params.id;

    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!provider || !request) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.request.update({ where: { id: requestId }, data: { providerId, status: 'ACCEPTED' } });

    let etaSeconds = null;
    if (provider.latitude && provider.longitude) {
      etaSeconds = await getEtaSeconds(
        { latitude: provider.latitude, longitude: provider.longitude },
        { latitude: request.latitude, longitude: request.longitude }
      );
    }

    emitToRequest(io, requestId, 'request:accepted', { providerId, etaSeconds });
    return res.json({ ...updated, etaSeconds });
  } catch (e) {
    return res.status(400).json({ error: 'Cannot accept request' });
  }
}
