/**
 * Simple in-memory rate limiter.
 * Uses a sliding window per IP. Resets on server restart (sufficient for dev/small prod).
 * For high-scale: swap for Upstash Redis rate limiting.
 */

interface RateLimitEntry {
  count:     number;
  resetAt:   number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  maxRequests = 5,
  windowMs    = 60_000   // 1 minute
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
}

// Clean up expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store.entries()) {
    if (now > val.resetAt) store.delete(key);
  }
}, 300_000);
