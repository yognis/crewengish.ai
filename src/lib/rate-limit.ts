// Simple in-memory rate limiter (good for MVP, single-instance deployment)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60_000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  // Occasionally sweep expired entries to keep the map small.
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimit.entries()) {
      if (value.resetTime < now) {
        rateLimit.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    const resetTime = now + windowMs;
    rateLimit.set(identifier, { count: 1, resetTime });
    return { success: true, remaining: limit - 1, resetTime };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
