import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req, res, _next) {
  res.status(404).json({ message: "Not found" });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error("[error]", err);
  const status = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(status >= 400 ? status : 500).json({ message });
}
