import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";

const generateInviteCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
};

export const createTeam = async (req, res) => {
  const { teamName } = req.body || {};
  try {
    if (!teamName?.trim()) return res.status(400).json({ message: "Team name is required" });

    const userId = Number(req.hackathonUser.id);

    const existingMembership = await HackathonTeamMember.findOne({ where: { userId } });
    if (existingMembership) {
      return res.status(400).json({ message: "You already belong to a team" });
    }

    let inviteCode = generateInviteCode();
    // Extremely unlikely, but ensures uniqueness
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existingTeam = await HackathonTeam.findOne({ where: { inviteCode } });
      if (!existingTeam) break;
      inviteCode = generateInviteCode();
    }

    const team = await HackathonTeam.create({
      teamName: teamName.trim(),
      inviteCode,
      leaderUserId: userId,
      status: "pending",
    });

    await HackathonTeamMember.create({
      teamId: team.id,
      userId,
      isLeader: true,
    });

    return res.status(201).json({
      id: team.id,
      teamName: team.teamName,
      inviteCode: team.inviteCode,
      status: team.status,
      leaderUserId: team.leaderUserId,
    });
  } catch (error) {
    console.log("Error in createTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const joinTeam = async (req, res) => {
  const { inviteCode } = req.body || {};
  try {
    if (!inviteCode?.trim()) return res.status(400).json({ message: "Invite code is required" });

    const userId = Number(req.hackathonUser.id);

    const existingMembership = await HackathonTeamMember.findOne({ where: { userId } });
    if (existingMembership) return res.status(400).json({ message: "You already belong to a team" });

    const team = await HackathonTeam.findOne({ where: { inviteCode: inviteCode.trim() } });
    if (!team) return res.status(404).json({ message: "Invalid invite code" });

    if (team.status !== "pending") return res.status(400).json({ message: "This team is not open for joining" });

    const memberCount = await HackathonTeamMember.count({ where: { teamId: team.id } });
    if (memberCount >= 4) return res.status(400).json({ message: "Team is full (max 4 members)" });

    const membership = await HackathonTeamMember.create({
      teamId: team.id,
      userId,
      isLeader: false,
    });

    return res.status(201).json({
      id: team.id,
      teamName: team.teamName,
      inviteCode: team.inviteCode,
      status: team.status,
      memberId: membership.id,
    });
  } catch (error) {
    console.log("Error in joinTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyTeam = async (req, res) => {
  try {
    const userId = Number(req.hackathonUser.id);
    const role = req.hackathonUser.role;

    // Student: team membership via hackathon_team_members
    if (role === "student") {
      const member = await HackathonTeamMember.findOne({ where: { userId } });

      // Fallback: if membership row missing, try leader_user_id.
      const team =
        member?.teamId
          ? await HackathonTeam.findOne({
              where: { id: member.teamId },
              include: [
                { model: HackathonTeamMember, as: "members", include: [{ model: HackathonUser, as: "member" }] },
                {
                  model: HackathonUser,
                  as: "leader",
                  attributes: ["id", "fullName", "email", "phoneNumber", "role"],
                },
              ],
            })
          : await HackathonTeam.findOne({
              where: { leaderUserId: userId },
              include: [
                { model: HackathonTeamMember, as: "members", include: [{ model: HackathonUser, as: "member" }] },
                {
                  model: HackathonUser,
                  as: "leader",
                  attributes: ["id", "fullName", "email", "phoneNumber", "role"],
                },
              ],
            });

      if (!team) return res.status(200).json({ team: null });

      return res.status(200).json({
        id: team.id,
        teamName: team.teamName,
        inviteCode: team.inviteCode,
        status: team.status,
        leaderUserId: team.leaderUserId,
        isLeader: member ? member.isLeader : team.leaderUserId === userId,
        members: (team.members || []).map((m) => ({
          id: m.id,
          userId: m.userId,
          isLeader: m.isLeader,
          member: m.member
            ? {
                id: m.member.id,
                fullName: m.member.fullName,
                email: m.member.email,
                phoneNumber: m.member.phoneNumber,
                role: m.member.role,
              }
            : null,
        })),
      });
    }

    // Mentor: assigned team via hackathon_team_mentor
    if (role === "mentor") {
      const mentorRow = await HackathonMentor.findOne({ where: { userId } });
      if (!mentorRow) return res.status(200).json({ team: null });

      const assignment = await HackathonTeamMentor.findOne({ where: { mentorId: mentorRow.id } });
      const teamId = assignment?.teamId || null;
      if (!teamId) return res.status(200).json({ team: null });

      const team = await HackathonTeam.findOne({
        where: { id: teamId },
        include: [
          { model: HackathonTeamMember, as: "members", include: [{ model: HackathonUser, as: "member" }] },
          { model: HackathonUser, as: "leader", attributes: ["id", "fullName", "email", "phoneNumber", "role"] },
        ],
      });

      if (!team) return res.status(200).json({ team: null });

      return res.status(200).json({
        id: team.id,
        teamName: team.teamName,
        inviteCode: team.inviteCode,
        status: team.status,
        leaderUserId: team.leaderUserId,
        isLeader: false,
        members: (team.members || []).map((m) => ({
          id: m.id,
          userId: m.userId,
          isLeader: m.isLeader,
          member: m.member
            ? {
                id: m.member.id,
                fullName: m.member.fullName,
                email: m.member.email,
                phoneNumber: m.member.phoneNumber,
                role: m.member.role,
              }
            : null,
        })),
      });
    }

    return res.status(200).json({ team: null });
  } catch (error) {
    console.log("Error in getMyTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

