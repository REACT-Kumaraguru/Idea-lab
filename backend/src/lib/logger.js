/**
 * Production-ready zero-external-dependency Structured Logger
 * Conforms to 12-factor app logging standards (stdout/stderr).
 * Outputs formatted strings in development and structured JSON in production.
 */

const isProd = process.env.NODE_ENV === "production";

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = isProd ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  if (isProd) {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  }

  const prefix = `[${timestamp}] [${level}]`;
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
  return `${prefix} ${message}${metaStr}`;
}

export const logger = {
  debug(message, meta) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug(formatLog("DEBUG", message, meta));
    }
  },
  info(message, meta) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.log(formatLog("INFO", message, meta));
    }
  },
  warn(message, meta) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatLog("WARN", message, meta));
    }
  },
  error(message, meta) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(formatLog("ERROR", message, meta));
    }
  },
};

export default logger;
