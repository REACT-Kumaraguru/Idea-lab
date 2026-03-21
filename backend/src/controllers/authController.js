import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";
import OtpCode from "../models/OtpCodeModel.js";
import { AppError } from "../utils/AppError.js";
import { generateOtp, getOtpExpiryDate } from "../utils/otp.js";
import { sendOtpEmail } from "../services/mailService.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const sendRegisterOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const [existing, hackathonExisting] = await Promise.all([
      User.findOne({ where: { email } }),
      HackathonUser.findOne({ where: { email } }),
    ]);
    if (existing || hackathonExisting) {
      throw new AppError("An account with this email already exists", 400);
    }

    await OtpCode.destroy({ where: { email, type: "register" } });

    const otp = generateOtp();
    const expiresAt = getOtpExpiryDate();

    await OtpCode.create({
      email,
      otp,
      type: "register",
      expiresAt,
    });

    await sendOtpEmail({ to: email, otp, purpose: "register" });

    res.status(200).json({ message: "Verification code sent to your email" });
  } catch (err) {
    next(err);
  }
};

export const verifyRegisterOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();
    if (!email || !otp) {
      throw new AppError("Email and OTP are required", 400);
    }

    const row = await OtpCode.findOne({
      where: { email, type: "register", otp },
    });

    if (!row || new Date(row.expiresAt) < new Date()) {
      throw new AppError("Invalid or expired verification code", 400);
    }

    await OtpCode.destroy({ where: { id: row.id } });

    req.session.registrationEmailVerified = email;

    res.status(200).json({ message: "Email verified. You can complete registration." });
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { password, fullName, phoneNumber, role } = req.body || {};

    if (!email || !password || !fullName || !phoneNumber) {
      throw new AppError("Email, password, full name, and phone number are required", 400);
    }

    if (req.session.registrationEmailVerified !== email) {
      throw new AppError("Email is not verified. Complete OTP verification first.", 403);
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    if (role && !["student", "external"].includes(role)) {
      throw new AppError("Role must be either student or external", 400);
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new AppError("An account with this email already exists", 400);
    }

    const phoneTaken = await User.findOne({ where: { phoneNumber } });
    if (phoneTaken) {
      throw new AppError("Phone number is already registered", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      passwordHash,
      role: role || "student",
      isVerified: true,
    });

    delete req.session.registrationEmailVerified;

    req.session.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

export const sendResetOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isVerified) {
      res.status(200).json({
        message: "If an account exists for this email, a reset code has been sent.",
      });
      return;
    }

    await OtpCode.destroy({ where: { email, type: "reset" } });

    const otp = generateOtp();
    const expiresAt = getOtpExpiryDate();

    await OtpCode.create({
      email,
      otp,
      type: "reset",
      expiresAt,
    });

    await sendOtpEmail({ to: email, otp, purpose: "reset" });

    res.status(200).json({
      message: "If an account exists for this email, a reset code has been sent.",
    });
  } catch (err) {
    next(err);
  }
};

export const verifyResetOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();
    if (!email || !otp) {
      throw new AppError("Email and OTP are required", 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user?.isVerified) {
      throw new AppError("Invalid or expired verification code", 400);
    }

    const row = await OtpCode.findOne({
      where: { email, type: "reset", otp },
    });

    if (!row || new Date(row.expiresAt) < new Date()) {
      throw new AppError("Invalid or expired verification code", 400);
    }

    await OtpCode.destroy({ where: { id: row.id } });

    req.session.resetPasswordEmail = email;

    res.status(200).json({ message: "Code verified. You can set a new password." });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { password } = req.body || {};

    if (!email || !password) {
      throw new AppError("Email and new password are required", 400);
    }

    if (req.session.resetPasswordEmail !== email) {
      throw new AppError("Reset session is invalid. Verify your code again.", 403);
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await user.update({ passwordHash });

    delete req.session.resetPasswordEmail;

    await OtpCode.destroy({
      where: {
        email,
        type: "reset",
      },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!fullName || !normalizedEmail || !password || !phoneNumber) {
      throw new AppError("All fields are required", 400);
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    if (role && !["student", "external"].includes(role)) {
      throw new AppError("Role must be either student or external", 400);
    }

    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (user) {
      throw new AppError("User with this email already exists", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email: normalizedEmail,
      phoneNumber,
      passwordHash,
      role: role || "student",
      isVerified: true,
    });

    req.session.user = {
      id: newUser.id,
      role: newUser.role,
      email: newUser.email,
    };

    res.status(201).json({
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      throw new AppError("Invalid credentials", 400);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email before signing in", 403);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new AppError("Invalid credentials", 400);
    }

    const resolvedRole = user.role || "student";

    req.session.user = {
      id: user.id,
      role: resolvedRole,
      email: user.email,
    };

    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: resolvedRole,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res, next) => {
  try {
    req.session.destroy((error) => {
      if (error) {
        return next(new AppError("Failed to destroy session", 500));
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ success: true });
    });
  } catch (err) {
    next(err);
  }
};

export const checkAuth = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    next(err);
  }
};
