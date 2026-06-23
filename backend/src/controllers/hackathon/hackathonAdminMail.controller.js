import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import {
  buildAdminTeamNotificationHtml,
  sendAdminTeamNotificationEmail,
  getPortalUrl,
} from "../../services/mailService.js";

/**
 * POST body:
 * {
 *   audience?: "teams" | "mentors",
 *   type: "all" | "approved" | "team" | "multiple",
 *   teamIds?: number[],
 *   mentorIds?: number[],
 *   subject: string,
 *   message: string
 * }
 */
export const adminSendTeamMail = async (req, res) => {
  const { audience = "teams", type, teamIds, mentorIds, subject, message } = req.body || {};

  try {
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "subject and message are required" });
    }

    if (!["all", "approved", "team", "multiple"].includes(type)) {
      return res.status(400).json({ message: 'type must be "all", "approved", "team", or "multiple"' });
    }

    if (!["teams", "mentors"].includes(audience)) {
      return res.status(400).json({ message: 'audience must be "teams" or "mentors"' });
    }

    /** @type {{ email: string; leaderName: string; teamName: string }[]} */
    let recipients = [];
    let attempted = 0;

    if (audience === "teams") {
      let teams = [];
      if (type === "all") {
        teams = await HackathonTeam.findAll({ order: [["created_at", "DESC"]] });
      } else if (type === "approved") {
        const approvedSubmissions = await HackathonSubmission.findAll({
          where: { status: "approved" },
          attributes: ["teamId"],
        });
        const approvedTeamIds = [...new Set(approvedSubmissions.map((s) => Number(s.teamId)).filter((id) => Number.isInteger(id)))];
        if (!approvedTeamIds.length) {
          teams = [];
        } else {
          teams = await HackathonTeam.findAll({
            where: { id: approvedTeamIds },
            order: [["created_at", "DESC"]],
          });
        }
      } else if (type === "team") {
        const rawId = Array.isArray(teamIds) && teamIds.length ? teamIds[0] : req.body.teamId;
        const id = Number(rawId);
        if (!Number.isInteger(id)) {
          return res.status(400).json({ message: "teamIds must include one valid team id for type team" });
        }
        const team = await HackathonTeam.findByPk(id);
        if (!team) return res.status(404).json({ message: "Team not found" });
        teams = [team];
      } else {
        const ids = Array.isArray(teamIds) ? teamIds.map((x) => Number(x)).filter((n) => Number.isInteger(n)) : [];
        if (!ids.length) {
          return res.status(400).json({ message: "teamIds is required for type multiple" });
        }
        teams = await HackathonTeam.findAll({ where: { id: ids } });
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
        });
      }
    } else {
      let mentors = [];
      if (type === "all") {
        mentors = await HackathonMentor.findAll({
          include: [{ model: HackathonUser, as: "user", attributes: ["id", "email", "fullName"] }],
          order: [["created_at", "DESC"]],
        });
      } else if (type === "approved") {
        return res.status(400).json({ message: 'type "approved" is only supported for audience "teams"' });
      } else if (type === "team") {
        const rawId = Array.isArray(mentorIds) && mentorIds.length ? mentorIds[0] : req.body.mentorId;
        const id = Number(rawId);
        if (!Number.isInteger(id)) {
          return res.status(400).json({ message: "mentorIds must include one valid mentor id for type team" });
        }
        const mentor = await HackathonMentor.findByPk(id, {
          include: [{ model: HackathonUser, as: "user", attributes: ["id", "email", "fullName"] }],
        });
        if (!mentor) return res.status(404).json({ message: "Mentor not found" });
        mentors = [mentor];
      } else {
        const ids = Array.isArray(mentorIds) ? mentorIds.map((x) => Number(x)).filter((n) => Number.isInteger(n)) : [];
        if (!ids.length) {
          return res.status(400).json({ message: "mentorIds is required for type multiple" });
        }
        mentors = await HackathonMentor.findAll({
          where: { id: ids },
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
    }

    if (!attempted) {
      return res.status(200).json({ sent: 0, failed: 0, skipped: 0, total: 0, message: "No recipients matched" });
    }

    const skipped = attempted - recipients.length;
    const portalUrl = getPortalUrl();
    const subj = subject.trim();
    const msgBody = message.trim();

    let sent = 0;
    let failed = 0;
    /** @type {string[]} */
    const errors = [];

    for (const r of recipients) {
      try {
        const html = buildAdminTeamNotificationHtml({
          leaderName: r.leaderName,
          teamName: r.teamName,
          subjectLine: subj,
          messageBody: msgBody,
        });
        const text = `Hello ${r.leaderName},\n\nThis is a reminder from IDEA Lab.\n\nTeam: ${r.teamName}\n\n${msgBody}\n\nGo to Portal: ${portalUrl}\n\nThis is an automated email.`;
        await sendAdminTeamNotificationEmail({
          to: r.email,
          subject: subj,
          html,
          text,
        });
        sent += 1;
      } catch (err) {
        failed += 1;
        errors.push(`${r.email}: ${err.message || "send failed"}`);
      }
    }

    return res.status(200).json({
      sent,
      failed,
      skipped,
      total: recipients.length,
      audience,
      ...(errors.length ? { errors } : {}),
    });
  } catch (error) {
    console.log("Error in adminSendTeamMail:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
