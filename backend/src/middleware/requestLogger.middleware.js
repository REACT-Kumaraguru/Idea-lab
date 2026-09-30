import { logger } from "../lib/logger.js";

export function requestLogger(req, res, next) {
  const start = Date.now();
  const method = req.method;
  const path = req.originalUrl || req.url;

  // Skip logging high-frequency static asset queries
  if (path.startsWith("/src/uploads") || path === "/health/live" || path === "/favicon.ico") {
    return next();
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

    logger[level](`${method} ${path} -> ${statusCode} (${duration}ms)`, {
      method,
      path,
      statusCode,
      durationMs: duration,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"] ? req.headers["user-agent"].substring(0, 100) : undefined,
    });
  });

  next();
}

export default requestLogger;
