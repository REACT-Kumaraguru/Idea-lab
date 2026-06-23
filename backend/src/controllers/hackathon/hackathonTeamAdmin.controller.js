import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
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

  const members = await Promise.all(
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

export const adminExportTeamsExcel = async (req, res) => {
  try {
    const teamsRows = await HackathonTeam.findAll({
      order: [["created_at", "DESC"]],
    });
    const teams = await Promise.all(teamsRows.map((t) => serializeTeamForAdmin(t)));

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Teams");
    ws.addRow([
      "Team Name",
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
    ]);
    ws.getRow(1).font = { bold: true };

    for (const t of teams) {
      const members = Array.isArray(t.members) ? t.members : [];
      if (members.length === 0) {
        ws.addRow([
          t.teamName || "",
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
          t.teamName || "",
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
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="teams_${dateStr}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.log("Error in adminExportTeamsExcel:", error.message);
    return res.status(500).json({ message: "Failed to export teams" });
  }
};

