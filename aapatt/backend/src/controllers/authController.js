import { ensureFirebase } from '../services/firebaseService.js';
import { getAuth } from 'firebase-admin/auth';

export async function providerLogin(req, res) {
  try {
    ensureFirebase();
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });
    const decoded = await getAuth().verifyIdToken(idToken);
    return res.json({ uid: decoded.uid });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
