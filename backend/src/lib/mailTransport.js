import nodemailer from "nodemailer";
import { ENV } from "./env.js";

let transporter = null;

/**
 * Shared SMTP transport for Idea Lab mail (Office 365 / configurable host).
 */
export function getMailTransport() {
  if (transporter) return transporter;
  if (!ENV.SMTP_USER || !ENV.SMTP_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST || "smtp.office365.com",
    port: Number(ENV.SMTP_PORT) || 587,
    secure: ENV.SMTP_SECURE === true,
    requireTLS: ENV.SMTP_SECURE !== true,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: ENV.NODE_ENV === "production",
    },
    connectionTimeout: 12000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
}

/** Verify SMTP credentials on startup (optional helper). */
export async function verifyMailTransport() {
  const mailer = getMailTransport();
  if (!mailer) {
    console.log("[mail] SMTP running in local development mode (no credentials provided)");
    return false;
  }
  try {
    await mailer.verify();
    console.log(`[mail] Institutional SMTP connected successfully to ${ENV.SMTP_HOST || "smtp.office365.com"}`);
    return true;
  } catch (err) {
    console.warn(`[mail] Institutional SMTP connection notice: ${err.message}`);
    return false;
  }
}

/** For tests / graceful shutdown (optional). */
export function resetMailTransport() {
  transporter = null;
}
