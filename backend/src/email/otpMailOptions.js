import { ENV } from "../lib/env.js";
import { buildResetPasswordEmailHtml } from "./otpTemplates.js";

/**
 * Builds nodemailer options for OTP (register / password reset).
 * @param {{ to: string, otp: string, purpose: 'register' | 'reset' }} params
 */
export function buildOtpMailOptions({ to, otp, purpose }) {
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

  return {
    from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  };
}
