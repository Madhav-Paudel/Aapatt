export function requireAuth(req, res, next) {
  // TODO: integrate JWT or Firebase session if needed; allow all for MVP
  next();
}
