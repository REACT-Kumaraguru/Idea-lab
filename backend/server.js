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
import { setupAssociations } from "./src/models/associations.js";
import { connectDB, sequelize } from "./src/lib/db.js";
import { ensureDefaultAdmin } from "./src/scripts/ensureDefaultAdmin.js";
import { ensureDefaultHackathonAdmin } from "./src/scripts/ensureDefaultHackathonAdmin.js";
import { ensureHackathonUserColumns } from "./src/scripts/ensureHackathonUserColumns.js";
import { ensureHackathonAdminMentorPasswords } from "./src/scripts/ensureHackathonAdminMentorPasswords.js";
import { closeOtpEmailQueue } from "./src/queue/queue.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(helmet());

const allowedOrigins = (ENV.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

if (!ENV.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not configured");
}

app.set("trust proxy", 1);

app.use(createSessionMiddleware());

setupAssociations();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/problems", problemStatementRoutes);
app.use("/api/files", filesRoutes);

// Hackathon module (isolated, additive)
// Hackathon 2026 routes live under `/ich2026/*` (and `/api/ich2026/*` for API calls).
app.use("/ich2026", hackathonRoutes);
app.use("/api/ich2026", hackathonRoutes);

// Hackathon downloads (static mapping) — required for Nginx reverse proxy setups.
// Files are stored in: uploads/hackathon/
const hackathonUploadsDir = path.join(process.cwd(), "uploads", "hackathon");
app.use(
  "/api/ich2026/download/hackathon",
  express.static(hackathonUploadsDir, {
    fallthrough: false, // return 404 when not found (instead of continuing middleware chain)
    setHeaders: (res) => {
      // Force download in browsers.
      res.setHeader("Content-Disposition", "attachment");
    },
  })
);
// Backward-compatible public paths for previously stored URLs.
app.use("/api/uploads/hackathon", express.static(hackathonUploadsDir));
app.use("/uploads/hackathon", express.static(hackathonUploadsDir));

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await ensureHackathonUserColumns({ sequelize });
  await ensureDefaultAdmin();
  await ensureDefaultHackathonAdmin();
  await ensureHackathonAdminMentorPasswords();
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
