import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import Hackathon from "../../models/hackathon/HackathonModel.js";
import { Op } from "sequelize";
import { sendClusterFacultyEmail } from "../../email/sendClusterFacultyEmail.js";

const getUserIdFromSession = (req) => {
  const id = req.hackathonUser?.id ?? req.session?.user?.id ?? req.session?.hackathonUser?.id;
  return Number(id);
};

const resolveHackathonId = async (req) => {
  const qId = req.query?.hackathonId ?? req.body?.hackathonId;
  if (qId && !isNaN(Number(qId))) return Number(qId);
  const active = await Hackathon.findOne({ where: { status: "active" }, order: [["id", "DESC"]] }).catch(() => null);
  return active?.id || 2;
};

export const getClusterTeams = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const user = await HackathonUser.findByPk(userId);

    if (!user || (!["reviewer", "faculty", "cluster_coordinator", "admin"].includes(user.role))) {
      return res.status(403).json({ message: "Access denied. Only assigned faculty and admins can view the cluster workspace." });
    }

    const assignedCluster = user.assignedCluster;
    const targetHackathonId = await resolveHackathonId(req);
    const whereClause = {
      hackathonId: targetHackathonId,
      abstractionStatus: { [Op.in]: ["submitted", "approved", "rejected", "needs_revision"] },
    };

    if (user.role !== "admin") {
      if (!assignedCluster) {
        return res.status(400).json({ message: "No cluster assigned to your faculty profile." });
      }
      whereClause.cluster = assignedCluster;
      whereClause[Op.or] = [
        { assignedFacultyId: user.id },
        { assignedFacultyEmail: user.email },
      ];
    }

    const teams = await HackathonTeam.findAll({
      where: whereClause,
      order: [
        ["clusterMarks", "DESC NULLS LAST"],
        ["teamName", "ASC"],
      ],
    });

    const detailedTeams = await Promise.all(
      teams.map(async (t) => {
        const memberRows = await HackathonTeamMember.findAll({ where: { teamId: t.id } });
        let members = await Promise.all(
          memberRows.map(async (m) => {
            const u = await HackathonUser.findByPk(m.userId, { attributes: ["id", "fullName", "email", "phoneNumber", "college"] });
            return {
              userId: m.userId,
              isLeader: m.isLeader === true,
              user: u ? u.toJSON() : null,
            };
          })
        );

        if (members.length === 0 && t.leaderUserId) {
          const leaderUser = await HackathonUser.findByPk(t.leaderUserId, { attributes: ["id", "fullName", "email", "phoneNumber", "college"] });
          if (leaderUser) {
            members = [
              {
                userId: t.leaderUserId,
                isLeader: true,
                user: leaderUser.toJSON(),
              },
            ];
          }
        }

        return {
          id: t.id,
          teamName: t.teamName,
          inviteCode: t.inviteCode,
          theme: t.theme,
          cluster: t.cluster || "Unassigned",
          topic: t.topic || "",
          description: t.description || "",
          abstractionStatus: t.abstractionStatus || "draft",
          clusterMarks: t.clusterMarks !== null && t.clusterMarks !== undefined ? Number(t.clusterMarks) : null,
          clusterFeedback: t.clusterFeedback || "",
          clusterEvaluatedBy: t.clusterEvaluatedBy || "",
          clusterEvaluatedAt: t.clusterEvaluatedAt,
          assignedFacultyId: t.assignedFacultyId,
          assignedFacultyName: t.assignedFacultyName,
          assignedFacultyEmail: t.assignedFacultyEmail,
          members,
        };
      })
    );

    const gradedCount = detailedTeams.filter((t) => t.clusterMarks !== null && t.clusterMarks !== undefined).length;
    const pendingCount = detailedTeams.length - gradedCount;

    return res.status(200).json({
      cluster: assignedCluster || "All Clusters",
      facultyName: user.fullName,
      totalTeams: detailedTeams.length,
      gradedCount,
      pendingCount,
      teams: detailedTeams,
    });
  } catch (err) {
    console.error("Error in getClusterTeams:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const gradeClusterTeam = async (req, res) => {
  const { teamId, marks, feedback } = req.body || {};
  try {
    const userId = getUserIdFromSession(req);
    const user = await HackathonUser.findByPk(userId);

    if (!user || (!["reviewer", "faculty", "cluster_coordinator", "admin"].includes(user.role))) {
      return res.status(403).json({ message: "Only assigned faculty and admins can grade teams." });
    }

    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required." });
    }

    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > 10) {
      return res.status(400).json({ message: "Marks must be a valid number between 0 and 10." });
    }

    const team = await HackathonTeam.findByPk(teamId);
    if (!team) return res.status(404).json({ message: "Team not found." });

    if (user.role !== "admin") {
      if (user.assignedCluster && team.cluster && user.assignedCluster !== team.cluster) {
        return res.status(403).json({ message: `You are only authorized to grade teams in the ${user.assignedCluster} cluster.` });
      }
      const isAssigned =
        (team.assignedFacultyId && Number(team.assignedFacultyId) === Number(user.id)) ||
        (team.assignedFacultyEmail && team.assignedFacultyEmail.toLowerCase() === (user.email || "").toLowerCase());
      if ((team.assignedFacultyId || team.assignedFacultyEmail) && !isAssigned) {
        return res.status(403).json({ message: "You are not assigned to evaluate this team." });
      }
    }

    await team.update({
      clusterMarks: numMarks,
      clusterFeedback: feedback ? String(feedback).trim() : team.clusterFeedback,
      clusterEvaluatedBy: user.fullName,
      clusterEvaluatedById: user.id,
      clusterEvaluatedAt: new Date(),
    });

    return res.status(200).json({
      message: `Team '${team.teamName}' graded successfully with ${numMarks}/10!`,
      teamId: team.id,
      clusterMarks: numMarks,
      clusterFeedback: team.clusterFeedback,
      clusterEvaluatedBy: user.fullName,
    });
  } catch (err) {
    console.error("Error in gradeClusterTeam:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAdminClusterTeams = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const user = await HackathonUser.findByPk(userId);

    if (!user || (!["admin", "cluster_coordinator"].includes(user.role))) {
      return res.status(403).json({ message: "Admin or cluster coordinator access required." });
    }

    const { cluster: queryCluster, status: queryStatus } = req.query || {};
    const targetHackathonId = await resolveHackathonId(req);

    const whereClause = {
      hackathonId: targetHackathonId,
      cluster: { [Op.ne]: null },
      abstractionStatus: { [Op.in]: ["submitted", "approved", "rejected", "needs_revision"] },
    };

    if (queryCluster && queryCluster !== "all") {
      whereClause.cluster = queryCluster;
    }

    if (queryStatus && queryStatus !== "all") {
      whereClause.abstractionStatus = queryStatus;
    }

    const teams = await HackathonTeam.findAll({
      where: whereClause,
      order: [
        ["clusterMarks", "DESC NULLS LAST"],
        ["teamName", "ASC"],
      ],
    });

    const detailedTeams = await Promise.all(
      teams.map(async (t) => {
        const memberRows = await HackathonTeamMember.findAll({ where: { teamId: t.id } });
        let members = await Promise.all(
          memberRows.map(async (m) => {
            const u = await HackathonUser.findByPk(m.userId, { attributes: ["id", "fullName", "email", "phoneNumber", "college"] });
            return {
              userId: m.userId,
              isLeader: m.isLeader === true,
              user: u ? u.toJSON() : null,
            };
          })
        );

        if (members.length === 0 && t.leaderUserId) {
          const leaderUser = await HackathonUser.findByPk(t.leaderUserId, { attributes: ["id", "fullName", "email", "phoneNumber", "college"] });
          if (leaderUser) {
            members = [
              {
                userId: t.leaderUserId,
                isLeader: true,
                user: leaderUser.toJSON(),
              },
            ];
          }
        }

        return {
          id: t.id,
          teamName: t.teamName,
          inviteCode: t.inviteCode,
          theme: t.theme,
          cluster: t.cluster || "Unassigned",
          topic: t.topic || "",
          description: t.description || "",
          abstractionStatus: t.abstractionStatus || "draft",
          clusterMarks: t.clusterMarks !== null && t.clusterMarks !== undefined ? Number(t.clusterMarks) : null,
          clusterFeedback: t.clusterFeedback || "",
          clusterEvaluatedBy: t.clusterEvaluatedBy || "",
          clusterEvaluatedAt: t.clusterEvaluatedAt,
          assignedFacultyId: t.assignedFacultyId,
          assignedFacultyName: t.assignedFacultyName,
          assignedFacultyEmail: t.assignedFacultyEmail,
          members,
        };
      })
    );

    const allSubmitted = await HackathonTeam.findAll({
      where: { hackathonId: targetHackathonId, abstractionStatus: { [Op.in]: ["submitted", "approved", "rejected", "needs_revision"] } },
      attributes: ["cluster", "clusterMarks", "abstractionStatus"],
    });

    const clusterBreakdown = {
      Mechanical: { total: 0, graded: 0, approved: 0 },
      Electrical: { total: 0, graded: 0, approved: 0 },
      Electronics: { total: 0, graded: 0, approved: 0 },
      Civil: { total: 0, graded: 0, approved: 0 },
      "Computer Science": { total: 0, graded: 0, approved: 0 },
    };

    allSubmitted.forEach((t) => {
      const c = t.cluster;
      if (clusterBreakdown[c]) {
        clusterBreakdown[c].total++;
        if (t.clusterMarks !== null && t.clusterMarks !== undefined) clusterBreakdown[c].graded++;
        if (t.abstractionStatus === "approved") clusterBreakdown[c].approved++;
      }
    });

    return res.status(200).json({
      totalTeams: detailedTeams.length,
      teams: detailedTeams,
      clusterBreakdown,
    });
  } catch (err) {
    console.error("Error in getAdminClusterTeams:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminApproveClusterTeam = async (req, res) => {
  const { teamId, action, feedback } = req.body || {};
  try {
    const userId = getUserIdFromSession(req);
    const user = await HackathonUser.findByPk(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required to approve teams." });
    }

    if (!teamId || !["approve", "reject", "reset"].includes(action)) {
      return res.status(400).json({ message: "Valid teamId and action (approve / reject / reset) are required." });
    }

    const team = await HackathonTeam.findByPk(teamId);
    if (!team) return res.status(404).json({ message: "Team not found." });

    let newStatus = "approved";
    if (action === "reject") newStatus = "rejected";
    if (action === "reset") newStatus = "submitted";

    await team.update({
      abstractionStatus: newStatus,
      reviewerFeedback: feedback ? String(feedback).trim() : team.reviewerFeedback,
      reviewedAt: new Date(),
    });

    return res.status(200).json({
      message: `Team '${team.teamName}' status updated to ${newStatus.toUpperCase()}!`,
      teamId: team.id,
      abstractionStatus: newStatus,
    });
  } catch (err) {
    console.error("Error in adminApproveClusterTeam:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getClusterFacultyList = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const user = await HackathonUser.findByPk(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    const faculty = await HackathonUser.findAll({
      where: {
        role: { [Op.in]: ["reviewer", "faculty"] },
        assignedCluster: { [Op.ne]: null },
      },
      attributes: ["id", "fullName", "email", "assignedCluster", "branch"],
      order: [["assignedCluster", "ASC"], ["fullName", "ASC"]],
    });

    const facultyWithCounts = await Promise.all(
      faculty.map(async (f) => {
        const count = await HackathonTeam.count({
          where: { hackathonId: 2, assignedFacultyId: f.id },
        });
        return {
          id: f.id,
          fullName: f.fullName,
          email: f.email,
          assignedCluster: f.assignedCluster,
          branch: f.branch || "Engineering",
          assignedCount: count,
        };
      })
    );

    return res.status(200).json({
      totalFaculty: facultyWithCounts.length,
      faculty: facultyWithCounts,
    });
  } catch (err) {
    console.error("Error in getClusterFacultyList:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendClusterFacultyEmails = async (req, res) => {
  const { facultyId, customMessage, loginUrl = "https://idealab.kct.ac.in/Hackathon/login" } = req.body || {};
  try {
    const userId = getUserIdFromSession(req);
    const user = await HackathonUser.findByPk(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    let targetFaculty = [];
    if (facultyId && facultyId !== "all") {
      const f = await HackathonUser.findByPk(facultyId);
      if (!f) return res.status(404).json({ message: "Faculty member not found." });
      targetFaculty = [f];
    } else {
      targetFaculty = await HackathonUser.findAll({
        where: { role: "reviewer", assignedCluster: { [Op.ne]: null } },
        order: [["assignedCluster", "ASC"], ["fullName", "ASC"]],
      });
    }

    if (targetFaculty.length === 0) {
      return res.status(400).json({ message: "No cluster faculty found." });
    }

    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const f of targetFaculty) {
      const assignedCount = await HackathonTeam.count({
        where: { hackathonId: 2, assignedFacultyId: f.id },
      });

      try {
        await sendClusterFacultyEmail({
          facultyName: f.fullName,
          facultyEmail: f.email,
          cluster: f.assignedCluster || "Smart City",
          assignedCount,
          loginUrl,
          defaultPassword: "faculty@2026",
          customMessage,
        });

        sentCount++;
        results.push({
          facultyId: f.id,
          name: f.fullName,
          email: f.email,
          cluster: f.assignedCluster,
          assignedCount,
          status: "sent",
        });
      } catch (sendErr) {
        console.error(`Failed to send email to ${f.email}:`, sendErr);
        failedCount++;
        results.push({
          facultyId: f.id,
          name: f.fullName,
          email: f.email,
          cluster: f.assignedCluster,
          assignedCount,
          status: "failed",
          error: sendErr.message,
        });
      }
    }

    return res.status(200).json({
      message: `Notification email process completed: ${sentCount} sent, ${failedCount} failed.`,
      sentCount,
      failedCount,
      results,
    });
  } catch (err) {
    console.error("Error in sendClusterFacultyEmails:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
