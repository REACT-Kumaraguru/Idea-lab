import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import Hackathon from "../../models/hackathon/HackathonModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import ExcelJS from "exceljs";

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

  let members = await Promise.all(
    membersRows.map(async (m) => {
      const u = await HackathonUser.findByPk(m.userId, {
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
    })
  );

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
          teamHackathonName,
          t.teamName || "",
          t.theme || "—",
          t.topic || "—",
          t.description || "—",
          t.inviteCode || "",
          t.status || "",
          t.leader?.fullName || "",
          t.leader?.email || "",
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
          teamHackathonName,
          t.teamName || "",
          t.theme || "—",
          t.topic || "—",
          t.description || "—",
          t.inviteCode || "",
          t.status || "",
          t.leader?.fullName || "",
          t.leader?.email || "",
          members.length,
          m.fullName || "",
          m.email || "",
          m.phoneNumber || m.phone || "",
          m.isLeader ? "Leader" : "Member",
          m.college || "",
          m.branch || "",
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

