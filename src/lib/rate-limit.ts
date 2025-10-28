import { EXAM_CONSTANTS } from "@/constants/exam";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

const SWEEP_PROBABILITY = 0.01;
const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  limit: number = EXAM_CONSTANTS.RATE_LIMIT_REQUESTS,
  windowMs: number = EXAM_CONSTANTS.RATE_LIMIT_WINDOW_MS,
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (Math.random() < SWEEP_PROBABILITY) {
    rateLimitMap.forEach((value, key) => {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    });
  }

  if (!entry || entry.resetTime < now) {
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      remaining: limit - 1,
      resetTime,
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count += 1;
  rateLimitMap.set(identifier, entry);

  return {
    success: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}
