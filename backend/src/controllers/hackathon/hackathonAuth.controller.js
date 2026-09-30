import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonSession from "../../models/hackathon/HackathonSessionModel.js";
import { generateOtp, OTP_EXPIRY_MS } from "../../utils/otp.js";
import { sendOtpEmail } from "../../services/mailService.js";
import {
  isHackathonRegistrationClosed,
  hackathonRegistrationClosedMessage,
  getHackathonRegistrationClosedPayload,
} from "../../lib/hackathonRegistrationStatus.js";
import { recordFailedLogin, clearFailedLogin } from "../../middleware/accountLockout.middleware.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

function clearHackathonResetSession(req) {
  delete req.session.hackathonResetEmail;
  delete req.session.hackathonResetOtp;
  delete req.session.hackathonResetOtpExpiresAt;
  delete req.session.hackathonResetPasswordEmail;
}

const createSessionRow = async (req, user) => {
  // Best-effort: session cookie/DB row might be created slightly after response.
  const sessionId = req.sessionID || req.session?.id;
  if (!sessionId) return;

  await HackathonSession.upsert({
    sessionId,
    userId: user.id,
    role: user.role,
  });
};

export const register = async (req, res) => {
  const {
    name,
    fullName,
    email,
    password,
    phone,
    phoneNumber,
    degree,
    college,
    branch,
    graduation_year,
    role,
  } = req.body || {};
  try {
    if (isHackathonRegistrationClosed()) {
      return res.status(403).json({ message: hackathonRegistrationClosedMessage() });
    }

    const normalizedEmail = normalizeEmail(email);

    if (req.session.registrationEmailVerified !== normalizedEmail) {
      return res.status(403).json({ message: "Email is not verified. Complete OTP verification first." });
    }

    // Keep backwards compatibility with older client payloads
    const resolvedName = (name || fullName || "").trim();
    const resolvedPhone = String(phone ?? phoneNumber ?? "").trim();
    const resolvedDegree = String(degree ?? "")
      .trim()
      .toUpperCase();
    const resolvedCollege = String(college ?? "").trim();
    const resolvedBranch = branch ?? null;
    const resolvedGraduationYear = graduation_year ?? req.body?.graduationYear ?? null;

    if (!resolvedName || !normalizedEmail || !password || !resolvedPhone || !resolvedDegree || !resolvedCollege || !resolvedGraduationYear) {
      return res.status(400).json({ message: "Name, email, phone, degree, college, graduation year and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Role-based hackathon registration: only students can self-register.
    const resolvedRole = role || "student";
    if (resolvedRole !== "student") {
      return res.status(403).json({ message: "Only students can register for hackathon" });
    }

    if (!/^\d+$/.test(resolvedPhone)) {
      return res.status(400).json({ message: "Phone must be a number" });
    }

    // Ensure degree is one of allowed options
    if (!["UG", "PG"].includes(resolvedDegree)) {
      return res.status(400).json({ message: "Degree must be UG or PG" });
    }

    const yearNum = Number(resolvedGraduationYear);
    if (!Number.isInteger(yearNum)) {
      return res.status(400).json({ message: "Invalid graduation year" });
    }

    // Uniqueness checks
    const existingByEmail = await HackathonUser.findOne({ where: { email: normalizedEmail } });
    if (existingByEmail) return res.status(400).json({ message: "Email already exists" });

    const existingByPhone = await HackathonUser.findOne({
      where: {
        [Op.or]: [
          { phoneNumber: resolvedPhone },
          { phone: resolvedPhone },
        ],
      },
    });
    if (existingByPhone) return res.status(400).json({ message: "Phone number already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await HackathonUser.create({
      // Populate both the legacy and new columns
      fullName: resolvedName,
      name: resolvedName,
      email: normalizedEmail,
      phoneNumber: resolvedPhone,
      phone: resolvedPhone,
      degree: resolvedDegree,
      college: resolvedCollege,
      branch: resolvedBranch ? String(resolvedBranch).trim() : null,
      graduationYear: yearNum,
      password: hashedPassword,
      role: resolvedRole,
    });

    delete req.session.registrationEmailVerified;

    if (req.session && typeof req.session.regenerate === "function") {
      await new Promise((resolve) => {
        req.session.regenerate((err) => {
          if (err) console.error("Session regenerate error:", err);
          resolve();
        });
      });
    }

    req.session.hackathonUser = {
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };

    await createSessionRow(req, user);

    if (req.session && typeof req.session.save === "function") {
      await new Promise((resolve) => {
        req.session.save((err) => {
          if (err) console.error("Session save error:", err);
          resolve();
        });
      });
    }

    return res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in hackathon register:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body || {};
  try {
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await HackathonUser.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      recordFailedLogin(normalizedEmail);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      recordFailedLogin(normalizedEmail);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    clearFailedLogin(normalizedEmail);

    if (req.session && typeof req.session.regenerate === "function") {
      await new Promise((resolve) => {
        req.session.regenerate((err) => {
          if (err) console.error("Session regenerate error:", err);
          resolve();
        });
      });
    }

    req.session.hackathonUser = {
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName || user.name || "User",
    };

    await createSessionRow(req, user);

    if (req.session && typeof req.session.save === "function") {
      await new Promise((resolve) => {
        req.session.save((err) => {
          if (err) console.error("Session save error:", err);
          resolve();
        });
      });
    }

    return res.status(200).json({
      id: user.id,
      fullName: user.fullName || user.name || "User",
      email: user.email,
      phoneNumber: user.phoneNumber || user.phone || "",
      role: user.role,
    });
  } catch (error) {
    console.log("Error in hackathon login:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.sessionID;

    if (req.session) {
      delete req.session.hackathonUser;
    }

    if (sessionId) {
      await HackathonSession.destroy({ where: { sessionId } }).catch(() => {});
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in hackathon logout:", error.message);
    return res.status(200).json({ success: true });
  }
};

export const checkAuth = async (req, res) => {
  return res.status(200).json({
    id: req.hackathonUser.id,
    fullName: req.hackathonUser.fullName,
    email: req.hackathonUser.email,
    phoneNumber: req.hackathonUser.phoneNumber,
    role: req.hackathonUser.role,
  });
};

export const sendHackathonResetOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await HackathonUser.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        message: "If an account exists for this email, a reset code has been sent.",
      });
    }

    clearHackathonResetSession(req);

    const otp = generateOtp();
    req.session.hackathonResetEmail = email;
    req.session.hackathonResetOtp = otp;
    req.session.hackathonResetOtpExpiresAt = Date.now() + OTP_EXPIRY_MS;

    await sendOtpEmail({ to: email, otp, purpose: "reset" });

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.log("Error in sendHackathonResetOtp:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyHackathonResetOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await HackathonUser.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    const expiresAt = req.session.hackathonResetOtpExpiresAt;
    if (
      req.session.hackathonResetEmail !== email ||
      req.session.hackathonResetOtp !== otp ||
      typeof expiresAt !== "number" ||
      Date.now() > expiresAt
    ) {
      req.session.hackathonOtpAttempts = (req.session.hackathonOtpAttempts || 0) + 1;
      if (req.session.hackathonOtpAttempts >= 5) {
        clearHackathonResetSession(req);
        delete req.session.hackathonOtpAttempts;
        return res.status(429).json({
          message: "Too many failed attempts. This verification code has been invalidated for security. Please request a new code.",
        });
      }
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    delete req.session.hackathonResetEmail;
    delete req.session.hackathonResetOtp;
    delete req.session.hackathonResetOtpExpiresAt;
    delete req.session.hackathonOtpAttempts;

    req.session.hackathonResetPasswordEmail = email;

    return res.status(200).json({ message: "Code verified. You can set a new password." });
  } catch (error) {
    console.log("Error in verifyHackathonResetOtp:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetHackathonPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (req.session.hackathonResetPasswordEmail !== email) {
      return res.status(403).json({ message: "Reset session is invalid. Verify your code again." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await HackathonUser.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await user.update({ password: hashedPassword });

    clearHackathonResetSession(req);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Error in resetHackathonPassword:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getHackathonRegistrationStatus = (req, res) => {
  return res.status(200).json(getHackathonRegistrationClosedPayload());
};
