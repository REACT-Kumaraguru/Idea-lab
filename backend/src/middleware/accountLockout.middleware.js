/**
 * In-memory Account Lockout Tracker.
 * Locks an account for 15 minutes after 5 consecutive failed login attempts.
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const failedAttemptsMap = new Map();

// Periodic cleanup of expired lockouts every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of failedAttemptsMap.entries()) {
    if (record.lockedUntil && record.lockedUntil <= now) {
      failedAttemptsMap.delete(email);
    } else if (record.lastAttempt && now - record.lastAttempt > LOCKOUT_DURATION_MS) {
      failedAttemptsMap.delete(email);
    }
  }
}, 120000).unref();

export function checkAccountLockout(req, res, next) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email) return next();

  const record = failedAttemptsMap.get(email);
  const now = Date.now();

  if (record && record.lockedUntil && record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return res.status(423).json({
      error: "Account Locked",
      message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      locked: true,
      retryAfterMinutes: remainingMinutes,
    });
  }

  next();
}

export function recordFailedLogin(email) {
  if (!email) return;
  const normalized = String(email).trim().toLowerCase();
  const now = Date.now();
  const record = failedAttemptsMap.get(normalized) || { count: 0, lastAttempt: now, lockedUntil: null };

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    console.warn(`[SECURITY] Account locked for 15m after ${record.count} failed attempts: ${normalized}`);
  }

  failedAttemptsMap.set(normalized, record);
}

export function clearFailedLogin(email) {
  if (!email) return;
  failedAttemptsMap.delete(String(email).trim().toLowerCase());
}
