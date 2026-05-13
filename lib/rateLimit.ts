import type { NextApiRequest, NextApiResponse } from 'next';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Simple in-memory rate limiter for Next.js API routes.
 * @param limit - Max requests per window
 * @param windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns middleware function that returns true if rate limited
 */
export function rateLimit(limit: number = 10, windowMs: number = 60 * 1000) {
  return (req: NextApiRequest, res: NextApiResponse): boolean => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || 'unknown';
    const key = `${ip}:${req.url}`;
    const now = Date.now();

    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    entry.count++;

    if (entry.count > limit) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return true;
    }

    return false;
  };
}
