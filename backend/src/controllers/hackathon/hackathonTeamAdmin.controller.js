import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";

export const adminListTeams = async (req, res) => {
  try {
    const teams = await HackathonTeam.findAll({
      include: [
        { model: HackathonUser, as: "leader", attributes: ["id", "fullName", "email", "role"] },
        {
          model: HackathonTeamMember,
          as: "members",
          attributes: ["id", "userId", "isLeader"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      teams: teams.map((t) => ({
        id: t.id,
        teamName: t.teamName,
        inviteCode: t.inviteCode,
        status: t.status,
        leaderUserId: t.leaderUserId,
        leader: t.leader || null,
        members: t.members || [],
      })),
    });
  } catch (error) {
    console.log("Error in adminListTeams:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminSetTeamStatus = async (req, res) => {
  const { status } = req.body || {};
  try {
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const team = await HackathonTeam.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Lock after admin decision
    if (team.status !== "pending") {
      return res.status(400).json({ message: "Team decision is already locked" });
    }

    await team.update({ status });
    return res.status(200).json({ team });
  } catch (error) {
    console.log("Error in adminSetTeamStatus:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

