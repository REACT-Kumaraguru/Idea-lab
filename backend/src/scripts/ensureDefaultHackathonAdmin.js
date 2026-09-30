import bcrypt from "bcryptjs";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";
import { ENV } from "../lib/env.js";

const DEFAULT_ADMIN_PASS = ENV.DEFAULT_HACKATHON_ADMIN_PASSWORD || "react-kct";
const DEFAULT_MENTOR_PASS = ENV.DEFAULT_MENTOR_PASSWORD || "mentorpass123";

const ADMIN_ACCOUNTS = [
  {
    email: "react@kct.ac.in",
    fullName: "Hackathon Admin",
    phone: "0000000000",
    role: "admin",
    password: DEFAULT_ADMIN_PASS,
  },
  {
    email: "idealab@gmail.com",
    fullName: "Sasikala Mam",
    phone: "0000000000",
    role: "admin",
    password: ENV.DEFAULT_HACKATHON_ADMIN_PASSWORD || "idealab@123",
  },
  {
    email: "cse_student@gmail.com",
    fullName: "Adithya 25BCS016",
    phone: "0000000000",
    role: "admin",
    password: ENV.DEFAULT_HACKATHON_ADMIN_PASSWORD || "cse_student",
  },
  {
    email: "mentor@kct.ac.in",
    fullName: "Faculty Mentor",
    phone: "0000000000",
    role: "mentor",
    password: DEFAULT_MENTOR_PASS,
  },
];

export async function ensureDefaultHackathonAdmin() {
  try {
    if (!ENV.DEFAULT_HACKATHON_ADMIN_PASSWORD && ENV.NODE_ENV === "production") {
      console.warn("[SECURITY WARNING] DEFAULT_HACKATHON_ADMIN_PASSWORD is not set in environment variables! Using default fallback.");
    }

    for (const acc of ADMIN_ACCOUNTS) {
      const existing = await HackathonUser.findOne({ where: { email: acc.email } });
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(acc.password, salt);
        await HackathonUser.create({
          email: acc.email,
          password: hashedPassword,
          fullName: acc.fullName,
          name: acc.fullName,
          phoneNumber: null,
          phone: "0000000000",
          role: acc.role,
        });
        console.log(`[hackathon-init] Created initial account: ${acc.email} (${acc.fullName})`);
      }
    }
  } catch (err) {
    console.error("Error creating default hackathon admins:", err.message);
  }
}
