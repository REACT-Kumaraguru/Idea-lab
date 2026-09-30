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
import { otpRateLimiter } from "../middleware/rateLimit.middleware.js";
import { checkAccountLockout } from "../middleware/accountLockout.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
  otpRequestSchema,
  otpVerifySchema,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/send-register-otp", otpRateLimiter, validate(otpRequestSchema), sendRegisterOtp);
router.post("/verify-register-otp", otpRateLimiter, validate(otpVerifySchema), verifyRegisterOtp);
router.post("/register", validate(registerSchema), register);

router.post("/send-reset-otp", otpRateLimiter, validate(otpRequestSchema), sendResetOtp);
router.post("/verify-reset-otp", otpRateLimiter, validate(otpVerifySchema), verifyResetOtp);
router.post("/reset-password", resetPassword);

router.post("/signup", validate(registerSchema), signup);
router.post("/login", checkAccountLockout, validate(loginSchema), login);
router.post("/logout", logout);

router.get("/check", protectRoute, checkAuth);

export default router;
