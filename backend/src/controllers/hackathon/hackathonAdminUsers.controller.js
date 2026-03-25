import bcrypt from "bcryptjs";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";

const DEFAULT_ADMIN_EMAIL = "react@kct.ac.in";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isDefaultAdmin = (req) => normalizeEmail(req.hackathonUser?.email) === DEFAULT_ADMIN_EMAIL;

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

  const { fullName, email, phoneNumber, password } = req.body || {};

  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = String(phoneNumber ?? "").trim();

  if (!fullName?.trim() || !normalizedEmail || !normalizedPhone || !password) {
    return res.status(400).json({ message: "fullName, email, phoneNumber and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existingByEmail = await HackathonUser.findOne({ where: { email: normalizedEmail } });
  if (existingByEmail) return res.status(400).json({ message: "Email already exists" });

  const existingByPhone = await HackathonUser.findOne({ where: { phoneNumber: normalizedPhone } });
  if (existingByPhone) return res.status(400).json({ message: "Phone number already exists" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

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

  const { fullName, email, phoneNumber, password } = req.body || {};

  const updates = {};
  if (fullName?.trim()) updates.fullName = fullName.trim();
  if (email?.trim()) updates.email = normalizeEmail(email);
  if (phoneNumber != null) updates.phoneNumber = String(phoneNumber).trim();
  if (password != null) {
    if (String(password).length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(String(password), salt);
  }

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

  if (normalizeEmail(existing.email) === DEFAULT_ADMIN_EMAIL) {
    return res.status(400).json({ message: "You cannot delete the default react@kct.ac.in admin" });
  }

  await existing.destroy();

  return res.status(200).json({ success: true });
};

