import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./src/lib/env.js";
import { createSessionMiddleware } from "./src/config/session.js";
import authRoutes from "./src/routes/auth.js";
import { errorHandler, notFoundHandler } from "./src/middleware/error.middleware.js";
import adminAuthRoutes from "./src/routes/adminauth.route.js";
import equipmentRoutes from "./src/routes/equipment.route.js";
import bookingRoutes from "./src/routes/Booking.routes.js";
import problemStatementRoutes from "./src/routes/problemStatement.route.js";
import hackathonRoutes from "./src/routes/hackathon/hackathon.route.js";
import { setupAssociations } from "./src/models/associations.js";
import { connectDB, sequelize } from "./src/lib/db.js";
import { ensureDefaultAdmin } from "./src/scripts/ensureDefaultAdmin.js";
import { ensureDefaultHackathonAdmin } from "./src/scripts/ensureDefaultHackathonAdmin.js";
import { ensureHackathonUserColumns } from "./src/scripts/ensureHackathonUserColumns.js";

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

// Hackathon module (isolated, additive)
// Hackathon 2026 routes live under `/ich2026/*` (and `/api/ich2026/*` for API calls).
app.use("/ich2026", hackathonRoutes);
app.use("/api/ich2026", hackathonRoutes);

app.use("/src/uploads", express.static("src/uploads"));

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await ensureHackathonUserColumns({ sequelize });
  await ensureDefaultAdmin();
  await ensureDefaultHackathonAdmin();
  const HOST = process.env.HOST || "0.0.0.0";
  app.listen(ENV.PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${ENV.PORT}`);
    console.log(`Client URL: ${ENV.CLIENT_URL}`);
  });
};

startServer();
