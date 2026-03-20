import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

import { ENV } from "./src/lib/env.js";
import authRoutes from "./src/routes/auth.route.js";
import adminAuthRoutes from "./src/routes/adminauth.route.js";
import equipmentRoutes from "./src/routes/equipment.route.js";
import bookingRoutes from "./src/routes/Booking.routes.js";
import problemStatementRoutes from "./src/routes/problemStatement.route.js";
import hackathonRoutes from "./src/routes/hackathon/hackathon.route.js";
import { setupAssociations } from "./src/models/associations.js";
import { connectDB } from "./src/lib/db.js";
import { ensureDefaultAdmin } from "./src/scripts/ensureDefaultAdmin.js";
import { ensureDefaultHackathonAdmin } from "./src/scripts/ensureDefaultHackathonAdmin.js";

const app = express();
const PgSession = connectPgSimple(session);

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

app.use(
  session({
    store: new PgSession({
      conObject: {
        connectionString: ENV.DATABASE_URL,
      },
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure:  ENV.NODE_ENV === "production" && !ENV.CLIENT_URL?.includes("localhost"),
      httpOnly: true,
      sameSite: "strict",
    },
  })
);

setupAssociations();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/problems", problemStatementRoutes);

// Hackathon module (isolated, additive)
app.use("/hackathon", hackathonRoutes);
app.use("/api/hackathon", hackathonRoutes);

app.use("/src/uploads", express.static("src/uploads"));

const startServer = async () => {
  await connectDB();
  await ensureDefaultAdmin();
  await ensureDefaultHackathonAdmin();
  const HOST = process.env.HOST || "0.0.0.0";
  app.listen(ENV.PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${ENV.PORT}`);
    console.log(`Client URL: ${ENV.CLIENT_URL}`);
  });
};

startServer();
