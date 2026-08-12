import { Op } from "sequelize";
import ExcelJS from "exceljs";
import HackathonPaymentDetail from "../../models/hackathon/HackathonPaymentDetailModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import Hackathon from "../../models/hackathon/HackathonModel.js";

const getUserIdFromSession = (req) => Number(req.hackathonUser?.id ?? req.session?.user?.id);

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const normalizeText = (value) => String(value || "").trim();
const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value) => /^\d{10}$/.test(value);
const isMissingRelationError = (error) =>
  error?.name === "SequelizeDatabaseError" &&
  (error?.original?.code === "42P01" || /does not exist/i.test(String(error?.original?.message || "")));

const getStudentTeam = async (userId) => {
  const member = await HackathonTeamMember.findOne({ where: { userId } });
  if (member?.teamId) return HackathonTeam.findByPk(member.teamId);
  return HackathonTeam.findOne({ where: { leaderUserId: userId } });
};

const canAccessPaymentPage = async ({ team, userId }) => {
  if (!team) {
    return { allowed: false, message: "No team found for current user" };
  }
  if (Number(team.leaderUserId) !== Number(userId)) {
    return { allowed: false, message: "Access denied – only team leader can submit payment details" };
  }
  if (team.status !== "approved") {
    return { allowed: false, message: "Access denied – your team is not approved yet" };
  }
  const mentorApprovedSubmission = await HackathonSubmission.findOne({
    where: { teamId: team.id, mentorApproved: true },
    attributes: ["id"],
  });
  if (!mentorApprovedSubmission) {
    return {
      allowed: false,
      message: "Access denied – mentor approval is pending for your team submission",
    };
  }
  return { allowed: true };
};

export const getMyPaymentDetail = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const team = await getStudentTeam(userId);
    const access = await canAccessPaymentPage({ team, userId });
    if (!access.allowed) return res.status(403).json({ message: access.message });

    const existing = await HackathonPaymentDetail.findOne({ where: { teamId: team.id } });
    return res.status(200).json({
      team: { id: team.id, teamName: team.teamName, status: team.status },
      paymentDetail: existing || null,
    });
  } catch (error) {
    console.error("getMyPaymentDetail:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const submitMyPaymentDetail = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const team = await getStudentTeam(userId);
    const access = await canAccessPaymentPage({ team, userId });
    if (!access.allowed) return res.status(403).json({ message: access.message });

    const paymentEmail = normalizeEmail(req.body?.paymentEmail);
    const paidPersonName = normalizeText(req.body?.paidPersonName);
    const phone = normalizePhone(req.body?.phone);
    const paymentId = normalizeText(req.body?.paymentId);

    if (!paymentEmail || !paidPersonName || !phone || !paymentId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!isValidEmail(paymentEmail)) {
      return res.status(400).json({ message: "Invalid payment email" });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    const existing = await HackathonPaymentDetail.findOne({ where: { teamId: team.id } });
    if (existing) {
      return res.status(409).json({ message: "Payment details already submitted for this team" });
    }

    const created = await HackathonPaymentDetail.create({
      teamId: team.id,
      paymentEmail,
      paidPersonName,
      phone,
      paymentId,
      status: "pending",
    });

    return res.status(201).json({
      message: "Payment details submitted successfully",
      paymentDetail: created,
    });
  } catch (error) {
    console.error("submitMyPaymentDetail:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminListPaymentDetails = async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : "";
    const hackathonId = req.query.hackathonId ? Number(req.query.hackathonId) : null;
    const startDate = req.query.startDate ? String(req.query.startDate).trim() : "";
    const endDate = req.query.endDate ? String(req.query.endDate).trim() : "";

    const createdAtWhere = {};
    if (startDate) createdAtWhere[Op.gte] = new Date(`${startDate}T00:00:00.000Z`);
    if (endDate) createdAtWhere[Op.lte] = new Date(`${endDate}T23:59:59.999Z`);

    const where = {};
    if (Object.keys(createdAtWhere).length > 0) where.createdAt = createdAtWhere;

    if (hackathonId && Number.isInteger(hackathonId)) {
      const hackathonTeams = await HackathonTeam.findAll({
        where: { hackathonId },
        attributes: ["id"],
      });
      const hTeamIds = hackathonTeams.map((t) => Number(t.id));
      if (!hTeamIds.length) {
        return res.status(200).json({ paymentDetails: [] });
      }
      where.teamId = hTeamIds;
    }

    if (q) {
      const teamWhere = { teamName: { [Op.like]: `%${q}%` } };
      if (where.teamId) teamWhere.id = where.teamId;
      const teamsMatched = await HackathonTeam.findAll({
        where: teamWhere,
        attributes: ["id"],
      });
      const allowedTeamIds = teamsMatched.map((t) => Number(t.id)).filter((id) => Number.isInteger(id));
      if (allowedTeamIds.length === 0) {
        return res.status(200).json({ paymentDetails: [] });
      }
      where.teamId = allowedTeamIds;
    }

    const records = await HackathonPaymentDetail.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    const teamIds = [...new Set(records.map((r) => Number(r.teamId)).filter((id) => Number.isInteger(id)))];
    const teams = teamIds.length
      ? await HackathonTeam.findAll({ where: { id: teamIds }, attributes: ["id", "teamName"] })
      : [];
    const teamById = new Map(teams.map((t) => [Number(t.id), t]));

    const payload = records.map((r) => ({
      ...(r.toJSON ? r.toJSON() : r),
      team: teamById.get(Number(r.teamId))
        ? { id: Number(r.teamId), teamName: teamById.get(Number(r.teamId)).teamName }
        : null,
    }));

    return res.status(200).json({ paymentDetails: payload });
  } catch (error) {
    if (isMissingRelationError(error)) {
      // Table not yet present in some environments. Keep admin page usable.
      return res.status(200).json({ paymentDetails: [] });
    }
    console.error("adminListPaymentDetails:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminVerifyPaymentDetail = async (req, res) => {
  try {
    const paymentId = Number(req.params?.id);
    if (!Number.isFinite(paymentId)) {
      return res.status(400).json({ message: "Invalid payment detail id" });
    }

    const record = await HackathonPaymentDetail.findByPk(paymentId);
    if (!record) return res.status(404).json({ message: "Payment detail not found" });

    const userId = getUserIdFromSession(req);
    await record.update({
      status: "verified",
      verifiedByUserId: userId,
      verifiedAt: new Date(),
    });

    return res.status(200).json({ message: "Payment marked as verified", paymentDetail: record });
  } catch (error) {
    if (isMissingRelationError(error)) {
      return res.status(400).json({ message: "Payment details table is not initialized yet" });
    }
    console.error("adminVerifyPaymentDetail:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminExportPaymentDetailsExcel = async (req, res) => {
  try {
    const hackathonId = req.query.hackathonId ? Number(req.query.hackathonId) : null;
    const where = {};
    let hackathonTitle = "All Hackathons";

    const allHackathons = await Hackathon.findAll({ attributes: ["id", "name"] });
    const hackathonNameById = new Map(allHackathons.map((h) => [h.id, h.name]));

    if (hackathonId && Number.isInteger(hackathonId)) {
      const found = hackathonNameById.get(hackathonId);
      if (found) hackathonTitle = found;
      const hackathonTeams = await HackathonTeam.findAll({
        where: { hackathonId },
        attributes: ["id"],
      });
      const hTeamIds = hackathonTeams.map((t) => Number(t.id));
      if (!hTeamIds.length) {
        where.teamId = -1;
      } else {
        where.teamId = hTeamIds;
      }
    }

    const records = await HackathonPaymentDetail.findAll({ where, order: [["created_at", "DESC"]] });
    const teamIds = [...new Set(records.map((r) => Number(r.teamId)).filter((id) => Number.isInteger(id)))];
    const teams = teamIds.length
      ? await HackathonTeam.findAll({ where: { id: teamIds }, attributes: ["id", "teamName", "hackathonId"] })
      : [];
    const teamById = new Map(teams.map((t) => [Number(t.id), t]));

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Payment Details");

    // Row 1: Hackathon Title Banner
    ws.mergeCells("A1:I1");
    const titleCell = ws.getCell("A1");
    titleCell.value = `Hackathon: ${hackathonTitle}`;
    titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FF1E3A8A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E7FF" } };
    ws.getRow(1).height = 36;

    // Row 2: Subtitle Metadata
    ws.mergeCells("A2:I2");
    const metaCell = ws.getCell("A2");
    metaCell.value = `Report: Payment Details  |  Generated: ${new Date().toLocaleDateString()}  |  Total Records: ${records.length}`;
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
      "Payment Email",
      "Paid Person Name",
      "Phone",
      "Payment ID",
      "Status",
      "Submitted Date",
    ];

    ws.getRow(4).values = HEADERS;
    const headerRow = ws.getRow(4);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    headerRow.height = 26;

    let sNo = 1;
    for (const rec of records) {
      const t = teamById.get(Number(rec.teamId));
      const teamHackathonName = t?.hackathonId ? (hackathonNameById.get(t.hackathonId) || hackathonTitle) : hackathonTitle;
      ws.addRow([
        sNo++,
        teamHackathonName,
        t?.teamName || "",
        rec.paymentEmail || "",
        rec.paidPersonName || "",
        rec.phone || "",
        rec.paymentId || "",
        rec.status || "",
        rec.createdAt ? new Date(rec.createdAt).toISOString() : "",
      ]);
    }

    ws.columns.forEach((col) => {
      col.width = 24;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const cleanTitle = hackathonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="payment_details_${cleanTitle}_${dateStr}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    if (isMissingRelationError(error)) {
      return res.status(400).json({ message: "Payment details table is not initialized yet" });
    }
    console.error("adminExportPaymentDetailsExcel:", error);
    return res.status(500).json({ message: "Failed to export payment details" });
  }
};
