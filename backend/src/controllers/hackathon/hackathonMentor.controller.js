import bcrypt from "bcryptjs";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";

export const adminListMentors = async (req, res) => {
  try {
    const mentors = await HackathonMentor.findAll({
      include: [{ model: HackathonUser, as: "user", attributes: ["id", "fullName", "email", "phoneNumber", "role"] }],
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
  const { fullName, email, password, phoneNumber, expertise } = req.body || {};
  try {
    if (!fullName?.trim() || !email?.trim() || !password || !phoneNumber) {
      return res.status(400).json({ message: "fullName, email, password, phoneNumber are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingEmail = await HackathonUser.findOne({ where: { email: email.trim() } });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    const existingPhone = await HackathonUser.findOne({ where: { phoneNumber } });
    if (existingPhone) return res.status(400).json({ message: "Phone number already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await HackathonUser.create({
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber,
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

