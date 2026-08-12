import { ENV } from "../lib/env.js";
import { getMailTransport } from "../lib/mailTransport.js";
import { AppError } from "../utils/AppError.js";
import { buildResetPasswordEmailHtml } from "../email/otpTemplates.js";
import { sendOtpEmailDirect } from "../email/sendOtpEmailDirect.js";
import { addOtpEmailJob, isQueueEnabled } from "../queue/queue.js";

export { buildResetPasswordEmailHtml };

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Public hackathon / app URL for email buttons (first origin if CLIENT_URL is comma-separated). */
export function getPortalUrl() {
  const raw = ENV.CLIENT_URL || "";
  const first = raw.split(",")[0].trim();
  const base = first || "https://idealab.kct.ac.in";
  // Hackathon routes live under `/ich2026/*`.
  const normalizedBase = base
    .replace(/\/+$/, "")
    .replace(/\/ich2026\/?$/i, "");
  return normalizedBase + "/ich2026/login";
}

/** Safe URL for email href (http/https only). */
function getPortalHref() {
  const u = getPortalUrl();
  if (!/^https?:\/\//i.test(u)) return "https://idealab.kct.ac.in";
  return u.replace(/"/g, "");
}

export { getMailTransport };

/**
 * Sends OTP via Redis queue when configured; otherwise sends synchronously.
 * On enqueue failure, falls back to synchronous SMTP.
 * @param {{ to: string, otp: string, purpose: 'register' | 'reset' }} params
 */
export async function sendOtpEmail({ to, otp, purpose }) {
  if (!ENV.SMTP_USER || !ENV.SMTP_PASS) {
    throw new AppError("Email service is not configured", 503);
  }

  if (isQueueEnabled()) {
    try {
      await addOtpEmailJob({ to, otp, purpose });
      console.log(`[mail] OTP job queued for ${to} (${purpose})`);
      return;
    } catch (err) {
      console.error("[mail] OTP queue enqueue failed, sending synchronously:", err.message);
    }
  }

  await sendOtpEmailDirect({ to, otp, purpose });
}

export function buildSubmissionApprovedEmailHtml({ leaderName, teamName, projectTitle }) {
  const ln = escapeHtml(leaderName);
  const tn = escapeHtml(teamName);
  const pt = escapeHtml(projectTitle);
  const portalHref = getPortalHref();

  return `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#0f172a; color:white; padding:15px; text-align:center;">
      <h2 style="margin:0;">IDEA Lab Portal</h2>
      <p style="margin:0; font-size:12px;">
        Kumaraguru College of Technology
      </p>
    </div>

    <!-- Body -->
    <div style="padding:25px;">

      <h3 style="color:#16a34a;">Submission Approved ✅</h3>

      <p>Hello <b>${ln}</b>,</p>

      <p>
        Your team submission has been <b>approved</b> by the admin.
      </p>

      <table style="width:100%; border-collapse:collapse; margin-top:15px;">
        <tr>
          <td style="padding:8px; font-weight:bold;">Team Name</td>
          <td style="padding:8px;">${tn}</td>
        </tr>

        <tr>
          <td style="padding:8px; font-weight:bold;">Project Title</td>
          <td style="padding:8px;">${pt}</td>
        </tr>

        <tr>
          <td style="padding:8px; font-weight:bold;">Leader</td>
          <td style="padding:8px;">${ln}</td>
        </tr>

        <tr>
          <td style="padding:8px; font-weight:bold;">Status</td>
          <td style="padding:8px; color:green; font-weight:bold;">
            APPROVED
          </td>
        </tr>
      </table>

      <p style="margin-top:20px;">
        You can now log in to the portal to view further details.
      </p>

      <div style="text-align:center; margin-top:20px;">
        <a href="${portalHref}"
           style="
             background:#2563eb;
             color:white;
             padding:10px 18px;
             text-decoration:none;
             border-radius:6px;
             font-weight:bold;
           ">
           Go to IDEA Lab Portal
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#555;">
      IDEA Lab Portal<br/>
      Kumaraguru College of Technology<br/>
      This is an automated email. Please do not reply.
    </div>

  </div>
</div>
`.trim();
}

/**
 * Admin broadcast / reminder email (HTML). Leader + team context; message is plain text (escaped).
 */
export function buildAdminTeamNotificationHtml({ leaderName, teamName, subjectLine, messageBody }) {
  const ln = escapeHtml(leaderName);
  const tn = escapeHtml(teamName);
  const title = escapeHtml(subjectLine);
  const bodyEscaped = escapeHtml(messageBody || "").replace(/\n/g, "<br/>");
  const portalHref = getPortalHref();

  return `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#0f172a; color:white; padding:15px; text-align:center;">
      <h2 style="margin:0;">IDEA Lab Portal</h2>
      <p style="margin:0; font-size:12px;">Kumaraguru College of Technology</p>
    </div>

    <!-- Body -->
    <div style="padding:25px;">

      <h3 style="margin-top:0; color:#0f172a;">${title}</h3>

      <p>Hello <b>${ln}</b>,</p>

      <p>This is a reminder from IDEA Lab.</p>

      <table style="width:100%; border-collapse:collapse; margin-top:12px; margin-bottom:16px; font-size:14px;">
        <tr>
          <td style="padding:6px 8px; font-weight:bold; width:35%; vertical-align:top;">Team name</td>
          <td style="padding:6px 8px;">${tn}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; font-weight:bold; vertical-align:top;">Team leader</td>
          <td style="padding:6px 8px;">${ln}</td>
        </tr>
      </table>

      <div style="font-size:14px; color:#334155; line-height:1.6;">${bodyEscaped}</div>

      <div style="text-align:center; margin:24px 0 8px;">
        <a href="${portalHref}"
           style="
             background:#2563eb;
             color:white;
             padding:10px 18px;
             text-decoration:none;
             border-radius:6px;
             font-weight:bold;
             display:inline-block;
           ">
           Go to Portal
        </a>
      </div>

      <p style="font-size:12px; color:#64748b; margin-bottom:0;">
        This is an automated email.
      </p>

    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#475569;">
      IDEA Lab Portal<br/>
      Kumaraguru College of Technology<br/>
      This is an automated email. Please do not reply.
    </div>

  </div>
</div>
`.trim();
}

/**
 * Sends admin team notification; throws {@link AppError} if SMTP is missing or send fails.
 */
export async function sendAdminTeamNotificationEmail({ to, subject, html, text }) {
  const transport = getMailTransport();
  if (!transport) {
    throw new AppError("Email service is not configured", 503);
  }
  const from = ENV.MAIL_FROM || `Idea Lab <${ENV.SMTP_USER}>`;
  const plain =
    text ||
    (html ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : subject);
  try {
    await transport.sendMail({
      from,
      to,
      subject,
      text: plain,
      html,
    });
  } catch (err) {
    console.error("[mail] Admin team notification failed:", err.message);
    throw new AppError(err.message || "Failed to send email", 502);
  }
}

export function buildTeamApprovedEmailHtml({ leaderName, teamName }) {
  const ln = escapeHtml(leaderName);
  const tn = escapeHtml(teamName);
  const portalHref = getPortalHref();

  return `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">

    <div style="background:#0f172a; color:white; padding:15px; text-align:center;">
      <h2 style="margin:0;">IDEA Lab Portal</h2>
      <p style="margin:0; font-size:12px;">Kumaraguru College of Technology</p>
    </div>

    <div style="padding:25px;">

      <h3 style="color:#16a34a;">Team Approved ✅</h3>

      <p>Hello <b>${ln}</b>,</p>

      <p>Your team has been <b>approved</b> by the admin.</p>

      <table style="width:100%; border-collapse:collapse; margin-top:15px;">
        <tr>
          <td style="padding:8px; font-weight:bold;">Team Name</td>
          <td style="padding:8px;">${tn}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold;">Leader</td>
          <td style="padding:8px;">${ln}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold;">Status</td>
          <td style="padding:8px; color:green; font-weight:bold;">APPROVED</td>
        </tr>
      </table>

      <p style="margin-top:20px;">You can now log in to the portal to view further details.</p>

      <div style="text-align:center; margin-top:20px;">
        <a href="${portalHref}"
           style="background:#2563eb; color:white; padding:10px 18px; text-decoration:none; border-radius:6px; font-weight:bold;">
           Go to IDEA Lab Portal
        </a>
      </div>
    </div>

    <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#555;">
      IDEA Lab Portal<br/>
      Kumaraguru College of Technology<br/>
      This is an automated email. Please do not reply.
    </div>
  </div>
</div>
`.trim();
}

/**
 * Best-effort notification (does not throw). Logs on failure.
 */
export async function sendHackathonNotificationEmail({ to, subject, html, text }) {
  const transport = getMailTransport();
  if (!transport) {
    console.warn("[mail] SMTP not configured; skipping notification to", to);
    return;
  }
  const from = ENV.MAIL_FROM || `Idea Lab <${ENV.SMTP_USER}>`;
  const plain =
    text ||
    (html ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : subject);
  try {
    await transport.sendMail({
      from,
      to,
      subject,
      text: plain,
      html,
    });
  } catch (err) {
    console.error("[mail] Hackathon notification send failed:", err.message);
  }
}
