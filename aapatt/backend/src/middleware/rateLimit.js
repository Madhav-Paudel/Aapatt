const buckets = new Map();

export function simpleRateLimit({ limit = 60, windowMs = 60_000 } = {}) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count++;
    buckets.set(key, bucket);
    if (bucket.count > limit) {
      return res.status(429).json({ error: 'Too Many Requests' });
    }
    next();
  };
}
