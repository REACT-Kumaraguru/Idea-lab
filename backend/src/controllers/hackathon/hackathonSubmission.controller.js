import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";

const toFileUrl = (file) => {
  // multer "destination" is ./src/uploads/hackathon, but we store API URL paths
  return `/src/uploads/hackathon/${file.filename}`;
};

const phaseEnum = ["poc", "prototype"];

export const submit = async (req, res) => {
  const { problemId, phase, title, description } = req.body || {};
  try {
    const userId = req.hackathonUser.id;
    const resolvedPhase = phaseEnum.includes(phase) ? phase : null;
    if (!problemId || !resolvedPhase) {
      return res.status(400).json({ message: "problemId and phase are required" });
    }
    if (!title?.trim()) return res.status(400).json({ message: "title is required" });

    const teamMember = await HackathonTeamMember.findOne({ where: { userId } });
    if (!teamMember) return res.status(400).json({ message: "You must be part of a team" });

    const team = await HackathonTeam.findByPk(teamMember.teamId);
    if (!team) return res.status(400).json({ message: "Team not found" });

    if (teamMember.isLeader !== true || team.leaderUserId !== userId) {
      return res.status(403).json({ message: "Only team leader can submit" });
    }

    if (team.status !== "approved") {
      return res.status(400).json({ message: "Your team is not approved yet" });
    }

    const problem = await HackathonProblem.findByPk(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const files = req.files || {};
    const pocFiles = Array.isArray(files.pocFiles) ? files.pocFiles : [];
    const prototypeFiles = Array.isArray(files.prototypeFiles) ? files.prototypeFiles : [];

    const pocFilePaths = resolvedPhase === "poc" ? pocFiles.map(toFileUrl) : [];
    const prototypeFilePaths = resolvedPhase === "prototype" ? prototypeFiles.map(toFileUrl) : [];

    if (resolvedPhase === "poc" && pocFilePaths.length === 0) {
      return res.status(400).json({ message: "Upload at least one PoC file" });
    }
    if (resolvedPhase === "prototype" && prototypeFilePaths.length === 0) {
      return res.status(400).json({ message: "Upload at least one Prototype file" });
    }

    const existing = await HackathonSubmission.findOne({
      where: {
        teamId: team.id,
        problemId: problem.id,
        submissionPhase: resolvedPhase,
      },
    });

    if (existing) {
      const updated = await existing.update({
        title: title.trim(),
        description: description?.trim() || null,
        status: "submitted",
        submittedByUserId: userId,
        // Update only the relevant phase file paths
        pocFilePaths: resolvedPhase === "poc" ? pocFilePaths : existing.pocFilePaths,
        prototypeFilePaths:
          resolvedPhase === "prototype" ? prototypeFilePaths : existing.prototypeFilePaths,
      });
      return res.status(200).json({ submission: updated });
    }

    const created = await HackathonSubmission.create({
      teamId: team.id,
      problemId: problem.id,
      submissionPhase: resolvedPhase,
      title: title.trim(),
      description: description?.trim() || null,
      status: "submitted",
      submittedByUserId: userId,
      pocFilePaths: resolvedPhase === "poc" ? pocFilePaths : [],
      prototypeFilePaths: resolvedPhase === "prototype" ? prototypeFilePaths : [],
    });

    return res.status(201).json({ submission: created });
  } catch (error) {
    console.log("Error in submit:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStatus = async (req, res) => {
  try {
    const userId = req.hackathonUser.id;
    const role = req.hackathonUser.role;

    let teamId = null;

    if (role === "student") {
      const member = await HackathonTeamMember.findOne({ where: { userId } });
      teamId = member?.teamId || null;
    } else if (role === "mentor") {
      const mentor = await HackathonMentor.findOne({ where: { userId } });
      if (!mentor) return res.status(200).json({ team: null, submissions: [] });
      const assignment = await HackathonTeamMentor.findOne({ where: { mentorId: mentor.id } });
      teamId = assignment?.teamId || null;
    } else {
      // Admin can see global status through admin endpoints.
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!teamId) return res.status(200).json({ team: null, submissions: [] });

    const team = await HackathonTeam.findByPk(teamId, {
      attributes: ["id", "teamName", "inviteCode", "status", "leaderUserId"],
    });
    if (!team) return res.status(200).json({ team: null, submissions: [] });

    const submissions = await HackathonSubmission.findAll({
      where: { teamId },
      include: [
        { model: HackathonProblem, as: "problem", attributes: ["id", "title", "sector"] },
        { model: HackathonUser, as: "submittedBy", attributes: ["id", "fullName", "email", "role"] },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      team,
      submissions,
    });
  } catch (error) {
    console.log("Error in getStatus:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin: list all submissions
export const adminListSubmissions = async (req, res) => {
  try {
    const submissions = await HackathonSubmission.findAll({
      include: [
        { model: HackathonTeam, as: "team", attributes: ["id", "teamName", "status"] },
        { model: HackathonProblem, as: "problem", attributes: ["id", "title", "sector"] },
      ],
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({ submissions });
  } catch (error) {
    console.log("Error in adminListSubmissions:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin: approve/reject a specific submission row
export const adminSetSubmissionStatus = async (req, res) => {
  const { status, adminNotes } = req.body || {};
  try {
    if (!status || !["under_review", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const submission = await HackathonSubmission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    await submission.update({
      status,
      adminNotes: adminNotes?.trim() || null,
    });

    return res.status(200).json({ submission });
  } catch (error) {
    console.log("Error in adminSetSubmissionStatus:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminSelectWinner = async (req, res) => {
  const { submissionId, winnerAmount, seedMoneyAmount } = req.body || {};
  try {
    if (!submissionId) return res.status(400).json({ message: "submissionId is required" });

    const submission = await HackathonSubmission.findByPk(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    await submission.update({
      status: "winner",
      winnerAmount: winnerAmount ?? null,
      seedMoneyAmount: seedMoneyAmount ?? null,
    });

    return res.status(200).json({ submission });
  } catch (error) {
    console.log("Error in adminSelectWinner:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

