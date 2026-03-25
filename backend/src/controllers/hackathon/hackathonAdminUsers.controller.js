import bcrypt from "bcryptjs";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";

const DEFAULT_ADMIN_EMAIL = "react@kct.ac.in";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isDefaultAdmin = (req) => normalizeEmail(req.hackathonUser?.email) === DEFAULT_ADMIN_EMAIL;

function generatePasswordFromEmail(email) {
  const normalized = normalizeEmail(email);
  const idx = normalized.indexOf("@");
  if (idx <= 0) {
    throw new Error("Invalid email format");
  }
  return normalized.slice(0, idx);
}

export const listHackathonAdmins = async (req, res) => {
  if (!isDefaultAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  const admins = await HackathonUser.findAll({
    where: { role: "admin" },
    attributes: ["id", "fullName", "email", "phoneNumber", "created_at"],
    order: [["created_at", "DESC"]],
  });

  return res.status(200).json({ admins });
};

export const createHackathonAdmin = async (req, res) => {
  if (!isDefaultAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  const { fullName, email, phoneNumber } = req.body || {};

  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = String(phoneNumber ?? "").trim();

  if (!fullName?.trim() || !normalizedEmail || !normalizedPhone) {
    return res.status(400).json({ message: "fullName, email and phoneNumber are required" });
  }

  const existingByEmail = await HackathonUser.findOne({ where: { email: normalizedEmail } });
  if (existingByEmail) return res.status(400).json({ message: "Email already exists" });

  const existingByPhone = await HackathonUser.findOne({ where: { phoneNumber: normalizedPhone } });
  if (existingByPhone) return res.status(400).json({ message: "Phone number already exists" });

  let passwordPlain = "";
  try {
    passwordPlain = generatePasswordFromEmail(normalizedEmail);
  } catch (e) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(passwordPlain, salt);

  const admin = await HackathonUser.create({
    fullName: fullName.trim(),
    name: fullName.trim(),
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    phone: normalizedPhone,
    password: hashedPassword,
    role: "admin",
    degree: null,
    college: null,
    branch: null,
    graduationYear: null,
  });

  return res.status(201).json({
    admin: {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
    },
  });
};

export const updateHackathonAdmin = async (req, res) => {
  if (!isDefaultAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  const { id } = req.params;
  const adminId = Number(id);
  if (!Number.isInteger(adminId)) return res.status(400).json({ message: "Invalid admin id" });

  const existing = await HackathonUser.findByPk(adminId);
  if (!existing || existing.role !== "admin") return res.status(404).json({ message: "Admin not found" });

  const { fullName, email, phoneNumber } = req.body || {};

  const updates = {};
  if (fullName?.trim()) updates.fullName = fullName.trim();
  if (email?.trim()) updates.email = normalizeEmail(email);
  if (phoneNumber != null) updates.phoneNumber = String(phoneNumber).trim();
  // Password is always derived from email prefix for admin accounts.
  const targetEmail = updates.email || existing.email;
  let passwordPlain = "";
  try {
    passwordPlain = generatePasswordFromEmail(targetEmail);
  } catch {
    return res.status(400).json({ message: "Invalid email format" });
  }
  const salt = await bcrypt.genSalt(10);
  updates.password = await bcrypt.hash(passwordPlain, salt);

  // Uniqueness checks (avoid Sequelize unique-constraint errors returning 500)
  if (updates.email) {
    const byEmail = await HackathonUser.findOne({ where: { email: updates.email } });
    if (byEmail && byEmail.id !== adminId) return res.status(400).json({ message: "Email already exists" });
  }

  if (updates.phoneNumber) {
    const byPhone = await HackathonUser.findOne({ where: { phoneNumber: updates.phoneNumber } });
    if (byPhone && byPhone.id !== adminId) return res.status(400).json({ message: "Phone number already exists" });
  }

  // Do not allow changing role from "admin"
  updates.role = "admin";

  // If updating email/fullName, also update `name` (optional field)
  if (updates.fullName) updates.name = updates.fullName;

  await existing.update(updates);

  return res.status(200).json({
    admin: {
      id: existing.id,
      fullName: existing.fullName,
      email: existing.email,
      phoneNumber: existing.phoneNumber,
    },
  });
};

export const deleteHackathonAdmin = async (req, res) => {
  if (!isDefaultAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  const { id } = req.params;
  const adminId = Number(id);
  if (!Number.isInteger(adminId)) return res.status(400).json({ message: "Invalid admin id" });

  const existing = await HackathonUser.findByPk(adminId);
  if (!existing || existing.role !== "admin") return res.status(404).json({ message: "Admin not found" });

  const adminCount = await HackathonUser.count({ where: { role: "admin" } });
  if (adminCount <= 1) {
    return res.status(400).json({
      message: "Cannot delete the last remaining admin. Create another admin account first, then you can remove this one.",
    });
  }

  await existing.destroy();

  return res.status(200).json({ success: true });
};

