import express from "express";
import {
  submitProblemStatement,
  getMyProblemStatements,
  getProblemStatementById,
  getAllProblemStatements,
  updateProblemStatementStatus,
} from "../controllers/problemStatement.controller.js";
import { protectRoute, protectAdminRoute } from "../middleware/auth.middleware.js";
import { upload } from "../lib/upload.js";

const router = express.Router();

// User routes
router.post(
  "/submit",
  protectRoute,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "reports", maxCount: 10 },
  ]),
  submitProblemStatement
);

router.get("/my-submissions", protectRoute, getMyProblemStatements);
router.get("/:id", protectRoute, getProblemStatementById);

// Admin routes
router.get("/admin/all", protectAdminRoute, getAllProblemStatements);
router.put("/admin/:id/status", protectAdminRoute, updateProblemStatementStatus);

export default router;
