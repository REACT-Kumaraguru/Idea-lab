import { getMailTransport } from "../lib/mailTransport.js";
import { AppError } from "../utils/AppError.js";
import { buildOtpMailOptions } from "./otpMailOptions.js";

/**
 * Sends OTP email synchronously via SMTP (used by worker and as API fallback).
 * @param {{ to: string, otp: string, purpose: 'register' | 'reset' }} params
 */
export async function sendOtpEmailDirect({ to, otp, purpose }) {
  const transport = getMailTransport();
  if (!transport) {
    throw new AppError("Email service is not configured", 503);
  }

  const options = buildOtpMailOptions({ to, otp, purpose });
  await transport.sendMail(options);
}
