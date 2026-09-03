'use strict';

function createRateLimiter(options) {
  const windowMs = options.windowMs;
  const max = options.max;
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of hits) {
      if (now - value.start >= windowMs) hits.delete(key);
    }
  }, windowMs).unref();

  return function rateLimiter(req, res, next) {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let record = hits.get(key);
    if (!record || now - record.start >= windowMs) {
      record = { start: now, count: 0 };
      hits.set(key, record);
    }
    record.count += 1;
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - record.count)));
    if (record.count > max) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    return next();
  };
}

module.exports = createRateLimiter;
