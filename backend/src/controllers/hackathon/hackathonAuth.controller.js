import bcrypt from "bcryptjs";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonSession from "../../models/hackathon/HackathonSessionModel.js";

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
    branch,
    graduation_year,
    role,
  } = req.body || {};
  try {
    // Keep backwards compatibility with older client payloads
    const resolvedName = (name || fullName || "").trim();
    const resolvedPhone = String(phone ?? phoneNumber ?? "").trim();
    const resolvedDegree = degree;
    const resolvedBranch = branch ?? null;
    const resolvedGraduationYear = graduation_year ?? null;

    if (!resolvedName || !email?.trim() || !password || !resolvedPhone || !resolvedDegree || !resolvedGraduationYear) {
      return res.status(400).json({ message: "Name, email, phone, degree, graduation year and password are required" });
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
    if (!["BE", "BTech", "BSc"].includes(resolvedDegree)) {
      return res.status(400).json({ message: "Invalid degree" });
    }

    const yearNum = Number(resolvedGraduationYear);
    if (!Number.isInteger(yearNum)) {
      return res.status(400).json({ message: "Invalid graduation year" });
    }

    // Uniqueness checks
    const existingByEmail = await HackathonUser.findOne({ where: { email: email.trim() } });
    if (existingByEmail) return res.status(400).json({ message: "Email already exists" });

    const existingByPhone = await HackathonUser.findOne({ where: { phoneNumber: resolvedPhone } });
    if (existingByPhone) return res.status(400).json({ message: "Phone number already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await HackathonUser.create({
      // Populate both the legacy and new columns
      fullName: resolvedName,
      name: resolvedName,
      email: email.trim(),
      phoneNumber: resolvedPhone,
      phone: resolvedPhone,
      degree: resolvedDegree,
      branch: resolvedBranch ? String(resolvedBranch).trim() : null,
      graduationYear: yearNum,
      password: hashedPassword,
      role: resolvedRole,
    });

    req.session.hackathonUser = {
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };

    await createSessionRow(req, user);

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

    const user = await HackathonUser.findOne({ where: { email: email.trim() } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    req.session.hackathonUser = {
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };

    await createSessionRow(req, user);

    return res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
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

    // Remove hackathon auth only (do not destroy the whole express session).
    delete req.session.hackathonUser;

    await HackathonSession.destroy({ where: { sessionId } });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in hackathon logout:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
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

