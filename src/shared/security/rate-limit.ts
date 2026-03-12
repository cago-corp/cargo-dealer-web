type RateLimitRule = {
  windowMs: number;
  maxRequests: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

declare global {
  var __cargoWebRateLimitStore__: Map<string, RateLimitEntry> | undefined;
}

const rateLimitStore = globalThis.__cargoWebRateLimitStore__ ?? new Map<string, RateLimitEntry>();

if (!globalThis.__cargoWebRateLimitStore__) {
  globalThis.__cargoWebRateLimitStore__ = rateLimitStore;
}

export function checkRateLimit(request: Request, key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  const clientKey = `${key}:${getClientAddress(request)}`;
  const current = rateLimitStore.get(clientKey);

  if (!current || current.resetAt <= now) {
    const resetAt = now + rule.windowMs;
    rateLimitStore.set(clientKey, {
      count: 1,
      resetAt,
    });

    return {
      ok: true,
      limit: rule.maxRequests,
      remaining: Math.max(rule.maxRequests - 1, 0),
      resetAt,
      retryAfterSeconds: Math.ceil(rule.windowMs / 1000),
    };
  }

  const nextCount = current.count + 1;
  rateLimitStore.set(clientKey, {
    count: nextCount,
    resetAt: current.resetAt,
  });

  const remaining = Math.max(rule.maxRequests - nextCount, 0);
  const retryAfterSeconds = Math.max(Math.ceil((current.resetAt - now) / 1000), 1);

  return {
    ok: nextCount <= rule.maxRequests,
    limit: rule.maxRequests,
    remaining,
    resetAt: current.resetAt,
    retryAfterSeconds,
  };
}

export function getRateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
    "Retry-After": String(result.retryAfterSeconds),
  };
}

function getClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const forwarded = forwardedFor
      .split(",")
      .map((item) => item.trim())
      .find(Boolean);

    if (forwarded) {
      return forwarded;
    }
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}
