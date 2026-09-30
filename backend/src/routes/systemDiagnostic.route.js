import express from "express";
import {
  getMainSystemDiagnostics,
  runMainAutoUpdates,
  createMainDbSnapshot,
  listMainDbSnapshots,
  restoreMainDbSnapshot,
} from "../controllers/systemDiagnostic.controller.js";
import { protectAdminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectAdminRoute, getMainSystemDiagnostics);
router.post("/auto-update", protectAdminRoute, runMainAutoUpdates);
router.post("/db-snapshot", protectAdminRoute, createMainDbSnapshot);
router.get("/db-snapshots", protectAdminRoute, listMainDbSnapshots);
router.post("/db-snapshot/restore", protectAdminRoute, restoreMainDbSnapshot);

export default router;
