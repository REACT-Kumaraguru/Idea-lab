import { ENV } from "./env.js";

/** When `HACKATHON_REGISTRATION_CLOSED` is true/1/yes, block hackathon signup + new submissions. */
export function isHackathonRegistrationClosed() {
  const v = String(ENV.HACKATHON_REGISTRATION_CLOSED || "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function hackathonRegistrationClosedMessage() {
  const custom = String(ENV.HACKATHON_REGISTRATION_CLOSED_MESSAGE || "").trim();
  if (custom) return custom;
  return "Registration is closed. New sign-ups and submissions are no longer accepted.";
}

export function getHackathonRegistrationClosedPayload() {
  return {
    registrationClosed: isHackathonRegistrationClosed(),
    message: hackathonRegistrationClosedMessage(),
  };
}
