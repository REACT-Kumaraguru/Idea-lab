import { Op } from "sequelize";
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

const getUserIdFromSession = (req) => {
  const id = req.hackathonUser?.id ?? req.session?.user?.id;
  return Number(id);
};

const buildTeamSummary = async ({ team, currentUserId }) => {
  const membersRows = await HackathonTeamMember.findAll({
    where: { teamId: team.id },
    order: [["created_at", "ASC"]],
  });

  const members = await Promise.all(
    membersRows.map(async (m) => {
      const memberUser = await HackathonUser.findByPk(m.userId, {
        attributes: { exclude: ["password"] },
      });

      return {
        id: m.id,
        userId: m.userId,
        isLeader: m.isLeader === true,
        member: memberUser
          ? {
              id: memberUser.id,
              fullName: memberUser.fullName,
              email: memberUser.email,
              phoneNumber: memberUser.phoneNumber,
              role: memberUser.role,
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
    // Useful for UI, but not required by API consumers
    isLeader: team.leaderUserId === currentUserId,
    members,
  };
};

const getTeamForStudentUserId = async (userId) => {
  const member = await HackathonTeamMember.findOne({ where: { userId } });
  if (member?.teamId) {
    const team = await HackathonTeam.findByPk(member.teamId);
    if (!team) return null;
    return buildTeamSummary({ team, currentUserId: userId });
  }

  // Fallback if membership row is missing for some reason
  const leaderTeam = await HackathonTeam.findOne({ where: { leaderUserId: userId } });
  if (!leaderTeam) return null;
  return buildTeamSummary({ team: leaderTeam, currentUserId: userId });
};

const getTeamForMentorUserId = async (userId) => {
  const mentorRow = await HackathonMentor.findOne({ where: { userId } });
  if (!mentorRow) return null;

  const assignment = await HackathonTeamMentor.findOne({ where: { mentorId: mentorRow.id } });
  if (!assignment?.teamId) return null;

  const team = await HackathonTeam.findByPk(assignment.teamId);
  if (!team) return null;
  return buildTeamSummary({ team, currentUserId: userId });
};

export const createTeam = async (req, res) => {
  const { teamName } = req.body || {};
  try {
    if (!teamName?.trim()) return res.status(400).json({ message: "Team name is required" });

    const nameTaken = await HackathonTeam.findOne({
      where: { teamName: { [Op.iLike]: teamName.trim() } },
    });
    if (nameTaken) {
      return res.status(400).json({ message: "This team name is already taken" });
    }

    const userId = getUserIdFromSession(req);

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

    const teamSummary = await buildTeamSummary({ team, currentUserId: userId });
    return res.status(201).json(teamSummary);
  } catch (error) {
    console.log("Error in createTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const joinTeam = async (req, res) => {
  const { inviteCode } = req.body || {};
  try {
    if (!inviteCode?.trim()) return res.status(400).json({ message: "Invite code is required" });

    const userId = getUserIdFromSession(req);

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

    const teamSummary = await buildTeamSummary({ team, currentUserId: userId });
    return res.status(201).json(teamSummary);
  } catch (error) {
    console.log("Error in joinTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyTeam = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const role = req.hackathonUser.role;
    let teamSummary = null;

    if (role === "student") {
      teamSummary = await getTeamForStudentUserId(userId);
    } else if (role === "mentor") {
      teamSummary = await getTeamForMentorUserId(userId);
    }

    return res.status(200).json({ team: teamSummary || null });
  } catch (error) {
    console.log("Error in getMyTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

