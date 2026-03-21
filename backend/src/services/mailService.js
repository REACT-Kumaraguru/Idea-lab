import nodemailer from "nodemailer";
import { ENV } from "../lib/env.js";
import { AppError } from "../utils/AppError.js";

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
  return first || "https://idealab.kct.ac.in";
}

/** Safe URL for email href (http/https only). */
function getPortalHref() {
  const u = getPortalUrl();
  if (!/^https?:\/\//i.test(u)) return "https://idealab.kct.ac.in";
  return u.replace(/"/g, "");
}

let transporter = null;

export function getMailTransport() {
  if (transporter) return transporter;
  if (!ENV.SMTP_USER || !ENV.SMTP_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });
  return transporter;
}

export function buildResetPasswordEmailHtml(otp) {
  return `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#1e3a8a; color:white; padding:15px; text-align:center;">
      <h2 style="margin:0;">IDEA Lab Portal</h2>
      <p style="margin:0; font-size:12px;">Kumaraguru College of Technology</p>
    </div>

    <!-- Body -->
    <div style="padding:25px; text-align:center;">

      <h3>Email Verification</h3>

      <p style="font-size:14px; color:#555;">
        Use the OTP below to continue.
        This OTP is valid for 5 minutes.
      </p>

      <div style="
        font-size:28px;
        font-weight:bold;
        letter-spacing:5px;
        background:#f1f5f9;
        padding:15px;
        margin:20px auto;
        width:200px;
        border-radius:6px;
      ">
        ${otp}
      </div>

      <p style="font-size:13px; color:#777;">
        If you did not request this, please ignore this email.
      </p>

    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#666;">
      IDEA Lab Portal<br/>
      Kumaraguru College of Technology<br/>
      This is an automated email. Do not reply.
    </div>

  </div>
</div>
`.trim();
}

/**
 * @param {{ to: string, otp: string, purpose: 'register' | 'reset' }} params
 */
export async function sendOtpEmail({ to, otp, purpose }) {
  const transport = getMailTransport();
  if (!transport) {
    throw new AppError("Email service is not configured", 503);
  }

  const subject =
    purpose === "register"
      ? "Your Idea Lab registration code"
      : "Your Idea Lab password reset code";

  const text = `Your verification code is: ${otp}

This code expires in 5 minutes.

If you did not request this, you can ignore this email.

— Idea Lab`;

  const from = ENV.MAIL_FROM || `Idea Lab <${ENV.SMTP_USER}>`;

  const html = purpose === "reset" ? buildResetPasswordEmailHtml(otp) : undefined;

  await transport.sendMail({
    from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
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
