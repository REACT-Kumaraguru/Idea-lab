import crypto from "crypto";

export const OTP_EXPIRY_MS = 5 * 60 * 1000;

export function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function getOtpExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRY_MS);
}
