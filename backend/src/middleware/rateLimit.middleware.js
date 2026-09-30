import { ENV } from "../lib/env.js";

const getClientIp = (req) => {
  if (req.ip) return req.ip;
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return String(forwarded).split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "global";
};

/**
 * In-memory sliding window rate limiter.
 * Zero external dependencies, self-cleaning, IP/Key aware, bounded memory.
 */
class MemoryRateLimiter {
  constructor({ windowMs, max, message, keyGenerator, maxKeys = 20000 }) {
    this.windowMs = windowMs;
    this.max = max;
    this.maxKeys = maxKeys;
    this.message = message || "Too many requests, please try again later.";
    this.keyGenerator = keyGenerator || getClientIp;
    this.hits = new Map();

    // Periodic cleanup of expired records every minute to prevent memory leaks
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.hits.entries()) {
        if (record.resetTime <= now) {
          this.hits.delete(key);
        }
      }
    }, 60000).unref();
  }

  middleware() {
    return (req, res, next) => {
      // In test/dev environment, optionally relax or bypass if configured
      if (process.env.DISABLE_RATE_LIMIT === "true") return next();

      // Enforce map boundary to prevent memory exhaustion
      if (this.hits.size > this.maxKeys) {
        const now = Date.now();
        for (const [k, r] of this.hits.entries()) {
          if (r.resetTime <= now) this.hits.delete(k);
        }
        if (this.hits.size > this.maxKeys) {
          this.hits.clear();
        }
      }

      const key = this.keyGenerator(req);
      const now = Date.now();
      let record = this.hits.get(key);

      if (!record || record.resetTime <= now) {
        record = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.hits.set(key, record);
      } else {
        record.count += 1;
      }

      const remaining = Math.max(0, this.max - record.count);
      const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader("RateLimit-Limit", this.max);
      res.setHeader("RateLimit-Remaining", remaining);
      res.setHeader("RateLimit-Reset", resetSeconds);

      if (record.count > this.max) {
        res.setHeader("Retry-After", resetSeconds);
        return res.status(429).json({
          error: "Too Many Requests",
          message: this.message,
          retryAfter: resetSeconds,
        });
      }

      next();
    };
  }
}

const isDev = ENV.NODE_ENV !== "production";

// 1. Auth endpoints: 15 min window
export const authRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 40 : 10,
  message: "Too many login/registration attempts from this IP. Please try again after 15 minutes.",
}).middleware();

// 2. OTP endpoints: 15 min window
export const otpRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 30 : 10,
  message: "Too many OTP verification attempts. Please wait 15 minutes before trying again.",
}).middleware();

// 3. General API limiter: 1 min window
export const apiRateLimiter = new MemoryRateLimiter({
  windowMs: 60 * 1000,
  max: isDev ? 600 : 150,
  message: "API rate limit exceeded. Please slow down your requests.",
}).middleware();

// 4. File upload limiter: 1 hour window
export const uploadRateLimiter = new MemoryRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 60 : 15,
  keyGenerator: (req) => String(req.session?.hackathonUser?.id || req.session?.user?.id || req.ip || "anon"),
  message: "File upload rate limit reached. Please wait before uploading more files.",
}).middleware();
