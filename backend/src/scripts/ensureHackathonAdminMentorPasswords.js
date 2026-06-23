import bcrypt from "bcryptjs";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

function generatePasswordFromEmail(email) {
  const normalized = normalizeEmail(email);
  const idx = normalized.indexOf("@");
  if (idx <= 0) return null;
  return normalized.slice(0, idx);
}

export async function ensureHackathonAdminMentorPasswords() {
  try {
    const users = await HackathonUser.findAll({
      where: { role: ["admin", "mentor"] },
    });

    let updated = 0;
    for (const u of users) {
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

