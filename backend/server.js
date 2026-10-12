import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { ENV } from "./src/lib/env.js";
import { createSessionMiddleware } from "./src/config/session.js";
import authRoutes from "./src/routes/auth.js";
import { errorHandler, notFoundHandler } from "./src/middleware/error.middleware.js";
import adminAuthRoutes from "./src/routes/adminauth.route.js";
import equipmentRoutes from "./src/routes/equipment.route.js";
import bookingRoutes from "./src/routes/Booking.routes.js";
import problemStatementRoutes from "./src/routes/problemStatement.route.js";
import hackathonRoutes from "./src/routes/hackathon/hackathon.route.js";
import filesRoutes from "./src/routes/files.route.js";
import systemDiagnosticRoutes from "./src/routes/systemDiagnostic.route.js";
import HackathonRegistration from "./src/models/hackathon/HackathonRegistrationModel.js";
import HackathonAnnouncement from "./src/models/hackathon/HackathonAnnouncementModel.js";
import { setupAssociations } from "./src/models/associations.js";
import { setupHackathonAssociations } from "./src/models/hackathon/associations.js";
import { connectDB, sequelize } from "./src/lib/db.js";
import { ensureDefaultAdmin } from "./src/scripts/ensureDefaultAdmin.js";
import { ensureDefaultStudent } from "./src/scripts/ensureDefaultStudent.js";
import { ensureDefaultHackathonAdmin } from "./src/scripts/ensureDefaultHackathonAdmin.js";
import { ensureHackathonUserColumns } from "./src/scripts/ensureHackathonUserColumns.js";
import { ensureHackathonAdminMentorPasswords } from "./src/scripts/ensureHackathonAdminMentorPasswords.js";
import { closeOtpEmailQueue } from "./src/queue/queue.js";
import { verifyMailTransport } from "./src/lib/mailTransport.js";
import cookieParser from "cookie-parser";
import { ensureHackathonColumns } from "./src/scripts/ensureHackathonColumns.js";
import { ensurePerformanceIndexes } from "./src/scripts/ensurePerformanceIndexes.js";
import { ensureDummyTeam } from "./src/scripts/ensureDummyTeam.js";
import { ensureLabEquipments } from "./src/scripts/ensureLabEquipments.js";
import { ensureEquipmentFields } from "./src/scripts/ensureEquipmentFields.js";
import { apiRateLimiter, authRateLimiter } from "./src/middleware/rateLimit.middleware.js";
import { csrfTokenProvider, verifyCsrfToken } from "./src/middleware/csrf.middleware.js";
import requestLogger from "./src/middleware/requestLogger.middleware.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helmet Content Security Policy & Security Headers (Phase 2)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: [
          "'self'",
          "http://localhost:*",
          "ws://localhost:*",
          "https://*.kct.ac.in",
        ],
        frameSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginResourcePolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xContentTypeOptions: true,
    strictTransportSecurity:
      ENV.NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
  })
);

// Permissions-Policy header (allows camera for QR scanner)
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=(), payment=()"
  );
  next();
});

// Whitelist-based CORS configuration
const allowedOrigins = [
  "http://localhost:5205",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5003",
  "http://127.0.0.1:5205",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5003",
];
if (ENV.CLIENT_URL) {
  allowedOrigins.push(ENV.CLIENT_URL.replace(/\/$/, ""));
}

const KCT_ORIGIN_REGEX = /^https?:\/\/([a-zA-Z0-9-]+\.)*kct\.ac\.in(:\d+)?$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server or direct tools)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || KCT_ORIGIN_REGEX.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

if (!ENV.SESSION_SECRET) {
  if (ENV.NODE_ENV === "production") {
    throw new Error("CRITICAL SECURITY ERROR: SESSION_SECRET must be explicitly set in production!");
  }
  ENV.SESSION_SECRET = "development-secret-key-12345";
}

app.set("trust proxy", 1);

app.use(requestLogger);
app.use(cookieParser());
app.use(createSessionMiddleware());
app.use(csrfTokenProvider);

// Endpoint to fetch / refresh CSRF token
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.session?.csrfToken });
});

// Apply global API rate limiter
app.use(apiRateLimiter);

// Protect mutating API requests with CSRF verification
app.use("/api", verifyCsrfToken);
app.use("/ich2026", verifyCsrfToken);

setupAssociations();
setupHackathonAssociations();

app.get("/", (req, res) => {
  res.json({ message: "Idea Lab Hackathon Backend API is running", status: "OK" });
});

// Observability & Health Probes (Phase 8.2)
app.get(["/health", "/api/health"], (req, res) => {
  res.json({
    status: "UP",
    uptime: process.uptime(),
    version: "5.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get(["/health/live", "/api/health/live"], (req, res) => {
  res.status(200).json({ status: "alive" });
});

app.get(["/health/ready", "/api/health/ready"], async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: "ready",
      database: "connected",
      dialect: sequelize.getDialect(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: err.message,
    });
  }
});

if (process.env.UPLOADS_DIR) {
  app.use("/uploads", express.static(path.resolve(process.env.UPLOADS_DIR)));
}
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));
app.use("/src/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

// Main portal system health & diagnostic routes (must be mounted before general /api/admin)
app.use("/api/admin/system-diagnostic", apiRateLimiter, systemDiagnosticRoutes);
app.use("/api/system-diagnostic", apiRateLimiter, systemDiagnosticRoutes);

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/admin", authRateLimiter, adminAuthRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/problems", problemStatementRoutes);
app.use("/api/files", filesRoutes);

// Hackathon module (isolated, additive)
// Hackathon 2026 routes live under `/ich2026/*` (and `/api/ich2026/*` for API calls).
app.use("/ich2026", hackathonRoutes);
app.use("/api/ich2026", hackathonRoutes);

// Forward legacy /download/hackathon/:filename to the secured API route
app.get("/download/hackathon/:filename", (req, res) => {
  res.redirect(307, `/api/ich2026/download/hackathon/${encodeURIComponent(req.params.filename)}`);
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await HackathonRegistration.sync().catch(() => {});
  await HackathonAnnouncement.sync().catch(() => {});
  await ensureHackathonUserColumns({ sequelize });
  await ensureHackathonColumns({ sequelize });
  await ensurePerformanceIndexes({ sequelize });
  await ensureDefaultAdmin();
  await ensureDefaultStudent();
  await ensureDefaultHackathonAdmin();
  await ensureHackathonAdminMentorPasswords();
  await ensureDummyTeam();
  await ensureEquipmentFields();
  await ensureLabEquipments();
  await verifyMailTransport();
  const HOST = process.env.HOST || "0.0.0.0";
  app.listen(ENV.PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${ENV.PORT}`);
    console.log(`Client URL: ${ENV.CLIENT_URL}`);
  });
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}, closing...`);
  try {
    await closeOtpEmailQueue();
  } catch (e) {
    console.error("Queue close:", e.message);
  }
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
