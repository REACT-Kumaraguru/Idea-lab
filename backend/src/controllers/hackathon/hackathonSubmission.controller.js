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
import HackathonProblemMentor from "../../models/hackathon/HackathonProblemMentorModel.js";
import { Op } from "sequelize";
import {
  isHackathonRegistrationClosed,
  hackathonRegistrationClosedMessage,
} from "../../lib/hackathonRegistrationStatus.js";

const toFileUrl = (file) => {
  // Store an API-served URL so Nginx can proxy it.
  // Use `/download/...` to avoid Nginx rules blocking `/uploads/...`.
  return `/api/ich2026/download/hackathon/${file.filename}`;
};

const phaseEnum = ["poc", "prototype", "final"];

async function buildTeamDetails(team) {
  if (!team) return null;
  try {
    const membersRows = await HackathonTeamMember.findAll({
      where: { teamId: team.id },
      order: [["created_at", "ASC"]],
    });

    const members = await Promise.all(
      membersRows.map(async (m) => {
        const u = await HackathonUser.findByPk(m.userId, {
          attributes: { exclude: ["password"] },
        });
        return {
          userId: m.userId,
          isLeader: m.isLeader === true,
          user: u
            ? {
                id: u.id,
                fullName: u.fullName,
                email: u.email,
                phoneNumber: u.phoneNumber,
                role: u.role,
              }
            : null,
        };
      })
    );

    return {
      id: team.id,
      teamName: team.teamName,
      inviteCode: team.inviteCode,
      status: team.status,
      leaderUserId: team.leaderUserId,
      theme: team.theme || null,
      topic: team.topic || null,
      description: team.description || null,
      members,
    };
  } catch (err) {
    console.error("Error in buildTeamDetails:", err);
    return {
      id: team.id,
      teamName: team.teamName,
      inviteCode: team.inviteCode,
      status: team.status,
      leaderUserId: team.leaderUserId,
      members: [],
    };
  }
}

async function serializeSubmissionForAdmin(submissionInstance) {
  const row = submissionInstance.toJSON();
  const team = await HackathonTeam.findByPk(row.teamId, {
    attributes: ["id", "teamName", "status", "theme", "topic", "description"],
  });
  const problem = await HackathonProblem.findByPk(row.problemId, {
    attributes: ["id", "title", "sector"],
  });

  return {
    ...row,
    pocFilePaths: submissionInstance.pocFilePaths ?? [],
    prototypeFilePaths: submissionInstance.prototypeFilePaths ?? [],
    team: team
      ? {
          id: team.id,
          teamName: team.teamName,
          status: team.status,
          theme: team.theme,
          topic: team.topic,
          description: team.description,
        }
      : null,
    problem: problem ? { id: problem.id, title: problem.title, sector: problem.sector } : null,
  };
}

export const submit = async (req, res) => {
  const {
    problemId,
    phase,
    title,
    description,
    whyParticipate,
    problemToSolve,
    plannedTech,
    workedBefore,
    agreedTerms,
  } = req.body || {};
  try {
    if (isHackathonRegistrationClosed()) {
      return res.status(403).json({ message: hackathonRegistrationClosedMessage() });
    }

    const userId = Number(req.hackathonUser.id);
    const resolvedPhase = phaseEnum.includes(phase) ? phase : null;
    if (!resolvedPhase) {
      return res.status(400).json({ message: "phase is required" });
    }

    const teamMember = await HackathonTeamMember.findOne({ where: { userId } });

    // Fallback: if membership row missing, allow based on leader_user_id.
    const team = teamMember?.teamId
      ? await HackathonTeam.findByPk(teamMember.teamId)
      : await HackathonTeam.findOne({ where: { leaderUserId: userId } });

    if (!team) return res.status(400).json({ message: "You must be part of a team" });

    const isLeader = teamMember ? Boolean(teamMember.isLeader) : Number(team.leaderUserId) === Number(userId);
    if (!isLeader && Number(team.leaderUserId) !== Number(userId)) {
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

    let problem = null;
    if (problemId && !isNaN(Number(problemId)) && Number(problemId) > 0) {
      problem = await HackathonProblem.findByPk(problemId);
    }
    if (!problem && team?.topic) {
      problem = await HackathonProblem.findOne({ where: { title: team.topic } });
    }

    const alreadySubmitted = await HackathonSubmission.findOne({ where: { teamId: team.id } });
    if (alreadySubmitted) {
      return res.status(400).json({
        message: "Your team has already submitted. Only one submission is allowed per team.",
      });
    }

    const finalTitle = String(title || "").trim() || String(problem?.title || team?.topic || "Submission").trim();

    if (!finalTitle) {
      return res.status(400).json({ message: "Problem title or topic is required." });
    }

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

    if (problem) {
      const limit = problem.teamRegistrationLimit;
      if (limit != null && limit > 0) {
        const count = await HackathonSubmission.count({
          where: { problemId: problem.id },
          distinct: true,
          col: "teamId",
        });
        if (count >= limit) {
          return res.status(400).json({
            message: `Registration limit (${limit} teams) reached for this problem statement.`,
          });
        }
      }
    }

    const defaultProb = await HackathonProblem.findOne();
    const resolvedProblemId = problem?.id || defaultProb?.id || 1;

    // Save topic & description on Team object for quick admin reference
    await team.update({
      topic: finalTitle,
      description: description ? String(description).trim() : team.description,
    });

    const created = await HackathonSubmission.create({
      teamId: team.id,
      problemId: resolvedProblemId,
      submissionPhase: resolvedPhase,
      title: finalTitle,
      description: description ? String(description).trim() : null,
      status: "pending",
      submittedByUserId: userId,
      whyParticipate: whyParticipate?.trim() || null,
      problemToSolve: problemToSolve?.trim() || null,
      plannedTech: plannedTech?.trim() || null,
      workedBefore: workedBefore ? String(workedBefore) : null,
      agreedTerms: agreedTerms != null ? Boolean(agreedTerms) : null,
      pocFilePaths: resolvedPhase === "poc" ? pocFilePaths : [],
      prototypeFilePaths: resolvedPhase !== "poc" ? prototypeFilePaths : [],
      hackathonId: team.hackathonId || null,
    });

    return res.status(201).json({ submission: created });
  } catch (error) {
    console.error("Error in submit:", error);
    return res.status(500).json({ message: error?.message || "Internal Server Error" });
  }
};

export const getStatus = async (req, res) => {
  try {
    const userId = Number(req.hackathonUser?.id ?? req.session?.user?.id);
    const role = req.hackathonUser.role;

    if (role === "mentor") {
      const reqHackathonId = req.query.hackathonId ? Number(req.query.hackathonId) : null;
      const mentor = await HackathonMentor.findOne({ where: { userId } });

      let problemIds = [];
      if (mentor) {
        const links = await HackathonProblemMentor.findAll({
          where: { mentorId: mentor.id },
          attributes: ["problemId"],
        });
        problemIds = [...new Set(links.map((l) => l.problemId))];
      }

      let whereClause = {};
      if (reqHackathonId) {
        const conditions = [{ hackathonId: reqHackathonId }, { hackathonId: null }];
        if (problemIds.length > 0) {
          conditions.push({ problemId: problemIds });
        }
        whereClause = { [Op.or]: conditions };
      } else if (problemIds.length > 0) {
        whereClause = { problemId: problemIds };
      } else {
        whereClause = {};
      }

      const submissionsRows = await HackathonSubmission.findAll({
        where: whereClause,
        order: [["created_at", "DESC"]],
      });

      const problems = await HackathonProblem.findAll({
        attributes: ["id", "title", "sector"],
      });

      const submissions = await Promise.all(
        submissionsRows.map(async (s) => {
          const team = await HackathonTeam.findByPk(s.teamId, {
            attributes: ["id", "teamName", "inviteCode", "status", "leaderUserId", "hackathonId"],
          });
          const teamDetails = team ? await buildTeamDetails(team) : null;
          if (teamDetails && team?.hackathonId) {
            teamDetails.hackathonId = team.hackathonId;
          }
          const problem = problems.find((p) => Number(p.id) === Number(s.problemId)) || null;
          const submittedBy = await HackathonUser.findByPk(s.submittedByUserId, {
            attributes: { exclude: ["password"] },
          });

          return {
            ...(s.toJSON ? s.toJSON() : s),
            team: teamDetails,
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

      const filteredSubmissions = submissions.filter((s) => {
        if (!reqHackathonId) return true;
        const subHackId = s.hackathonId || s.team?.hackathonId;
        if (subHackId != null) {
          return Number(subHackId) === Number(reqHackathonId);
        }
        return Number(reqHackathonId) === 6;
      });

      return res.status(200).json({ team: null, submissions: filteredSubmissions });
    }

    let teamId = null;
    if (role === "student") {
      const member = await HackathonTeamMember.findOne({ where: { userId } });
      teamId = member?.teamId || null;
      if (!teamId) {
        const leaderTeam = await HackathonTeam.findOne({ where: { leaderUserId: userId }, attributes: ["id"] });
        teamId = leaderTeam?.id || null;
      }
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

export const mentorSetSubmissionApproval = async (req, res) => {
  try {
    const userId = Number(req.hackathonUser?.id ?? req.session?.hackathonUser?.id);
    const submissionId = Number(req.params.id);
    const approved = req.body?.approved;

    if (!submissionId) return res.status(400).json({ message: "Invalid submission id" });
    if (approved == null) return res.status(400).json({ message: "approved is required" });

    const submission = await HackathonSubmission.findByPk(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    await submission.update({
      mentorApproved: Boolean(approved),
      mentorApprovedByUserId: userId,
      mentorApprovedAt: new Date(),
    });

    const team = await HackathonTeam.findByPk(submission.teamId, {
      attributes: ["id", "teamName", "inviteCode", "status", "leaderUserId"],
    });
    const teamDetails = team ? await buildTeamDetails(team) : null;

    const problem = submission.problemId
      ? await HackathonProblem.findByPk(submission.problemId, { attributes: ["id", "title", "sector"] })
      : null;

    return res.status(200).json({
      submission: {
        ...(submission.toJSON ? submission.toJSON() : submission),
        team: teamDetails,
        problem: problem ? { id: problem.id, title: problem.title, sector: problem.sector } : null,
      },
    });
  } catch (error) {
    console.error("Error in mentorSetSubmissionApproval:", error);
    return res.status(500).json({ message: error?.message || "Internal Server Error" });
  }
};

// Admin: list all submissions
export const adminListSubmissions = async (req, res) => {
  try {
    const { hackathonId } = req.query || {};
    const where = {};
    if (hackathonId && Number.isInteger(Number(hackathonId))) {
      const hackathonTeams = await HackathonTeam.findAll({
        where: { hackathonId: Number(hackathonId) },
        attributes: ["id"],
      });
      const hTeamIds = hackathonTeams.map((t) => Number(t.id));
      if (!hTeamIds.length) {
        return res.status(200).json({ submissions: [] });
      }
      where.teamId = hTeamIds;
    }

    const submissionsRows = await HackathonSubmission.findAll({
      where,
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
    const team = await HackathonTeam.findByPk(submission.teamId, { attributes: ["id", "status", "abstractionStatus"] });
    if (!team || (team.status !== "approved" && team.status !== "active" && team.abstractionStatus !== "approved")) {
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

