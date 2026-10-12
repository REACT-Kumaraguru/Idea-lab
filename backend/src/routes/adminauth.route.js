import express from "express";
import {
  login,
  logout,
  checkAuth,
  createAdmin,
  listAdmins,
  changeAdminPassword,
  deleteAdmin,
} from "../controllers/authAdmin.controller.js";
import { protectAdminRoute } from "../middleware/auth.middleware.js";
import { checkAccountLockout } from "../middleware/accountLockout.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/login", checkAccountLockout, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/check", protectAdminRoute, checkAuth);
router.post("/create", protectAdminRoute, createAdmin);
router.get("/list", protectAdminRoute, listAdmins);
router.put("/:id/password", protectAdminRoute, changeAdminPassword);
router.delete("/:id", protectAdminRoute, deleteAdmin);

export default router;