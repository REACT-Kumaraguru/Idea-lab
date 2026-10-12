import crypto from "crypto";
import { ENV } from "../lib/env.js";

export const CSRF_COOKIE_NAME = "XSRF-TOKEN";

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Ensures req.session has a csrfToken and sets the readable XSRF-TOKEN cookie.
 */
export function csrfTokenProvider(req, res, next) {
  if (req.session) {
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCsrfToken();
    }
    const isProd = ENV.NODE_ENV === "production" && !ENV.CLIENT_URL?.includes("localhost");
    res.cookie(CSRF_COOKIE_NAME, req.session.csrfToken, {
      httpOnly: false, // Read by Axios on the client
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });
  }
  next();
}

/**
 * Validates CSRF token on mutating requests (POST, PUT, PATCH, DELETE).
 */
export function verifyCsrfToken(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  if (process.env.DISABLE_CSRF === "true") {
    return next();
  }

  const sessionToken = req.session?.csrfToken;
  const clientToken =
    req.headers["x-csrf-token"] ||
    req.headers["x-xsrf-token"] ||
    req.body?._csrf;

  if (!sessionToken || !clientToken) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Missing CSRF token. Please reload the page.",
      code: "EBADCSRFTOKEN",
    });
  }

  try {
    const sessionBuffer = Buffer.from(sessionToken, "utf8");
    const clientBuffer = Buffer.from(String(clientToken), "utf8");

    if (sessionBuffer.length !== clientBuffer.length || !crypto.timingSafeEqual(sessionBuffer, clientBuffer)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Invalid or expired CSRF security token.",
        code: "EBADCSRFTOKEN",
      });
    }
  } catch {
    return res.status(403).json({
      error: "Forbidden",
      message: "CSRF token validation failed.",
      code: "EBADCSRFTOKEN",
    });
  }

  next();
}
