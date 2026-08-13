import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";

const getUserIdFromSession = (req) => {
  const id = req.hackathonUser?.id ?? req.session?.user?.id;
  return Number(id);
};

export const getReviewerTeams = async (req, res) => {
  try {
    const reviewerId = getUserIdFromSession(req);
    const reviewer = await HackathonUser.findByPk(reviewerId);

    if (!reviewer || (reviewer.role !== "reviewer" && reviewer.role !== "admin")) {
      return res.status(403).json({ message: "Only assigned reviewers or admins can view reviewer workspace." });
    }

    const assignedTheme = reviewer.assignedTheme;

    const whereClause = { hackathonId: 2 };
    if (reviewer.role === "reviewer" && assignedTheme) {
      whereClause.theme = assignedTheme;
    }

    const teams = await HackathonTeam.findAll({
      where: whereClause,
      order: [["updated_at", "DESC"]],
    });

    const detailedTeams = await Promise.all(
      teams.map(async (t) => {
        const memberRows = await HackathonTeamMember.findAll({ where: { teamId: t.id } });
        let members = await Promise.all(
          memberRows.map(async (m) => {
            const u = await HackathonUser.findByPk(m.userId, { attributes: ["id", "fullName", "email", "phoneNumber"] });
            return {
              userId: m.userId,
              isLeader: m.isLeader === true,
              user: u ? u.toJSON() : null,
            };
          })
        );

        if (members.length === 0 && t.leaderUserId) {
          const leaderUser = await HackathonUser.findByPk(t.leaderUserId, { attributes: ["id", "fullName", "email", "phoneNumber"] });
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
          topic: t.topic,
          description: t.description,
          abstractionStatus: t.abstractionStatus || "draft",
          reviewerFeedback: t.reviewerFeedback,
          reviewedAt: t.reviewedAt,
          members,
        };
      })
    );

    return res.status(200).json({
      theme: assignedTheme || "All Themes",
      teams: detailedTeams,
    });
  } catch (err) {
    console.error("Error in getReviewerTeams:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const reviewAbstraction = async (req, res) => {
  const { teamId, action, feedback } = req.body || {};
  try {
    const reviewerId = getUserIdFromSession(req);
    const reviewer = await HackathonUser.findByPk(reviewerId);

    if (!reviewer || (reviewer.role !== "reviewer" && reviewer.role !== "admin")) {
      return res.status(403).json({ message: "Only reviewers can review problem abstractions." });
    }

    if (!teamId || !["approve", "reject", "needs_revision"].includes(action)) {
      return res.status(400).json({ message: "Valid teamId and action (approve / needs_revision) are required." });
    }

    const team = await HackathonTeam.findByPk(teamId);
    if (!team) return res.status(404).json({ message: "Team not found." });

    const newStatus = action === "approve" ? "approved" : "needs_revision";

    await team.update({
      abstractionStatus: newStatus,
      reviewerId,
      reviewerFeedback: feedback ? String(feedback).trim() : team.reviewerFeedback,
      reviewedAt: new Date(),
    });

    return res.status(200).json({
      message: `Abstraction successfully ${newStatus === "approved" ? "Approved ✓" : "marked for revision"}!`,
      teamId: team.id,
      abstractionStatus: newStatus,
    });
  } catch (err) {
    console.error("Error in reviewAbstraction:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
