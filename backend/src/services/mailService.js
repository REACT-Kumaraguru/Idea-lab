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

  await transport.sendMail({
    from,
    to,
    subject,
    text,
  });
}
