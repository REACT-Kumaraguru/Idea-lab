import express from "express";
import { login, logout, checkAuth, createAdmin } from "../controllers/authAdmin.controller.js";
import { protectAdminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/check", protectAdminRoute, checkAuth);
router.post("/create", protectAdminRoute, createAdmin);

export default router;