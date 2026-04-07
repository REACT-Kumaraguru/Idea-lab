import { Op } from "sequelize";
import ExcelJS from "exceljs";
import HackathonPaymentDetail from "../../models/hackathon/HackathonPaymentDetailModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";

const getUserIdFromSession = (req) => Number(req.hackathonUser?.id ?? req.session?.user?.id);

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const normalizeText = (value) => String(value || "").trim();
const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value) => /^\d{10}$/.test(value);

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
    const q = normalizeText(req.query?.q);
    const startDate = normalizeText(req.query?.startDate);
    const endDate = normalizeText(req.query?.endDate);

    const createdAtWhere = {};
    if (startDate) createdAtWhere[Op.gte] = new Date(`${startDate}T00:00:00.000Z`);
    if (endDate) createdAtWhere[Op.lte] = new Date(`${endDate}T23:59:59.999Z`);

    const where = {};
    if (Object.keys(createdAtWhere).length > 0) where.createdAt = createdAtWhere;

    let allowedTeamIds = null;
    if (q) {
      const teamsMatched = await HackathonTeam.findAll({
        where: { teamName: { [Op.iLike]: `%${q}%` } },
        attributes: ["id"],
      });
      allowedTeamIds = teamsMatched.map((t) => Number(t.id)).filter((id) => Number.isInteger(id));
      if (allowedTeamIds.length === 0) {
        return res.status(200).json({ paymentDetails: [] });
      }
      where.teamId = allowedTeamIds;
    }

    const records = await HackathonPaymentDetail.findAll({
      where,
      order: [["createdAt", "DESC"]],
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
    console.error("adminVerifyPaymentDetail:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminExportPaymentDetailsExcel = async (req, res) => {
  try {
    const records = await HackathonPaymentDetail.findAll({ order: [["createdAt", "DESC"]] });
    const teamIds = [...new Set(records.map((r) => Number(r.teamId)).filter((id) => Number.isInteger(id)))];
    const teams = teamIds.length
      ? await HackathonTeam.findAll({ where: { id: teamIds }, attributes: ["id", "teamName"] })
      : [];
    const teamById = new Map(teams.map((t) => [Number(t.id), t]));

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Payment Details");
    ws.addRow([
      "Team Name",
      "Payment Email",
      "Paid Person Name",
      "Phone",
      "Payment ID",
      "Status",
      "Submitted Date",
    ]);
    ws.getRow(1).font = { bold: true };

    for (const rec of records) {
      ws.addRow([
        teamById.get(Number(rec.teamId))?.teamName || "",
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
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="payment_details_${dateStr}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("adminExportPaymentDetailsExcel:", error);
    return res.status(500).json({ message: "Failed to export payment details" });
  }
};
