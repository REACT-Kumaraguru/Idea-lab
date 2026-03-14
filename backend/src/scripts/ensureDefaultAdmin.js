import bcrypt from "bcryptjs";
import Admin from "../models/AdminModel.js";

const DEFAULT_ADMIN = {
  email: "idealab@kct.ac.in",
  password: "idealab-kct",
  fullName: "Idea Lab Admin",
  phoneNumber: "0000000000",
};

export async function ensureDefaultAdmin() {
  const existing = await Admin.findOne({ where: { email: DEFAULT_ADMIN.email } });
  if (existing) return;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, salt);

  await Admin.create({
    email: DEFAULT_ADMIN.email,
    password: hashedPassword,
    fullName: DEFAULT_ADMIN.fullName,
    phoneNumber: DEFAULT_ADMIN.phoneNumber,
  });

  console.log("Default admin created:", DEFAULT_ADMIN.email);
}
