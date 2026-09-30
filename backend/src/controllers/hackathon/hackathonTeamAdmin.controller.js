import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { sequelize } from "../../lib/db.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import Hackathon from "../../models/hackathon/HackathonModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonPaymentDetail from "../../models/hackathon/HackathonPaymentDetailModel.js";
import ExcelJS from "exceljs";

export const sanitizeExcelCell = (val) => {
  if (val == null) return "";
  const str = String(val);
  return /^[=@+\-\t\r]/.test(str) ? "'" + str : str;
};

const generateInviteCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[crypto.randomInt(0, alphabet.length)];
  return out;
};

async function serializeTeamForAdmin(teamInstance) {
  const team = teamInstance.toJSON ? teamInstance.toJSON() : teamInstance;
  const id = team.id;

  const leader = await HackathonUser.findByPk(team.leaderUserId, {
    attributes: [
      "id",
      "fullName",
      "email",
      "phone",
      "phoneNumber",
      "role",
      "degree",
      "graduationYear",
      "college",
      "branch",
    ],
  });

  const membersRows = await HackathonTeamMember.findAll({
    where: { teamId: id },
    order: [["created_at", "ASC"]],
  });

  const memberUserIds = membersRows.map((m) => m.userId).filter(Boolean);
  const memberUsers = memberUserIds.length > 0
    ? await HackathonUser.findAll({
        where: { id: { [Op.in]: memberUserIds } },
        attributes: [
          "id",
          "fullName",
          "email",
          "phone",
          "phoneNumber",
          "role",
          "degree",
          "graduationYear",
          "college",
          "branch",
        ],
      })
    : [];

  const userMap = new Map(memberUsers.map((u) => [u.id, u]));

  let members = membersRows.map((m) => {
    const u = userMap.get(m.userId);
    return {
      id: m.id,
      userId: m.userId,
      isLeader: m.isLeader === true,
      fullName: u?.fullName ?? null,
      email: u?.email ?? null,
      phoneNumber: u?.phoneNumber ?? null,
      phone: u?.phone ?? null,
      role: u?.role ?? null,
      degree: u?.degree ?? null,
      graduationYear: u?.graduationYear ?? null,
      college: u?.college ?? null,
      branch: u?.branch ?? null,
    };
  });

  if (members.length === 0 && team.leaderUserId) {
    const u = await HackathonUser.findByPk(team.leaderUserId, {
      attributes: [
        "id",
        "fullName",
        "email",
        "phone",
        "phoneNumber",
        "role",
        "degree",
        "graduationYear",
        "college",
        "branch",
      ],
    });
    if (u) {
      members = [
        {
          id: null,
          userId: team.leaderUserId,
          isLeader: true,
          fullName: u.fullName ?? null,
          email: u.email ?? null,
          phoneNumber: u.phoneNumber ?? null,
          phone: u.phone ?? null,
          role: u.role ?? null,
          degree: u.degree ?? null,
          graduationYear: u.graduationYear ?? null,
          college: u.college ?? null,
          branch: u.branch ?? null,
        },
      ];
    }
  }

  const submission = await HackathonSubmission.findOne({
    where: { teamId: id },
    order: [["created_at", "DESC"]],
  });
  let problem = null;
  if (submission && submission.problemId) {
    problem = await HackathonProblem.findByPk(submission.problemId);
  }

  const theme = team.theme || submission?.theme || "—";
  const topic = team.topic || submission?.title || problem?.title || "—";
  const description = team.description || submission?.description || problem?.description || "—";

  const teamMentor = await HackathonTeamMentor.findOne({ where: { teamId: id } });
  let assignedMentor = null;
  if (teamMentor) {
    const mentorRec = await HackathonMentor.findByPk(teamMentor.mentorId, {
      include: [{ model: HackathonUser, as: "user", attributes: ["id", "fullName", "email"] }],
    });
    if (mentorRec) {
      assignedMentor = {
        id: mentorRec.id,
        userId: mentorRec.userId,
        fullName: mentorRec.user?.fullName ?? "Mentor",
        email: mentorRec.user?.email ?? "",
      };
    }
  }

  let reviewerName = null;
  if (team.reviewerId) {
    const revUser = await HackathonUser.findByPk(team.reviewerId, { attributes: ["fullName"] });
    if (revUser) reviewerName = revUser.fullName;
  }

  return {
    id,
    hackathonId: team.hackathonId,
    teamName: team.teamName,
    theme,
    topic,
    description,
    abstractionStatus: team.abstractionStatus || "draft",
    reviewerId: team.reviewerId || null,
    reviewerFeedback: team.reviewerFeedback || null,
    reviewedAt: team.reviewedAt || null,
    reviewerName,
    inviteCode: team.inviteCode,
    status: team.status,
    leaderUserId: team.leaderUserId,
    assignedMentor,
    leader: leader
      ? {
          id: leader.id,
          fullName: leader.fullName,
          email: leader.email,
          phoneNumber: leader.phoneNumber,
          phone: leader.phone,
          role: leader.role,
          degree: leader.degree,
          graduationYear: leader.graduationYear,
          college: leader.college,
          branch: leader.branch,
        }
      : null,
    members,
  };
}

export const adminListTeams = async (req, res) => {
  try {
    const { hackathonId, reviewerStatus } = req.query || {};
    const where = {};
    if (hackathonId && Number.isInteger(Number(hackathonId))) {
      where.hackathonId = Number(hackathonId);
    }
    if (reviewerStatus) {
      where.abstractionStatus = reviewerStatus;
    }

    const [teamsRows, allHackathons] = await Promise.all([
      HackathonTeam.findAll({
        where,
        order: [["created_at", "DESC"]],
      }),
      Hackathon.findAll({ attributes: ["id", "name"] }),
    ]);

    const hackathonNameById = new Map(allHackathons.map((h) => [h.id, h.name]));

    const teams = await Promise.all(
      teamsRows.map(async (t) => {
        const serialized = await serializeTeamForAdmin(t);
        serialized.hackathonName = hackathonNameById.get(t.hackathonId) || "IDEA LAB Hackathon 2026";
        return serialized;
      })
    );

    return res.status(200).json({ teams });
  } catch (error) {
    console.log("Error in adminListTeams:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminExportTeamsExcel = async (req, res) => {
  try {
    const { hackathonId } = req.query || {};
    const where = {};
    let hackathonTitle = "All Hackathons";

    const allHackathons = await Hackathon.findAll({ attributes: ["id", "name"] });
    const hackathonNameById = new Map(allHackathons.map((h) => [h.id, h.name]));

    if (hackathonId && Number.isInteger(Number(hackathonId))) {
      where.hackathonId = Number(hackathonId);
      const found = hackathonNameById.get(Number(hackathonId));
      if (found) hackathonTitle = found;
    }

    const teamsRows = await HackathonTeam.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    const teams = await Promise.all(teamsRows.map((t) => serializeTeamForAdmin(t)));

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Teams");

    // Row 1: Hackathon Title Banner
    ws.mergeCells("A1:O1");
    const titleCell = ws.getCell("A1");
    titleCell.value = `Hackathon: ${hackathonTitle}`;
    titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FF1E3A8A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E7FF" } };
    ws.getRow(1).height = 36;

    // Row 2: Subtitle Metadata
    ws.mergeCells("A2:O2");
    const metaCell = ws.getCell("A2");
    metaCell.value = `Report: Registered Teams & Members  |  Generated: ${new Date().toLocaleDateString()}  |  Total Teams: ${teams.length}`;
    metaCell.font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "FF4B5563" } };
    metaCell.alignment = { vertical: "middle", horizontal: "center" };
    metaCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
    ws.getRow(2).height = 22;

    // Row 3: Blank spacing row
    ws.getRow(3).height = 10;

    // Row 4: Table Headers
    const HEADERS = [
      "S.No.",
      "Hackathon Name",
      "Team Name",
      "Selected Theme",
      "Topic (Title)",
      "Description",
      "Invite Code",
      "Status",
      "Leader Name",
      "Leader Email",
      "Members Count",
      "Member Name",
      "Member Email",
      "Member Phone",
      "Member Role",
      "Member College",
      "Member Branch",
    ];

    ws.getRow(4).values = HEADERS;
    const headerRow = ws.getRow(4);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    headerRow.height = 26;

    let sNo = 1;
    for (const t of teams) {
      const teamHackathonName = hackathonNameById.get(t.hackathonId) || hackathonTitle;
      const members = Array.isArray(t.members) ? t.members : [];
      if (members.length === 0) {
        ws.addRow([
          sNo++,
          sanitizeExcelCell(teamHackathonName),
          sanitizeExcelCell(t.teamName || ""),
          sanitizeExcelCell(t.theme || "—"),
          sanitizeExcelCell(t.topic || "—"),
          sanitizeExcelCell(t.description || "—"),
          sanitizeExcelCell(t.inviteCode || ""),
          sanitizeExcelCell(t.status || ""),
          sanitizeExcelCell(t.leader?.fullName || ""),
          sanitizeExcelCell(t.leader?.email || ""),
          0,
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
        continue;
      }

      for (const m of members) {
        ws.addRow([
          sNo++,
          sanitizeExcelCell(teamHackathonName),
          sanitizeExcelCell(t.teamName || ""),
          sanitizeExcelCell(t.theme || "—"),
          sanitizeExcelCell(t.topic || "—"),
          sanitizeExcelCell(t.description || "—"),
          sanitizeExcelCell(t.inviteCode || ""),
          sanitizeExcelCell(t.status || ""),
          sanitizeExcelCell(t.leader?.fullName || ""),
          sanitizeExcelCell(t.leader?.email || ""),
          members.length,
          sanitizeExcelCell(m.fullName || ""),
          sanitizeExcelCell(m.email || ""),
          sanitizeExcelCell(m.phoneNumber || m.phone || ""),
          m.isLeader ? "Leader" : "Member",
          sanitizeExcelCell(m.college || ""),
          sanitizeExcelCell(m.branch || ""),
        ]);
      }
    }

    ws.columns.forEach((col) => {
      col.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const cleanTitle = hackathonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="teams_${cleanTitle}_${dateStr}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.log("Error in adminExportTeamsExcel:", error.message);
    return res.status(500).json({ message: "Failed to export teams" });
  }
};

export const adminDeleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await HackathonTeam.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    await sequelize.transaction(async (t) => {
      await HackathonTeamMember.destroy({ where: { teamId }, transaction: t });
      await HackathonSubmission.destroy({ where: { teamId }, transaction: t });
      await HackathonTeamMentor.destroy({ where: { teamId }, transaction: t });
      await HackathonPaymentDetail.destroy({ where: { teamId }, transaction: t });
      await team.destroy({ transaction: t });
    });

    return res.json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error in adminDeleteTeam:", error);
    return res.status(500).json({ message: "Failed to delete team" });
  }
};

export const adminCreateTeam = async (req, res) => {
  try {
    const { teamName, hackathonId = 1, theme, topic, description, leaderEmail, leaderName } = req.body;
    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }

    // Auto-generate cryptographically secure unique 8-char invite code
    let inviteCode = generateInviteCode();
    let collisionCheck = 0;
    while (await HackathonTeam.findOne({ where: { inviteCode } })) {
      inviteCode = generateInviteCode();
      collisionCheck++;
      if (collisionCheck > 10) break;
    }

    const defaultHashedPassword = await bcrypt.hash("studentDefaultPassword123!", 10);

    // Find or create leader user
    let leaderUser = null;
    if (leaderEmail && leaderEmail.trim()) {
      leaderUser = await HackathonUser.findOne({ where: { email: leaderEmail.trim().toLowerCase() } });
      if (!leaderUser) {
        leaderUser = await HackathonUser.create({
          email: leaderEmail.trim().toLowerCase(),
          fullName: leaderName?.trim() || "Team Leader",
          password: defaultHashedPassword,
          role: "student",
        });
      }
    } else {
      // Create a placeholder leader if none supplied
      const dummyEmail = `leader_${Date.now()}@hackathon.local`;
      leaderUser = await HackathonUser.create({
        email: dummyEmail,
        fullName: leaderName?.trim() || "Team Leader",
        password: defaultHashedPassword,
        role: "student",
      });
    }

    const team = await HackathonTeam.create({
      teamName: teamName.trim(),
      hackathonId: Number(hackathonId) || 1,
      theme: theme || "General Innovation",
      topic: topic || "",
      description: description || "",
      inviteCode,
      leaderUserId: leaderUser.id,
      status: "active",
      abstractionStatus: "draft",
    });

    await HackathonTeamMember.create({
      teamId: team.id,
      userId: leaderUser.id,
      isLeader: true,
    });

    const serialized = await serializeTeamForAdmin(team);
    return res.status(201).json({ success: true, message: "Team created successfully", team: serialized });
  } catch (error) {
    console.error("Error in adminCreateTeam:", error);
    return res.status(500).json({ message: error.message || "Failed to create team" });
  }
};

export const adminUpdateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { teamName, theme, topic, description, cluster, benchNumber } = req.body;

    const team = await HackathonTeam.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const updates = {};
    if (teamName !== undefined) updates.teamName = teamName.trim();
    if (theme !== undefined) updates.theme = theme;
    if (topic !== undefined) updates.topic = topic;
    if (description !== undefined) updates.description = description;
    if (cluster !== undefined) updates.cluster = cluster;
    if (benchNumber !== undefined) updates.benchNumber = benchNumber;

    await team.update(updates);
    const serialized = await serializeTeamForAdmin(team);
    return res.json({ success: true, message: "Team updated successfully", team: serialized });
  } catch (error) {
    console.error("Error in adminUpdateTeam:", error);
    return res.status(500).json({ message: "Failed to update team" });
  }
};

export const adminAddTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, fullName, role = "student" } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Member email is required" });
    }

    const team = await HackathonTeam.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    let user = await HackathonUser.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      const defaultHashedPassword = await bcrypt.hash("studentDefaultPassword123!", 10);
      user = await HackathonUser.create({
        email: email.trim().toLowerCase(),
        fullName: fullName?.trim() || "Team Member",
        password: defaultHashedPassword,
        role: "student",
      });
    }

    const existingMember = await HackathonTeamMember.findOne({ where: { teamId, userId: user.id } });
    if (existingMember) {
      return res.status(400).json({ message: "Student is already in this team" });
    }

    await HackathonTeamMember.create({
      teamId: team.id,
      userId: user.id,
      isLeader: false,
    });

    const serialized = await serializeTeamForAdmin(team);
    return res.status(201).json({ success: true, message: "Member added successfully", team: serialized });
  } catch (error) {
    console.error("Error in adminAddTeamMember:", error);
    return res.status(500).json({ message: "Failed to add member" });
  }
};

export const adminRemoveTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const member = await HackathonTeamMember.findOne({ where: { teamId, userId } });
    if (!member) {
      return res.status(404).json({ message: "Member not found in team" });
    }

    await member.destroy();

    const team = await HackathonTeam.findByPk(teamId);
    const serialized = team ? await serializeTeamForAdmin(team) : null;
    return res.json({ success: true, message: "Member removed from team", team: serialized });
  } catch (error) {
    console.error("Error in adminRemoveTeamMember:", error);
    return res.status(500).json({ message: "Failed to remove member" });
  }
};


