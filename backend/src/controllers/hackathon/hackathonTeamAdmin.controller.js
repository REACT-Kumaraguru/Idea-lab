import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";

async function serializeTeamForAdmin(teamInstance) {
  const team = teamInstance.toJSON ? teamInstance.toJSON() : teamInstance;
  const id = team.id;

  const leader = await HackathonUser.findByPk(team.leaderUserId, {
    attributes: ["id", "fullName", "email", "phoneNumber", "role"],
  });

  const membersRows = await HackathonTeamMember.findAll({
    where: { teamId: id },
    order: [["created_at", "ASC"]],
  });

  const members = await Promise.all(
    membersRows.map(async (m) => {
      const u = await HackathonUser.findByPk(m.userId, {
        attributes: ["id", "fullName", "email", "phoneNumber", "role"],
      });
      return {
        id: m.id,
        userId: m.userId,
        isLeader: m.isLeader === true,
        fullName: u?.fullName ?? null,
        email: u?.email ?? null,
        phoneNumber: u?.phoneNumber ?? null,
        role: u?.role ?? null,
      };
    })
  );

  return {
    id,
    teamName: team.teamName,
    inviteCode: team.inviteCode,
    status: team.status,
    leaderUserId: team.leaderUserId,
    leader: leader
      ? {
          id: leader.id,
          fullName: leader.fullName,
          email: leader.email,
          phoneNumber: leader.phoneNumber,
          role: leader.role,
        }
      : null,
    members,
  };
}

export const adminListTeams = async (req, res) => {
  try {
    const teamsRows = await HackathonTeam.findAll({
      order: [["created_at", "DESC"]],
    });

    const teams = await Promise.all(teamsRows.map((t) => serializeTeamForAdmin(t)));

    return res.status(200).json({ teams });
  } catch (error) {
    console.log("Error in adminListTeams:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminSetTeamStatus = async (req, res) => {
  try {
    return res.status(403).json({
      message: "Manual team approval is disabled. A team becomes active automatically when it reaches 4 members.",
    });
  } catch (error) {
    console.log("Error in adminSetTeamStatus:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
