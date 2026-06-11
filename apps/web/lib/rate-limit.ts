import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazily initialized — only created when Upstash env vars present
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}

// Rate limiter factory — returns null if Upstash not configured (dev without Redis)
function createLimiter(requests: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: "freebase:rl",
    analytics: false,
  });
}

// Per-type limiters — lazily instantiated
let publicReadLimiter: Ratelimit | null | undefined;
let postSubmitLimiter: Ratelimit | null | undefined;
let voteLimiter: Ratelimit | null | undefined;
let apiKeyLimiter: Ratelimit | null | undefined;
let adminLimiter: Ratelimit | null | undefined;
let widgetIdentifyLimiter: Ratelimit | null | undefined;

export function getPublicReadLimiter() {
  if (publicReadLimiter === undefined) publicReadLimiter = createLimiter(120, "1 m");
  return publicReadLimiter;
}

export function getPostSubmitLimiter() {
  if (postSubmitLimiter === undefined) postSubmitLimiter = createLimiter(5, "10 m");
  return postSubmitLimiter;
}

export function getVoteLimiter() {
  if (voteLimiter === undefined) voteLimiter = createLimiter(10, "10 m");
  return voteLimiter;
}

export function getApiKeyLimiter() {
  if (apiKeyLimiter === undefined) apiKeyLimiter = createLimiter(300, "1 m");
  return apiKeyLimiter;
}

export function getAdminLimiter() {
  if (adminLimiter === undefined) adminLimiter = createLimiter(200, "1 m");
  return adminLimiter;
}

export function getWidgetIdentifyLimiter() {
  if (widgetIdentifyLimiter === undefined) widgetIdentifyLimiter = createLimiter(60, "1 m");
  return widgetIdentifyLimiter;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

// Standard rate limit response headers
export function rateLimitHeaders(limit: number, remaining: number, reset: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.floor(reset / 1000)),
  };
}
