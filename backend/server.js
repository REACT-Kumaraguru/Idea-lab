import express from "express";
import { ENV } from "./src/lib/env.js";
import authRoutes from "./src/routes/auth.route.js";
import adminAuthRoutes from "./src/routes/adminauth.route.js";
import equipmentRoutes from "./src/routes/equipment.route.js";
import cookieParser from "cookie-parser";

import { setupAssociations } from './src/models/associations.js';
import cors from "cors";
import { connectDB } from "./src/lib/db.js";

const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

setupAssociations(); 

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/equipment", equipmentRoutes);

app.use("/src/uploads", express.static("src/uploads"));

app.listen(ENV.PORT, () => {
  console.log("server is running on PORT:" + ENV.PORT);
  connectDB();
});