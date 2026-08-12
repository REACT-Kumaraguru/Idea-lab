import bcrypt from "bcryptjs";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

function generatePasswordFromEmail(email) {
  const normalized = normalizeEmail(email);
  const idx = normalized.indexOf("@");
  if (idx <= 0) return null;
  let prefix = normalized.slice(0, idx);
  if (prefix.length < 6) {
    prefix = `${prefix}-kct`;
  }
  return prefix;
}

export async function ensureHackathonAdminMentorPasswords() {
  try {
    const users = await HackathonUser.findAll({
      where: { role: ["admin", "mentor"] },
    });

    const EXEMPT_EMAILS = ["mentor@kct.ac.in", "idealab@gmail.com", "cse_student@gmail.com"];

    let updated = 0;
    for (const u of users) {
      if (EXEMPT_EMAILS.includes(u.email)) continue;
      const plain = generatePasswordFromEmail(u.email);
      if (!plain) continue;
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(plain, salt);
      await u.update({ password: hashed });
      updated += 1;
    }

    console.log(`[hackathon] Updated ${updated} admin/mentor passwords from email prefix`);
  } catch (e) {
    console.error("[hackathon] ensureHackathonAdminMentorPasswords failed:", e.message);
  }
}

