import rateLimit from 'express-rate-limit';

// Rate limiter for report endpoint
// Allow 2 reports per minute per IP (since pNodes report every 60 seconds)
export const reportRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // 2 requests per minute per IP
  message: {
    ok: false,
    error: 'Too many reports from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind proxy, otherwise use IP
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
           req.ip || 
           'unknown';
  },
});

// Rate limiter for stats endpoint (more generous)
// Allow 60 requests per minute per IP
export const statsRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    ok: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});



