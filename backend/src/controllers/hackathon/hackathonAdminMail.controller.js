import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonEmailLog from "../../models/hackathon/HackathonEmailLogModel.js";
import { Op } from "sequelize";
import {
  buildAdminTeamNotificationHtml,
  sendAdminTeamNotificationEmail,
  getPortalUrl,
} from "../../services/mailService.js";

/**
 * POST body (JSON or multipart/form-data):
 * {
 *   audience?: "teams" | "mentors" | "faculty",
 *   type: "all" | "approved" | "team" | "multiple" | "cluster",
 *   teamIds?: number[] | string,
 *   mentorIds?: number[] | string,
 *   facultyIds?: number[] | string,
 *   cluster?: string,
 *   subject: string,
 *   message: string,
 *   hackathonId?: number
 * }
 * Files attached via multipart: req.file or req.files ('attachment' / 'attachments')
 */
export const adminSendTeamMail = async (req, res) => {
  let {
    audience = "teams",
    type = "all",
    teamIds,
    mentorIds,
    facultyIds,
    cluster,
    subject,
    message,
    hackathonId,
  } = req.body || {};

  // Parse stringified arrays if sent via FormData
  const parseIds = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(Number).filter(Number.isInteger);
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(Number).filter(Number.isInteger);
      } catch (_) {
        return raw.split(",").map(s => Number(s.trim())).filter(Number.isInteger);
      }
    }
    return [];
  };

  const parsedTeamIds = parseIds(teamIds);
  const parsedMentorIds = parseIds(mentorIds);
  const parsedFacultyIds = parseIds(facultyIds);

  try {
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Subject and message are required." });
    }

    if (!["all", "approved", "team", "multiple", "cluster"].includes(type)) {
      return res.status(400).json({ message: 'Type must be "all", "approved", "team", "multiple", or "cluster".' });
    }

    if (!["teams", "mentors", "faculty"].includes(audience)) {
      return res.status(400).json({ message: 'Audience must be "teams", "mentors", or "faculty".' });
    }

    const hId = hackathonId && Number.isInteger(Number(hackathonId)) ? Number(hackathonId) : 2;

    // Process attachments from multer (single or multiple)
    const attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype,
      });
    } else if (req.files) {
      const filesList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const f of filesList) {
        attachments.push({
          filename: f.originalname,
          content: f.buffer,
          contentType: f.mimetype,
        });
      }
    }

    /** @type {{ email: string; leaderName: string; teamName: string; cluster?: string; assignedCount?: number }[]} */
    let recipients = [];
    let attempted = 0;

    if (audience === "teams") {
      let teams = [];
      const teamWhere = hId ? { hackathonId: hId } : {};

      if (type === "all") {
        teams = await HackathonTeam.findAll({ where: teamWhere, order: [["created_at", "DESC"]] });
      } else if (type === "approved") {
        teams = await HackathonTeam.findAll({
          where: {
            abstractionStatus: "approved",
            ...teamWhere,
          },
          order: [["created_at", "DESC"]],
        });
      } else if (type === "team") {
        const id = parsedTeamIds.length ? parsedTeamIds[0] : Number(req.body.teamId);
        if (!Number.isInteger(id)) {
          return res.status(400).json({ message: "Please select a valid team." });
        }
        const team = await HackathonTeam.findByPk(id);
        if (!team) return res.status(404).json({ message: "Team not found." });
        teams = [team];
      } else {
        if (!parsedTeamIds.length) {
          return res.status(400).json({ message: "Please select at least one team." });
        }
        teams = await HackathonTeam.findAll({ where: { id: parsedTeamIds, ...teamWhere } });
      }

      attempted = teams.length;
      for (const team of teams) {
        const leader = await HackathonUser.findByPk(team.leaderUserId, {
          attributes: ["email", "fullName"],
        });
        const email = leader?.email?.trim();
        if (!email) continue;
        recipients.push({
          email: email.toLowerCase(),
          leaderName: leader.fullName || email,
          teamName: team.teamName,
          cluster: team.cluster,
        });
      }
    } else if (audience === "mentors") {
      let mentors = [];
      const mentorWhere = hId ? { hackathonId: hId } : {};

      if (type === "all") {
        mentors = await HackathonMentor.findAll({
          where: mentorWhere,
          include: [{ model: HackathonUser, as: "user", attributes: ["id", "email", "fullName"] }],
          order: [["created_at", "DESC"]],
        });
      } else if (type === "team") {
        const id = parsedMentorIds.length ? parsedMentorIds[0] : Number(req.body.mentorId);
        if (!Number.isInteger(id)) {
          return res.status(400).json({ message: "Please select a valid mentor." });
        }
        const mentor = await HackathonMentor.findByPk(id, {
          include: [{ model: HackathonUser, as: "user", attributes: ["id", "email", "fullName"] }],
        });
        if (!mentor) return res.status(404).json({ message: "Mentor not found." });
        mentors = [mentor];
      } else {
        if (!parsedMentorIds.length) {
          return res.status(400).json({ message: "Please select at least one mentor." });
        }
        mentors = await HackathonMentor.findAll({
          where: { id: parsedMentorIds },
          include: [{ model: HackathonUser, as: "user", attributes: ["id", "email", "fullName"] }],
        });
      }

      attempted = mentors.length;
      for (const m of mentors) {
        const email = m?.user?.email?.trim();
        if (!email) continue;
        recipients.push({
          email: email.toLowerCase(),
          leaderName: m.user.fullName || email,
          teamName: "Mentor",
        });
      }
    } else if (audience === "faculty") {
      let facultyList = [];
      const baseFacultyCondition = {
        role: { [Op.in]: ["reviewer", "faculty"] },
        assignedCluster: { [Op.ne]: null },
      };

      if (type === "cluster" && cluster && cluster !== "all") {
        facultyList = await HackathonUser.findAll({
          where: { [Op.and]: [baseFacultyCondition, { assignedCluster: cluster }] },
          order: [["fullName", "ASC"]],
        });
      } else if (type === "team") {
        const id = parsedFacultyIds.length ? parsedFacultyIds[0] : Number(req.body.facultyId);
        if (!Number.isInteger(id)) {
          return res.status(400).json({ message: "Please select a valid faculty member." });
        }
        const f = await HackathonUser.findByPk(id);
        if (!f) return res.status(404).json({ message: "Faculty member not found." });
        facultyList = [f];
      } else if (type === "multiple") {
        if (!parsedFacultyIds.length) {
          return res.status(400).json({ message: "Please select at least one faculty member." });
        }
        facultyList = await HackathonUser.findAll({ where: { id: parsedFacultyIds } });
      } else {
        // "all"
        facultyList = await HackathonUser.findAll({
          where: baseFacultyCondition,
          order: [["assignedCluster", "ASC"], ["fullName", "ASC"]],
        });
      }

      attempted = facultyList.length;
      for (const f of facultyList) {
        const email = f.email?.trim();
        if (!email) continue;

        const assignedCount = await HackathonTeam.count({
          where: { hackathonId: hId, assignedFacultyId: f.id },
        });

        recipients.push({
          email: email.toLowerCase(),
          leaderName: f.fullName || email,
          teamName: `${f.assignedCluster || "Smart City"} Cluster Faculty Evaluator`,
          cluster: f.assignedCluster || "Smart City",
          assignedCount,
        });
      }
    }

    if (!attempted) {
      return res.status(200).json({ sent: 0, failed: 0, skipped: 0, total: 0, message: "No recipients matched." });
    }

    const skipped = attempted - recipients.length;
    const portalUrl = getPortalUrl();
    const rawSubj = subject.trim();
    const rawMsg = message.trim();

    const adminUser = req.session?.hackathonUser || req.session?.user || {};
    const senderName = adminUser.fullName || adminUser.name || "Administrator";
    const senderEmail = adminUser.email || "admin@idealab.kct.ac.in";

    try {
      await HackathonEmailLog.sync();
    } catch (_) {}

    let sent = 0;
    let failed = 0;
    /** @type {string[]} */
    const errors = [];

    const BATCH_SIZE = 5;
    const attachmentNames = attachments.map((a) => a.filename).join(", ");
    const hasAttachments = attachments.length > 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(async (r) => {
          const interpolate = (str) =>
            str
              .replace(/\{facultyName\}/g, r.leaderName)
              .replace(/\{leaderName\}/g, r.leaderName)
              .replace(/\{teamName\}/g, r.teamName)
              .replace(/\{cluster\}/g, r.cluster || "Smart City")
              .replace(/\{assignedCount\}/g, String(r.assignedCount ?? 0))
              .replace(/\{email\}/g, r.email)
              .replace(/\{password\}/g, "faculty@2026")
              .replace(/\{loginUrl\}/g, `${portalUrl.replace(/\/+$/, "")}/login`);

          const personalizedSubj = interpolate(rawSubj);
          const personalizedMsg = interpolate(rawMsg);

          const html = buildAdminTeamNotificationHtml({
            leaderName: r.leaderName,
            teamName: r.teamName,
            subjectLine: personalizedSubj,
            messageBody: personalizedMsg,
          });

          const text = `Hello ${r.leaderName},\n\n${personalizedMsg}\n\nPortal: ${portalUrl}\n\nAICTE IDEA Lab, Kumaraguru College of Technology`;

          try {
            await sendAdminTeamNotificationEmail({
              to: r.email,
              subject: personalizedSubj,
              html,
              text,
              attachments,
            });

            // Audit Log: Record successful dispatch
            await HackathonEmailLog.create({
              hackathonId: hackathonId ? Number(hackathonId) : null,
              recipientEmail: r.email,
              recipientName: r.leaderName,
              recipientRole: audience,
              teamName: r.teamName,
              subject: personalizedSubj,
              content: personalizedMsg,
              senderName,
              senderEmail,
              status: "sent",
              hasAttachments,
              attachmentNames,
              sentAt: new Date(),
            });

            return { success: true, email: r.email };
          } catch (err) {
            // Audit Log: Record failed dispatch with error
            await HackathonEmailLog.create({
              hackathonId: hackathonId ? Number(hackathonId) : null,
              recipientEmail: r.email,
              recipientName: r.leaderName,
              recipientRole: audience,
              teamName: r.teamName,
              subject: personalizedSubj,
              content: personalizedMsg,
              senderName,
              senderEmail,
              status: "failed",
              errorMessage: err?.message || "Failed to deliver email",
              hasAttachments,
              attachmentNames,
              sentAt: new Date(),
            });

            throw err;
          }
        })
      );

      for (let j = 0; j < batchResults.length; j++) {
        const resObj = batchResults[j];
        const r = batch[j];
        if (resObj.status === "fulfilled") {
          sent += 1;
        } else {
          failed += 1;
          errors.push(`${r.email}: ${resObj.reason?.message || "send failed"}`);
        }
      }
    }

    return res.status(200).json({
      sent,
      failed,
      skipped,
      total: recipients.length,
      audience,
      hasAttachment: attachments.length > 0,
      attachmentCount: attachments.length,
      ...(errors.length ? { errors } : {}),
      message: `Broadcasting completed: ${sent} sent, ${failed} failed.`,
    });
  } catch (error) {
    console.error("Error in adminSendTeamMail:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * GET /api/ich2026/admin/email-logs
 * Retrieves paginated audit logs of all sent emails with search and filters.
 */
export const getAdminEmailLogs = async (req, res) => {
  try {
    try {
      await HackathonEmailLog.sync();
    } catch (_) {}

    const { page = 1, limit = 25, search = "", status = "", hackathonId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (hackathonId) {
      where.hackathonId = Number(hackathonId);
    }
    if (status && status !== "all") {
      where.status = status;
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { recipientEmail: { [Op.like]: q } },
        { recipientName: { [Op.like]: q } },
        { teamName: { [Op.like]: q } },
        { subject: { [Op.like]: q } },
        { senderName: { [Op.like]: q } },
      ];
    }

    const { count, rows } = await HackathonEmailLog.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      logs: rows,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("Error in getAdminEmailLogs:", error);
    return res.status(500).json({ message: "Failed to fetch email logs" });
  }
};
