import bcrypt from "bcryptjs";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";
import HackathonProblemMentor from "../../models/hackathon/HackathonProblemMentorModel.js";
import HackathonSession from "../../models/hackathon/HackathonSessionModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

function passwordFromEmail(email) {
  const normalized = normalizeEmail(email);
  const idx = normalized.indexOf("@");
  if (idx <= 0) throw new Error("Invalid email");
  return normalized.slice(0, idx);
}

export const adminListMentors = async (req, res) => {
  try {
    const mentors = await HackathonMentor.findAll({
      include: [{ model: HackathonUser, as: "user", attributes: ["id", "fullName", "email", "role"] }],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      mentors: mentors.map((m) => ({
        id: m.id,
        userId: m.userId,
        expertise: m.expertise,
        user: m.user,
      })),
    });
  } catch (error) {
    console.log("Error in adminListMentors:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminCreateMentor = async (req, res) => {
  const { fullName, email, expertise } = req.body || {};
  try {
    if (!fullName?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "fullName and email are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    let passwordPlain = "";
    try {
      passwordPlain = passwordFromEmail(normalizedEmail);
    } catch {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingEmail = await HackathonUser.findOne({ where: { email: normalizedEmail } });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordPlain, salt);

    const user = await HackathonUser.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phoneNumber: null,
      password: hashedPassword,
      role: "mentor",
    });

    const mentor = await HackathonMentor.create({
      userId: user.id,
      expertise: expertise?.trim() || null,
    });

    return res.status(201).json({ mentorId: mentor.id, userId: user.id });
  } catch (error) {
    console.log("Error in adminCreateMentor:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminUpdateMentor = async (req, res) => {
  const mentorId = Number(req.params.id);
  const { fullName, email, expertise } = req.body || {};
  try {
    if (!Number.isInteger(mentorId)) return res.status(400).json({ message: "Invalid mentor id" });

    const mentor = await HackathonMentor.findByPk(mentorId, {
      include: [{ model: HackathonUser, as: "user", attributes: { exclude: ["password"] } }],
    });
    if (!mentor?.user || mentor.user.role !== "mentor") {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const user = await HackathonUser.findByPk(mentor.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatesUser = {};
    if (fullName?.trim()) updatesUser.fullName = fullName.trim();

    const nextEmail = email?.trim() ? normalizeEmail(email) : user.email;
    if (email?.trim()) {
      if (nextEmail !== user.email) {
        const taken = await HackathonUser.findOne({ where: { email: nextEmail } });
        if (taken && taken.id !== user.id) {
          return res.status(400).json({ message: "Email already exists" });
        }
        updatesUser.email = nextEmail;
        const salt = await bcrypt.genSalt(10);
        updatesUser.password = await bcrypt.hash(passwordFromEmail(nextEmail), salt);
      }
    }

    if (Object.keys(updatesUser).length) await user.update(updatesUser);

    const mentorUpdates = {};
    if (expertise !== undefined) mentorUpdates.expertise = expertise === null ? null : String(expertise).trim() || null;
    if (Object.keys(mentorUpdates).length) await mentor.update(mentorUpdates);

    const refreshed = await HackathonMentor.findByPk(mentorId, {
      include: [{ model: HackathonUser, as: "user", attributes: ["id", "fullName", "email", "role"] }],
    });

    return res.status(200).json({
      mentor: {
        id: refreshed.id,
        userId: refreshed.userId,
        expertise: refreshed.expertise,
        user: refreshed.user,
      },
    });
  } catch (error) {
    console.log("Error in adminUpdateMentor:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminDeleteMentor = async (req, res) => {
  const mentorId = Number(req.params.id);
  try {
    if (!Number.isInteger(mentorId)) return res.status(400).json({ message: "Invalid mentor id" });

    const mentor = await HackathonMentor.findByPk(mentorId, {
      include: [{ model: HackathonUser, as: "user" }],
    });
    if (!mentor?.user || mentor.user.role !== "mentor") {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const userId = mentor.userId;

    await HackathonProblemMentor.destroy({ where: { mentorId: mentor.id } });
    await HackathonTeamMentor.destroy({ where: { mentorId: mentor.id } });
    await HackathonSubmission.update(
      { mentorApproved: false, mentorApprovedByUserId: null, mentorApprovedAt: null },
      { where: { mentorApprovedByUserId: userId } }
    );
    await HackathonSession.destroy({ where: { userId } });
    await mentor.destroy();
    await HackathonUser.destroy({ where: { id: userId } });

    return res.status(200).json({ message: "Mentor deleted" });
  } catch (error) {
    console.log("Error in adminDeleteMentor:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminAssignMentor = async (req, res) => {
  const { teamId, mentorUserId } = req.body || {};
  try {
    if (!teamId || !mentorUserId) {
      return res.status(400).json({ message: "teamId and mentorUserId are required" });
    }

    const team = await HackathonTeam.findByPk(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const mentor = await HackathonMentor.findOne({ where: { userId: mentorUserId } });
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    const existing = await HackathonTeamMentor.findOne({ where: { teamId: team.id } });
    if (existing) {
      await existing.update({ mentorId: mentor.id });
      return res.status(200).json({ assignment: existing });
    }

    const assignment = await HackathonTeamMentor.create({
      teamId: team.id,
      mentorId: mentor.id,
    });

    return res.status(201).json({ assignment });
  } catch (error) {
    console.log("Error in adminAssignMentor:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

