import bcrypt from "bcryptjs";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";

const DEFAULT_HACKATHON_ADMIN = {
  email: "react@kct.ac.in",
  password: "React-kct@2025",
  fullName: "Hackathon Admin",
  phoneNumber: "0000000000",
  role: "admin",
};

export async function ensureDefaultHackathonAdmin() {
  const existing = await HackathonUser.findOne({ where: { email: DEFAULT_HACKATHON_ADMIN.email } });
  if (existing) return;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEFAULT_HACKATHON_ADMIN.password, salt);

  await HackathonUser.create({
    email: DEFAULT_HACKATHON_ADMIN.email,
    password: hashedPassword,
    fullName: DEFAULT_HACKATHON_ADMIN.fullName,
    phoneNumber: DEFAULT_HACKATHON_ADMIN.phoneNumber,
    role: DEFAULT_HACKATHON_ADMIN.role,
  });

  console.log("Default hackathon admin created:", DEFAULT_HACKATHON_ADMIN.email);
}

