/**
 * Excel export for hackathon submissions (admin).
 *
 * Uses Sequelize models (PostgreSQL). Equivalent relational shape:
 *
 * SELECT
 *   p.title AS problem_statement,
 *   t.team_name,
 *   u.full_name, u.email, u.phone_number, u.degree, u.graduation_year, u.college, u.branch,
 *   s.why_participate, s.problem_to_solve, s.worked_before, s.planned_tech, s.description,
 *   s.poc_file_paths, s.prototype_file_paths
 * FROM hackathon_submissions s
 * JOIN hackathon_teams t ON t.id = s.team_id
 * JOIN hackathon_problems p ON p.id = s.problem_id
 * JOIN hackathon_team_members m ON m.team_id = t.id
 * JOIN hackathon_users u ON u.id = m.user_id
 * ORDER BY p.id, t.team_name, u.full_name;
 *
 * Access: GET /api/ich2026/admin/submissions/export-xlsx (hackathon admin session, not HTTP basic auth).
 */
import ExcelJS from "exceljs";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import Hackathon from "../../models/hackathon/HackathonModel.js";

const HEADERS = [
  "S.No.",
  "Hackathon Name",
  "Team Name",
  "Selected Theme",
  "Team Member Name",
  "Email",
  "Phone Number",
  "Degree",
  "Graduation Year",
  "College",
  "Branch",
  "Participation Details",
  "Project Description",
  "Technologies Used",
  "Uploaded File",
];

/** Excel sheet name: max 31 chars, no : \ / ? * [ ] */
function sanitizeSheetName(raw, usedNames) {
  let s = String(raw || "Problem")
    .replace(/[:\\/?*[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length > 31) s = s.slice(0, 31).trim();
  if (!s) s = "Problem";

  let candidate = s;
  let n = 2;
  while (usedNames.has(candidate)) {
    const suffix = ` (${n})`;
    candidate = (s.length + suffix.length > 31 ? s.slice(0, 31 - suffix.length) : s) + suffix;
    n += 1;
  }
  usedNames.add(candidate);
  return candidate;
}

function buildParticipationDetails(sub) {
  const parts = [];
  if (sub.whyParticipate) parts.push(`Why participate: ${sub.whyParticipate}`);
  if (sub.problemToSolve) parts.push(`Problem to solve: ${sub.problemToSolve}`);
  if (sub.workedBefore) parts.push(`Worked before: ${sub.workedBefore}`);
  if (sub.agreedTerms != null) parts.push(`Agreed to terms: ${sub.agreedTerms ? "Yes" : "No"}`);
  return parts.join("\n");
}

function collectFilePaths(sub) {
  const poc = Array.isArray(sub.pocFilePaths) ? sub.pocFilePaths : [];
  const proto = Array.isArray(sub.prototypeFilePaths) ? sub.prototypeFilePaths : [];
  return [...poc, ...proto].filter(Boolean);
}

/** Build absolute URL for stored path (e.g. /api/ich2026/download/...) */
function resolveFileUrl(req, storedPath) {
  if (!storedPath) return "";
  const s = String(storedPath);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const host = req.get("host") || "localhost";
  const proto = req.protocol || "http";
  if (s.startsWith("/")) return `${proto}://${host}${s}`;
  return `${proto}://${host}/${s}`;
}

/**
 * Admin export: all submissions → Excel, one sheet per problem (problem title).
 * Each row = one team member; team / submission fields repeated per member.
 */
export const adminExportSubmissionsExcel = async (req, res) => {
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

    const submissions = await HackathonSubmission.findAll({
      where,
      order: [["created_at", "ASC"]],
    });

    const teamIds = [...new Set(submissions.map((s) => s.teamId))];
    const problemIds = [...new Set(submissions.map((s) => s.problemId))];

    const [teams, problems, membersRows] = await Promise.all([
      teamIds.length
        ? HackathonTeam.findAll({ where: { id: teamIds } })
        : Promise.resolve([]),
      problemIds.length
        ? HackathonProblem.findAll({ where: { id: problemIds } })
        : Promise.resolve([]),
      teamIds.length
        ? HackathonTeamMember.findAll({
            where: { teamId: teamIds },
            order: [["created_at", "ASC"]],
          })
        : Promise.resolve([]),
    ]);

    const teamById = new Map(teams.map((t) => [t.id, t]));
    const problemById = new Map(problems.map((p) => [p.id, p]));

    const userIds = [...new Set(membersRows.map((m) => m.userId))];
    const users = userIds.length
      ? await HackathonUser.findAll({
          where: { id: userIds },
          attributes: [
            "id",
            "fullName",
            "email",
            "phone",
            "phoneNumber",
            "degree",
            "graduationYear",
            "college",
            "branch",
          ],
        })
      : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    const membersByTeamId = new Map();
    for (const m of membersRows) {
      if (!membersByTeamId.has(m.teamId)) membersByTeamId.set(m.teamId, []);
      membersByTeamId.get(m.teamId).push(m);
    }

    /** problemId -> { title, rows } */
    const groups = new Map();

    for (const sub of submissions) {
      const subPlain = sub.toJSON ? sub.toJSON() : sub;
      const team = teamById.get(sub.teamId);
      const problem = problemById.get(sub.problemId);
      const problemId = sub.problemId;
      const problemTitle = problem?.title?.trim() || `Problem #${problemId}`;
      const teamName = team?.teamName?.trim() || `Team #${sub.teamId}`;
      const teamHackathonName = hackathonNameById.get(sub.hackathonId) || hackathonTitle;

      const participation = buildParticipationDetails(subPlain);
      const description = subPlain.description || "";
      const tech = subPlain.plannedTech || "";
      const filePaths = collectFilePaths(subPlain);
      const fileUrls = filePaths.map((p) => resolveFileUrl(req, p));
      const fileLabel =
        fileUrls.length === 0
          ? ""
          : fileUrls.length === 1
            ? fileUrls[0].split("/").pop() || fileUrls[0]
            : `${fileUrls[0].split("/").pop() || "files"} (+${fileUrls.length - 1} more)`;

      const memberRows = membersByTeamId.get(sub.teamId) || [];
      const sortedMembers = [...memberRows].sort((a, b) => {
        const ua = userById.get(a.userId);
        const ub = userById.get(b.userId);
        const na = (ua?.fullName || "").localeCompare(ub?.fullName || "");
        return na;
      });

      const theme = team?.theme || subPlain.theme || "—";
      const rowsForSub = [];
      if (sortedMembers.length === 0) {
        rowsForSub.push({
          hackathonName: teamHackathonName,
          teamName,
          theme,
          memberName: "",
          email: "",
          phone: "",
          degree: "",
          gradYear: "",
          college: "",
          branch: "",
          participation,
          description,
          tech,
          fileLinkUrl: fileUrls[0] || "",
          fileLabel: fileLabel || "",
          allFileUrls: fileUrls,
        });
      } else {
        for (const tm of sortedMembers) {
          const u = userById.get(tm.userId);
          rowsForSub.push({
            hackathonName: teamHackathonName,
            teamName,
            theme,
            memberName: u?.fullName || "",
            email: u?.email || "",
            phone: u?.phoneNumber || u?.phone || "",
            degree: u?.degree || "",
            gradYear: u?.graduationYear != null ? String(u.graduationYear) : "",
            college: u?.college || "",
            branch: u?.branch || "",
            participation,
            description,
            tech,
            fileLinkUrl: fileUrls[0] || "",
            fileLabel: fileLabel || "",
            allFileUrls: fileUrls,
          });
        }
      }

      if (!groups.has(problemId)) groups.set(problemId, { title: problemTitle, rows: [] });
      groups.get(problemId).rows.push(...rowsForSub);
    }

    for (const [, { rows }] of groups) {
      rows.sort((a, b) => a.teamName.localeCompare(b.teamName));
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "IDEA Lab Hackathon";
    const usedSheetNames = new Set();

    for (const [, { title: problemTitle, rows }] of groups) {
      const sheetName = sanitizeSheetName(problemTitle, usedSheetNames);
      const ws = workbook.addWorksheet(sheetName);

      // Row 1: Hackathon Title Banner
      ws.mergeCells("A1:N1");
      const titleCell = ws.getCell("A1");
      titleCell.value = `Hackathon: ${hackathonTitle}`;
      titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FF1E3A8A" } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E7FF" } };
      ws.getRow(1).height = 36;

      // Row 2: Subtitle Metadata
      ws.mergeCells("A2:N2");
      const metaCell = ws.getCell("A2");
      metaCell.value = `Problem Statement: ${problemTitle}  |  Generated: ${new Date().toLocaleDateString()}  |  Total Submissions: ${rows.length}`;
      metaCell.font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "FF4B5563" } };
      metaCell.alignment = { vertical: "middle", horizontal: "center" };
      metaCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
      ws.getRow(2).height = 22;

      // Row 3: Blank spacing row
      ws.getRow(3).height = 10;

      // Row 4: Table Headers
      ws.getRow(4).values = HEADERS;
      const headerRow = ws.getRow(4);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      headerRow.height = 26;

      let sNo = 1;
      for (const r of rows) {
        const row = ws.addRow([
          sNo++,
          r.hackathonName,
          r.teamName,
          r.theme || "—",
          r.memberName,
          r.email,
          r.phone,
          r.degree,
          r.gradYear,
          r.college,
          r.branch,
          r.participation,
          r.description,
          r.tech,
          r.fileLabel || r.fileLinkUrl || "",
        ]);
        const d = row.getCell(11);
        const p = row.getCell(12);
        d.alignment = { wrapText: true, vertical: "top" };
        p.alignment = { wrapText: true, vertical: "top" };

        const linkCell = row.getCell(14);
        if (r.fileLinkUrl) {
          linkCell.value = {
            text: r.fileLabel || r.fileLinkUrl,
            hyperlink: r.fileLinkUrl,
            tooltip: r.allFileUrls.length > 1 ? r.allFileUrls.join("\n") : r.fileLinkUrl,
          };
          linkCell.font = { color: { argb: "FF0563C1" }, underline: true };
        }
      }

      ws.views = [{ state: "frozen", ySplit: 4 }];
      ws.eachRow((row, rowNumber) => {
        if (rowNumber <= 4) return;
        row.height = Math.max(28, row.height || 0);
      });

      HEADERS.forEach((_, colIdx) => {
        const col = ws.getColumn(colIdx + 1);
        let max = 12;
        col.eachCell({ includeEmpty: false }, (cell) => {
          const v = cell.value;
          const text =
            typeof v === "object" && v && "text" in v
              ? String(v.text)
              : v == null
                ? ""
                : String(v);
          const len = Math.min(text.length, 80);
          if (len > max) max = len;
        });
        col.width = Math.min(60, Math.max(12, max * 0.9 + 2));
      });
    }

    if (workbook.worksheets.length === 0) {
      const ws = workbook.addWorksheet("No submissions");
      ws.mergeCells("A1:M1");
      const titleCell = ws.getCell("A1");
      titleCell.value = `Hackathon: ${hackathonTitle}`;
      titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FF1E3A8A" } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E7FF" } };
      ws.getRow(1).height = 36;

      ws.getRow(4).values = HEADERS;
      ws.getRow(4).font = { bold: true };
      ws.addRow(["—", "—", "—", "—", "—", "—", "—", "—", "—", "No submissions yet.", "", "", ""]);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const cleanTitle = hackathonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="submissions_${cleanTitle}_${dateStr}.xlsx"`
    );
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("adminExportSubmissionsExcel:", error);
    return res.status(500).json({ message: "Failed to export submissions" });
  }
};

export const adminExportMentorsExcel = async (req, res) => {
  try {
    const { hackathonId } = req.query || {};
    const where = {};
    if (hackathonId && Number.isInteger(Number(hackathonId))) {
      where.hackathonId = Number(hackathonId);
    }

    const HackathonMentor = (await import("../../models/hackathon/HackathonMentorModel.js")).default;

    const mentors = await HackathonMentor.findAll({
      where,
      include: [
        { model: HackathonUser, as: "user", attributes: ["id", "fullName", "email", "phoneNumber", "role"] },
      ],
      order: [["created_at", "DESC"]],
    });

    let hackathonTitle = "All Hackathons";
    if (hackathonId) {
      const h = await Hackathon.findByPk(Number(hackathonId));
      if (h?.name) hackathonTitle = h.name;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "AICTE IDEA Lab";
    workbook.created = new Date();

    const ws = workbook.addWorksheet("Mentors Roster");
    ws.mergeCells("A1:F1");
    const titleCell = ws.getCell("A1");
    titleCell.value = `Hackathon: ${hackathonTitle}`;
    titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FF1E3A8A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E7FF" } };
    ws.getRow(1).height = 36;

    ws.mergeCells("A2:F2");
    const subCell = ws.getCell("A2");
    subCell.value = `Technical Mentors Roster  |  Generated: ${new Date().toLocaleDateString()}  |  Total Mentors: ${mentors.length}`;
    subCell.font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "FF4B5563" } };
    subCell.alignment = { vertical: "middle", horizontal: "center" };

    const headers = [
      "S.No.",
      "Hackathon Name",
      "Mentor Name",
      "Email",
      "Phone Number",
      "Expertise / Domain",
    ];

    ws.getRow(4).values = headers;
    ws.getRow(4).font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    ws.getRow(4).height = 24;
    ws.getRow(4).eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    let sNo = 1;
    for (const m of mentors) {
      ws.addRow([
        sNo++,
        hackathonTitle,
        m.user?.fullName || m.fullName || "—",
        m.user?.email || m.email || "—",
        m.user?.phoneNumber || "—",
        m.expertise || "General Mentor",
      ]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const cleanTitle = hackathonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mentors_${cleanTitle}_${dateStr}.xlsx"`
    );
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("adminExportMentorsExcel:", error);
    return res.status(500).json({ message: "Failed to export mentors Excel" });
  }
};
