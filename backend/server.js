import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { ENV } from "./src/lib/env.js";
import authRoutes from "./src/routes/auth.route.js";
import adminAuthRoutes from "./src/routes/adminauth.route.js";
import equipmentRoutes from "./src/routes/equipment.route.js";
import bookingRoutes from "./src/routes/Booking.routes.js";
import problemStatementRoutes from "./src/routes/problemStatement.route.js";
import { setupAssociations } from "./src/models/associations.js";
import { connectDB } from "./src/lib/db.js";
import { ensureDefaultAdmin } from "./src/scripts/ensureDefaultAdmin.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

const allowedOrigins = [ENV.CLIENT_URL].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

setupAssociations();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/problems", problemStatementRoutes);

app.use("/src/uploads", express.static("src/uploads"));

const startServer = async () => {
  await connectDB();
  await ensureDefaultAdmin();
  const HOST = process.env.HOST || "0.0.0.0";
  app.listen(ENV.PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${ENV.PORT}`);
    console.log(`Client URL: ${ENV.CLIENT_URL}`);
  });
};

startServer();