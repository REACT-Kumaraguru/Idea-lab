import nodemailer from "nodemailer";
import { ENV } from "../lib/env.js";
import { AppError } from "../utils/AppError.js";

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
