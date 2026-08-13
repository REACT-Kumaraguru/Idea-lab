import { Op } from "sequelize";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";

import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonPaymentDetail from "../../models/hackathon/HackathonPaymentDetailModel.js";

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

const deleteTeamCascade = async (teamId) => {
  const id = Number(teamId);
  if (!id) return;
  try {
    await HackathonTeamMentor.destroy({ where: { teamId: id } });
    await HackathonPaymentDetail.destroy({ where: { teamId: id } });
    await HackathonSubmission.destroy({ where: { teamId: id } });
    await HackathonTeamMember.destroy({ where: { teamId: id } });
    await HackathonTeam.destroy({ where: { id } });
  } catch (e) {
    console.error(`Error in deleteTeamCascade for teamId ${id}:`, e.message);
  }
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

  let reviewerName = null;
  if (team.reviewerId) {
    const revUser = await HackathonUser.findByPk(team.reviewerId, { attributes: ["fullName"] });
    if (revUser) reviewerName = revUser.fullName;
  }

  return {
    id: team.id,
    teamName: team.teamName,
    inviteCode: team.inviteCode,
    status: team.status,
    leaderUserId: team.leaderUserId,
    theme: team.theme || null,
    topic: team.topic || null,
    description: team.description || null,
    hackathonId: team.hackathonId || null,
    abstractionStatus: team.abstractionStatus || "draft",
    reviewerId: team.reviewerId || null,
    reviewerFeedback: team.reviewerFeedback || null,
    reviewedAt: team.reviewedAt || null,
    reviewerName,
    isLeader: team.leaderUserId === currentUserId,
    members,
  };
};

const getTeamForStudentUserId = async (userId, targetHackathonId) => {
  const members = await HackathonTeamMember.findAll({ where: { userId } });
  if (!members || members.length === 0) return null;

  const teamIds = members.map((m) => m.teamId);
  const hackathonWhere = targetHackathonId
    ? { hackathonId: Number(targetHackathonId) }
    : {};

  const team = await HackathonTeam.findOne({
    where: { id: { [Op.in]: teamIds }, ...hackathonWhere },
    order: [["created_at", "DESC"]],
  });

  if (!team) return null;
  return buildTeamSummary({ team, currentUserId: userId });
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
  const { teamName, theme, topic, description, hackathonId } = req.body || {};
  try {
    if (!teamName?.trim()) return res.status(400).json({ message: "Team name is required" });

    const existingTeams = await HackathonTeam.findAll({ attributes: ["id", "teamName"] });
    const nameTaken = existingTeams.some(
      (t) => t.teamName && t.teamName.trim().toLowerCase() === teamName.trim().toLowerCase()
    );
    if (nameTaken) {
      return res.status(400).json({ message: "This team name is already taken" });
    }

    const userId = getUserIdFromSession(req);
    const targetHackathonId = hackathonId ? Number(hackathonId) : null;

    const userMemberships = await HackathonTeamMember.findAll({ where: { userId } });
    const userTeamIds = userMemberships.map((m) => m.teamId);
    if (userTeamIds.length > 0) {
      const existingInSameHackathon = await HackathonTeam.findOne({
        where: {
          id: { [Op.in]: userTeamIds },
          ...(targetHackathonId ? { hackathonId: targetHackathonId } : {}),
        },
      });
      if (existingInSameHackathon) {
        return res.status(400).json({ message: "You already belong to a team in this hackathon" });
      }
    }

    let inviteCode = generateInviteCode();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existingTeam = await HackathonTeam.findOne({ where: { inviteCode } });
      if (!existingTeam) break;
      inviteCode = generateInviteCode();
    }

    const team = await HackathonTeam.create({
      teamName: teamName.trim(),
      theme: theme ? String(theme).trim() : null,
      topic: topic ? String(topic).trim() : null,
      description: description ? String(description).trim() : null,
      inviteCode,
      leaderUserId: userId,
      status: "approved",
      hackathonId: targetHackathonId,
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

    const team = await HackathonTeam.findOne({ where: { inviteCode: inviteCode.trim() } });
    if (!team) return res.status(404).json({ message: "Invalid invite code" });

    if (!["pending", "approved"].includes(team.status)) {
      return res.status(400).json({ message: "This team is not open for joining" });
    }

    const userMemberships = await HackathonTeamMember.findAll({ where: { userId } });
    const userTeamIds = userMemberships.map((m) => m.teamId);
    if (userTeamIds.length > 0) {
      const existingInSameHackathon = await HackathonTeam.findOne({
        where: {
          id: { [Op.in]: userTeamIds },
          ...(team.hackathonId ? { hackathonId: team.hackathonId } : {}),
        },
      });
      if (existingInSameHackathon) {
        return res.status(400).json({ message: "You already belong to a team in this hackathon" });
      }
    }

    const memberCount = await HackathonTeamMember.count({ where: { teamId: team.id } });
    if (memberCount >= 4) return res.status(400).json({ message: "Team is full (max 4 members)" });

    await HackathonTeamMember.create({
      teamId: team.id,
      userId,
      isLeader: false,
    });

    const finalMemberCount = await HackathonTeamMember.count({ where: { teamId: team.id } });
    if (finalMemberCount >= 1 && team.status !== "approved") {
      await team.update({ status: "approved" });
    }

    const teamSummary = await buildTeamSummary({ team, currentUserId: userId });
    return res.status(201).json(teamSummary);
  } catch (error) {
    console.log("Error in joinTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const leaveTeam = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const role = req.hackathonUser?.role;
    const { teamId } = req.body || {};

    let targetTeamId = teamId ? Number(teamId) : null;
    let membership = null;

    if (targetTeamId) {
      membership = await HackathonTeamMember.findOne({ where: { userId, teamId: targetTeamId } });
    } else {
      membership = await HackathonTeamMember.findOne({ where: { userId } });
      if (membership) targetTeamId = membership.teamId;
    }

    if (!membership && role !== "admin") {
      return res.status(400).json({ message: "You are not a member of this team." });
    }

    if (!targetTeamId) {
      return res.status(400).json({ message: "Team ID is required." });
    }

    const team = await HackathonTeam.findByPk(targetTeamId);
    if (!team) {
      if (membership) await membership.destroy();
      return res.status(200).json({ message: "Left team successfully." });
    }

    const existingSubmission = await HackathonSubmission.findOne({ where: { teamId: team.id } });
    if (existingSubmission && existingSubmission.status === "approved" && role !== "admin") {
      return res.status(400).json({ message: "Cannot leave team after submission has been approved by admin." });
    }

    const allMembers = await HackathonTeamMember.findAll({
      where: { teamId: team.id },
      order: [["created_at", "ASC"]],
    });
    const remaining = allMembers.filter((m) => m.userId !== userId);

    if (remaining.length === 0 || role === "admin") {
      // Last member leaving or Admin operation: dismantle team & submissions completely
      await deleteTeamCascade(team.id);
    } else {
      // If leaving user was leader, transfer leadership to next member
      if (membership.isLeader || team.leaderUserId === userId) {
        const nextLeader = remaining[0];
        await nextLeader.update({ isLeader: true });
        await team.update({ leaderUserId: nextLeader.userId });
      }
      await membership.destroy();
    }

    return res.status(200).json({ message: "Left team successfully." });
  } catch (error) {
    console.error("Error in leaveTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const dismantleTeam = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const role = req.hackathonUser?.role;
    const { teamId } = req.body || {};

    let targetTeamId = teamId ? Number(teamId) : null;
    let membership = null;

    if (targetTeamId) {
      membership = await HackathonTeamMember.findOne({ where: { userId, teamId: targetTeamId } });
    } else {
      membership = await HackathonTeamMember.findOne({ where: { userId } });
      if (membership) targetTeamId = membership.teamId;
    }

    if (!targetTeamId) {
      return res.status(400).json({ message: "Team ID is required." });
    }

    const team = await HackathonTeam.findByPk(targetTeamId);
    if (!team) {
      await deleteTeamCascade(targetTeamId);
      return res.status(200).json({ message: "Team dismantled successfully." });
    }

    const isLeader = membership?.isLeader || team.leaderUserId === userId;
    if (!isLeader && role !== "admin") {
      return res.status(403).json({ message: "Only the Team Leader or Admin can dismantle the team." });
    }

    const existingSubmission = await HackathonSubmission.findOne({ where: { teamId: team.id } });
    if (existingSubmission && existingSubmission.status === "approved" && role !== "admin") {
      return res.status(400).json({ message: "Cannot dismantle team after submission has been approved by admin." });
    }

    // Clean up submissions, members and delete team
    await deleteTeamCascade(team.id);

    return res.status(200).json({ message: "Team dismantled successfully." });
  } catch (error) {
    console.error("Error in dismantleTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyTeam = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const role = req.hackathonUser?.role;
    const { hackathonId } = req.query || {};
    let teamSummary = null;

    if (role === "student" || role === "admin") {
      teamSummary = await getTeamForStudentUserId(userId, hackathonId);
    } else if (role === "mentor") {
      // Mentors evaluate student submissions; return null team to display Mentor Guidance Workspace
      teamSummary = null;
    }

    return res.status(200).json({ team: teamSummary || null });
  } catch (error) {
    console.log("Error in getMyTeam:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCustomProblem = async (req, res) => {
  const { topic, description, theme } = req.body || {};
  try {
    const userId = getUserIdFromSession(req);
    const teamMember = await HackathonTeamMember.findOne({ where: { userId } });
    const team = teamMember?.teamId
      ? await HackathonTeam.findByPk(teamMember.teamId)
      : await HackathonTeam.findOne({ where: { leaderUserId: userId } });

    if (!team) return res.status(400).json({ message: "You must be part of a team" });

    const isLeader = teamMember ? teamMember.isLeader === true : team.leaderUserId === userId;
    if (!isLeader) {
      return res.status(403).json({ message: "Only team leader can update personalized problem statement" });
    }

    const newTheme = theme ? String(theme).trim() : team.theme;

    // Find reviewers for this theme to assign
    let reviewerId = team.reviewerId;
    if (newTheme) {
      const themeReviewers = await HackathonUser.findAll({
        where: { role: "reviewer", assignedTheme: newTheme },
      });
      if (themeReviewers.length > 0) {
        // Pick one reviewer for this theme
        reviewerId = themeReviewers[Math.floor(Math.random() * themeReviewers.length)].id;
      }
    }

    await team.update({
      theme: newTheme,
      topic: topic ? String(topic).trim() : team.topic,
      description: description ? String(description).trim() : team.description,
      abstractionStatus: "submitted",
      reviewerId,
    });

    const summary = await buildTeamSummary({ team, currentUserId: userId });
    return res.status(200).json({
      message: "Problem statement submitted successfully! Sent to theme reviewer for approval.",
      team: summary,
    });
  } catch (err) {
    console.error("Error in updateCustomProblem:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

