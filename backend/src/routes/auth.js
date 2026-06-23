import express from "express";
import {
  sendRegisterOtp,
  verifyRegisterOtp,
  register,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
  signup,
  login,
  logout,
  checkAuth,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send-register-otp", sendRegisterOtp);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post("/register", register);

router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check", protectRoute, checkAuth);

export default router;
