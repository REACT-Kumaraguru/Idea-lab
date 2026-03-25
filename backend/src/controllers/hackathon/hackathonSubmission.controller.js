import { QueryTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import {
  buildSubmissionApprovedEmailHtml,
  sendHackathonNotificationEmail,
} from "../../services/mailService.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";

const toFileUrl = (file) => {
  // Store an API-served URL so Nginx can proxy it.
  // Use `/download/...` to avoid Nginx rules blocking `/uploads/...`.
  return `/api/ich2026/download/hackathon/${file.filename}`;
};

const phaseEnum = ["poc", "prototype", "final"];

async function serializeSubmissionForAdmin(submissionInstance) {
  const row = submissionInstance.toJSON();
  const team = await HackathonTeam.findByPk(row.teamId, {
    attributes: ["id", "teamName", "status"],
  });
  const problem = await HackathonProblem.findByPk(row.problemId, {
    attributes: ["id", "title", "sector"],
  });

  return {
    ...row,
    pocFilePaths: submissionInstance.pocFilePaths ?? [],
    prototypeFilePaths: submissionInstance.prototypeFilePaths ?? [],
    team: team ? { id: team.id, teamName: team.teamName, status: team.status } : null,
    problem: problem ? { id: problem.id, title: problem.title, sector: problem.sector } : null,
  };
}

export const submit = async (req, res) => {
  const { problemId, phase, title, description } = req.body || {};
  try {
    const userId = Number(req.hackathonUser.id);
    const resolvedPhase = phaseEnum.includes(phase) ? phase : null;
    if (!problemId || !resolvedPhase) {
      return res.status(400).json({ message: "problemId and phase are required" });
    }
    if (!title?.trim()) return res.status(400).json({ message: "title is required" });

    const teamMember = await HackathonTeamMember.findOne({ where: { userId } });

    // Fallback: if membership row missing, allow based on leader_user_id.
    const team = teamMember?.teamId
      ? await HackathonTeam.findByPk(teamMember.teamId)
      : await HackathonTeam.findOne({ where: { leaderUserId: userId } });

    if (!team) return res.status(400).json({ message: "You must be part of a team" });

    const isLeader = teamMember ? teamMember.isLeader === true : team.leaderUserId === userId;
    if (!isLeader || team.leaderUserId !== userId) {
      return res.status(403).json({ message: "Only team leader can submit" });
    }

    if (team.status !== "approved") {
      if (team.status === "pending") {
        // Auto-activate: once the team has at least 1 member, allow submissions.
        await team.update({ status: "approved" });
      } else {
        return res.status(400).json({ message: "Only active teams can submit." });
      }
    }

    const problem = await HackathonProblem.findByPk(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const files = req.files || {};
    const pocFiles = Array.isArray(files.pocFiles) ? files.pocFiles : [];
    const prototypeFiles = Array.isArray(files.prototypeFiles) ? files.prototypeFiles : [];

    const pocFilePaths = resolvedPhase === "poc" ? pocFiles.map(toFileUrl) : [];
    const prototypeFilePaths = resolvedPhase !== "poc" ? prototypeFiles.map(toFileUrl) : [];
    const activeFiles = resolvedPhase === "poc" ? pocFilePaths : prototypeFilePaths;

    if (activeFiles.length === 0) {
      if (resolvedPhase === "poc") return res.status(400).json({ message: "Upload at least one PoC file" });
      if (resolvedPhase === "prototype") return res.status(400).json({ message: "Upload at least one Prototype file" });
      return res.status(400).json({ message: "Upload at least one file for Final phase" });
    }

    const existing = await HackathonSubmission.findOne({
      where: {
        teamId: team.id,
        problemId: problem.id,
        submissionPhase: resolvedPhase,
      },
    });

    if (!existing) {
      const limit = problem.teamRegistrationLimit;
      if (limit != null && limit > 0) {
        const [countRow] = await sequelize.query(
          `SELECT COUNT(DISTINCT team_id)::int AS c FROM hackathon_submissions WHERE problem_id = :pid`,
          { replacements: { pid: problem.id }, type: QueryTypes.SELECT }
        );
        const distinctTeams = Number(countRow?.c) || 0;
        if (distinctTeams >= limit) {
          return res.status(400).json({
            message: "This problem has reached the maximum number of teams allowed to register.",
          });
        }
      }
    }

    if (existing) {
      const updated = await existing.update({
        title: title.trim(),
        description: description?.trim() || null,
        status: "pending",
        submittedByUserId: userId,
        // Update only the relevant phase file paths
        pocFilePaths: resolvedPhase === "poc" ? pocFilePaths : existing.pocFilePaths,
        prototypeFilePaths: resolvedPhase !== "poc" ? prototypeFilePaths : existing.prototypeFilePaths,
      });
      return res.status(200).json({ submission: updated });
    }

    const created = await HackathonSubmission.create({
      teamId: team.id,
      problemId: problem.id,
      submissionPhase: resolvedPhase,
      title: title.trim(),
      description: description?.trim() || null,
      status: "pending",
      submittedByUserId: userId,
      pocFilePaths: resolvedPhase === "poc" ? pocFilePaths : [],
      prototypeFilePaths: resolvedPhase !== "poc" ? prototypeFilePaths : [],
    });

    return res.status(201).json({ submission: created });
  } catch (error) {
    console.log("Error in submit:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStatus = async (req, res) => {
  try {
    const userId = Number(req.hackathonUser?.id ?? req.session?.user?.id);
    const role = req.hackathonUser.role;

    let teamId = null;
    if (role === "student") {
      const member = await HackathonTeamMember.findOne({ where: { userId } });
      teamId = member?.teamId || null;
      if (!teamId) {
        const leaderTeam = await HackathonTeam.findOne({ where: { leaderUserId: userId }, attributes: ["id"] });
        teamId = leaderTeam?.id || null;
      }
    } else if (role === "mentor") {
      const mentor = await HackathonMentor.findOne({ where: { userId } });
      if (!mentor) return res.status(200).json({ team: null, submissions: [] });
      const assignment = await HackathonTeamMentor.findOne({ where: { mentorId: mentor.id } });
      teamId = assignment?.teamId || null;
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!teamId) return res.status(200).json({ team: null, submissions: [] });

    const team = await HackathonTeam.findByPk(teamId, {
      attributes: ["id", "teamName", "inviteCode", "status", "leaderUserId"],
    });
    if (!team) return res.status(200).json({ team: null, submissions: [] });

    const submissionsRows = await HackathonSubmission.findAll({
      where: { teamId },
      order: [["created_at", "DESC"]],
    });

    const submissions = await Promise.all(
      submissionsRows.map(async (s) => {
        const problem = await HackathonProblem.findByPk(s.problemId, {
          attributes: ["id", "title", "sector"],
        });
        const submittedBy = await HackathonUser.findByPk(s.submittedByUserId, {
          attributes: { exclude: ["password"] },
        });

        return {
          ...(s.toJSON ? s.toJSON() : s),
          problem: problem ? { id: problem.id, title: problem.title, sector: problem.sector } : null,
          submittedBy: submittedBy
            ? {
                id: submittedBy.id,
                fullName: submittedBy.fullName,
                email: submittedBy.email,
                role: submittedBy.role,
              }
            : null,
        };
      })
    );

    return res.status(200).json({ team, submissions });
  } catch (error) {
    console.log("Error in getStatus:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin: list all submissions
export const adminListSubmissions = async (req, res) => {
  try {
    const submissionsRows = await HackathonSubmission.findAll({
      order: [["created_at", "DESC"]],
    });

    const submissions = await Promise.all(submissionsRows.map((s) => serializeSubmissionForAdmin(s)));

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
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const submission = await HackathonSubmission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // Lock: once approved/rejected, status cannot change again.
    if (["approved", "rejected", "winner"].includes(submission.status)) {
      return res.status(400).json({ message: "Submission decision is locked" });
    }

    // Only allow final decision after the team itself is approved.
    const team = await HackathonTeam.findByPk(submission.teamId, { attributes: ["id", "status"] });
    if (!team || team.status !== "approved") {
      return res.status(400).json({ message: "Team must be approved before reviewing submissions" });
    }

    await submission.update({
      status,
      adminNotes: adminNotes?.trim() || null,
    });

    await submission.reload();

    if (status === "approved") {
      const teamFull = await HackathonTeam.findByPk(submission.teamId, {
        attributes: ["id", "teamName", "leaderUserId"],
      });
      const leader = teamFull
        ? await HackathonUser.findByPk(teamFull.leaderUserId, {
            attributes: ["email", "fullName"],
          })
        : null;
      if (leader?.email && teamFull) {
        const html = buildSubmissionApprovedEmailHtml({
          leaderName: leader.fullName || leader.email,
          teamName: teamFull.teamName,
          projectTitle: submission.title,
        });
        await sendHackathonNotificationEmail({
          to: leader.email,
          subject: "IDEA Lab — Your submission has been approved",
          html,
        });
      }
    }

    const payload = await serializeSubmissionForAdmin(submission);
    return res.status(200).json({ submission: payload });
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

    // Keep status locked (do not modify submission.status here).
    if (submission.status !== "approved") {
      return res.status(400).json({ message: "Only approved submissions can be selected as winners" });
    }

    await submission.update({
      winnerAmount: winnerAmount ?? null,
      seedMoneyAmount: seedMoneyAmount ?? null,
    });

    return res.status(200).json({ submission });
  } catch (error) {
    console.log("Error in adminSelectWinner:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

