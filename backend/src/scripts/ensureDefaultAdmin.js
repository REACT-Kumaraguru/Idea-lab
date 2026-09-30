import bcrypt from "bcryptjs";
import Admin from "../models/AdminModel.js";
import { ENV } from "../lib/env.js";

const DEFAULT_PASS = ENV.DEFAULT_ADMIN_PASSWORD || "idealab-kct";

const ADMIN_ACCOUNTS = [
  {
    email: "idealab@kct.ac.in",
    password: DEFAULT_PASS,
    fullName: "Idea Lab Admin",
    phoneNumber: "0000000000",
  },
  {
    email: "adithya@kct.ac.in",
    password: ENV.DEFAULT_ADMIN_PASSWORD || "adithyapass123",
    fullName: "Adithya (25BBCS016)",
    phoneNumber: "9876543210",
  }
];

export async function ensureDefaultAdmin() {
  if (!ENV.DEFAULT_ADMIN_PASSWORD && ENV.NODE_ENV === "production") {
    console.warn("[SECURITY WARNING] DEFAULT_ADMIN_PASSWORD is not set in environment variables! Using default fallback.");
  }

  for (const account of ADMIN_ACCOUNTS) {
    const existing = await Admin.findOne({ where: { email: account.email } });

    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(account.password, salt);
      await Admin.create({
        email: account.email,
        password: hashedPassword,
        fullName: account.fullName,
        phoneNumber: account.phoneNumber,
      });
      console.log(`[admin-init] Created initial admin account: ${account.email}`);
    }
  }

  console.log("[admin-init] Default admins checked cleanly.");
}

