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
  });
  return transporter;
}

/** For tests / graceful shutdown (optional). */
export function resetMailTransport() {
  transporter = null;
}
