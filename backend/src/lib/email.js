import nodemailer from "nodemailer";
import { ENV } from "./env.js";

let transporter = null;

function getTransport() {
  if (transporter) return transporter;
  if (!ENV.SMTP_USER || !ENV.SMTP_PASS) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[email] SMTP not configured (SMTP_USER or SMTP_PASS missing). Emails will not be sent.");
    }
    return null;
  }
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });
  return transporter;
}

/**
 * Send an email. No-op if SMTP is not configured; does not throw.
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 */
export async function sendMail({ to, subject, text, html }) {
  const transport = getTransport();
  if (!transport) return;
  try {
    await transport.sendMail({
      from: ENV.MAIL_FROM,
      to,
      subject,
      text: text || (html ? html.replace(/<[^>]*>/g, "") : ""),
      html: html || undefined,
    });
  } catch (err) {
    console.error("[email] Send failed:", err.message);
  }
}

/**
 * Send booking status (approved/rejected) email to the user.
 */
export async function sendBookingStatusEmail(to, userName, equipmentName, bookingDate, bookingTime, status) {
  const isApproved = status === "approved";
  const subject = isApproved ? "Equipment booking approved" : "Equipment booking not approved";
  const intro = isApproved
    ? "Your equipment booking has been approved."
    : "Your equipment booking request has been rejected.";
  const text = `Hello ${userName || "User"},\n\n${intro}\n\nEquipment: ${equipmentName || "N/A"}\nDate: ${bookingDate || "N/A"}\nTime: ${bookingTime || "N/A"}\n\n— Idea Lab`;
  await sendMail({ to, subject, text });
}

/**
 * Send batch (cart) booking status email - one request with multiple items.
 * @param {string} to
 * @param {string} userName
 * @param {{ equipmentName: string, bookingDate: string, bookingTime: string }[]} items
 * @param {"approved"|"rejected"} status
 */
export async function sendBookingBatchStatusEmail(to, userName, items, status) {
  const isApproved = status === "approved";
  const subject = isApproved ? "Equipment booking approved" : "Equipment booking not approved";
  const intro = isApproved
    ? "Your equipment request has been approved."
    : "Your equipment request has been rejected.";
  const lines = (items || []).map(
    (it, i) =>
      `${i + 1}. ${it.equipmentName || "N/A"} — Date: ${it.bookingDate || "N/A"}, Time: ${it.bookingTime || "N/A"}`
  );
  const list = lines.length ? lines.join("\n") : "No items.";
  const text = `Hello ${userName || "User"},\n\n${intro}\n\nItems:\n${list}\n\n— Idea Lab`;
  await sendMail({ to, subject, text });
}

/**
 * Send problem statement submitted confirmation to the user.
 */
export async function sendProblemSubmittedEmail(to, userName) {
  const subject = "Problem statement submitted";
  const text = `Hello ${userName || "User"},\n\nYour problem statement has been submitted and will be reviewed by our team. We will notify you once it has been reviewed.\n\n— Idea Lab`;
  await sendMail({ to, subject, text });
}

/**
 * Send problem statement accepted notification to the submitter.
 */
export async function sendProblemAcceptedEmail(to, userName, problemTitle) {
  const subject = "Problem statement accepted";
  const text = `Hello ${userName || "User"},\n\nYour problem statement${problemTitle ? ` "${problemTitle}"` : ""} has been accepted and is now listed for collaboration.\n\n— Idea Lab`;
  await sendMail({ to, subject, text });
}
