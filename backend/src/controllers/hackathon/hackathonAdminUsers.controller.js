import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sequelize } from "../../lib/db.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonSession from "../../models/hackathon/HackathonSessionModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonProblemMentor from "../../models/hackathon/HackathonProblemMentorModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isAdmin = (req) => {
  const role = req.hackathonUser?.role || req.session?.hackathonUser?.role || req.session?.user?.role;
  return role === "admin";
};

export const listHackathonAdmins = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  const admins = await HackathonUser.findAll({
    where: { role: "admin" },
    attributes: ["id", "fullName", "email", "phoneNumber", "created_at"],
    order: [["created_at", "DESC"]],
  });

  return res.status(200).json({ admins });
};

export const createHackathonAdmin = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  const { fullName, email, phoneNumber, password } = req.body || {};

  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = String(phoneNumber ?? "").trim();

  if (!fullName?.trim() || !normalizedEmail || !normalizedPhone) {
    return res.status(400).json({ message: "fullName, email and phoneNumber are required" });
  }

  const existingByEmail = await HackathonUser.findOne({ where: { email: normalizedEmail } });
  if (existingByEmail) return res.status(400).json({ message: "Email already exists" });

  const existingByPhone = await HackathonUser.findOne({ where: { phoneNumber: normalizedPhone } });
  if (existingByPhone) return res.status(400).json({ message: "Phone number already exists" });

  const passwordPlain = (password && String(password).trim().length >= 6)
    ? String(password).trim()
    : crypto.randomBytes(4).toString("hex");

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
      initialPassword: passwordPlain,
    },
  });
};

export const updateHackathonAdmin = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

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

  // Update password only if an explicit new password is provided
  if (password && String(password).trim().length >= 6) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(String(password).trim(), salt);
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
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  const { id } = req.params;
  const adminId = Number(id);
  if (!Number.isInteger(adminId)) return res.status(400).json({ message: "Invalid admin id" });

  const currentUserId = req.hackathonUser?.id || req.session?.hackathonUser?.id || req.session?.user?.id;
  if (currentUserId && Number(currentUserId) === adminId) {
    return res.status(400).json({ message: "You cannot delete your own admin account" });
  }

  const existing = await HackathonUser.findByPk(adminId);
  if (!existing || existing.role !== "admin") return res.status(404).json({ message: "Admin not found" });

  const adminCount = await HackathonUser.count({ where: { role: "admin" } });
  if (adminCount <= 1) {
    return res.status(400).json({
      message: "Cannot delete the last remaining admin. Create another admin account first, then you can remove this one.",
    });
  }

  const userId = existing.id;

  try {
    await sequelize.transaction(async (t) => {
      await HackathonSubmission.update(
        { mentorApproved: false, mentorApprovedByUserId: null, mentorApprovedAt: null },
        { where: { mentorApprovedByUserId: userId }, transaction: t }
      );

      const mentorRow = await HackathonMentor.findOne({ where: { userId }, transaction: t });
      if (mentorRow) {
        await HackathonProblemMentor.destroy({ where: { mentorId: mentorRow.id }, transaction: t });
        await HackathonTeamMentor.destroy({ where: { mentorId: mentorRow.id }, transaction: t });
        await mentorRow.destroy({ transaction: t });
      }

      const teamsLed = await HackathonTeam.findAll({ where: { leaderUserId: userId }, transaction: t });
      for (const team of teamsLed) {
        await HackathonSubmission.destroy({ where: { teamId: team.id }, transaction: t });
        await HackathonTeamMember.destroy({ where: { teamId: team.id }, transaction: t });
        await team.destroy({ transaction: t });
      }

      await HackathonTeamMember.destroy({ where: { userId }, transaction: t });
      await HackathonSubmission.destroy({ where: { submittedByUserId: userId }, transaction: t });
      await HackathonSession.destroy({ where: { userId }, transaction: t });

      await existing.destroy({ transaction: t });
    });
  } catch (err) {
    console.error("deleteHackathonAdmin:", err);
    return res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message || "Internal server error",
    });
  }

  return res.status(200).json({ success: true });
};

export const listVolunteers = async (req, res) => {
  try {
    const volunteers = await HackathonUser.findAll({
      where: { role: "volunteer" },
      attributes: ["id", "fullName", "email", "phoneNumber", "phone", "created_at"],
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({ volunteers });
  } catch (err) {
    console.error("listVolunteers:", err);
    return res.status(500).json({ message: "Failed to list volunteers" });
  }
};

export const createVolunteer = async (req, res) => {
  try {
    const { email, password, fullName } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await HackathonUser.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const volunteer = await HackathonUser.create({
      email: normalizedEmail,
      password: hashedPassword,
      fullName: fullName?.trim() || "Student Volunteer",
      name: fullName?.trim() || "Student Volunteer",
      role: "volunteer",
      phone: "0000000000",
    });

    return res.status(201).json({
      success: true,
      volunteer: {
        id: volunteer.id,
        fullName: volunteer.fullName,
        email: volunteer.email,
        role: volunteer.role,
      },
    });
  } catch (err) {
    console.error("createVolunteer:", err);
    return res.status(500).json({ message: "Failed to create volunteer" });
  }
};

export const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await HackathonUser.findByPk(id);
    if (!user || user.role !== "volunteer") {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    await user.destroy();
    return res.json({ success: true, message: "Volunteer removed successfully" });
  } catch (err) {
    console.error("deleteVolunteer:", err);
    return res.status(500).json({ message: "Failed to delete volunteer" });
  }
};


