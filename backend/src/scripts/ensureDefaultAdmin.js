import bcrypt from "bcryptjs";
import Admin from "../models/AdminModel.js";

const ADMIN_ACCOUNTS = [
  {
    email: "idealab@kct.ac.in",
    password: "idealab-kct",
    fullName: "Idea Lab Admin",
    phoneNumber: "0000000000",
  },
  {
    email: "adithya@kct.ac.in",
    password: "adithyapass123",
    fullName: "Adithya (25BBCS016)",
    phoneNumber: "9876543210",
  }
];

export async function ensureDefaultAdmin() {
  for (const account of ADMIN_ACCOUNTS) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(account.password, salt);
    const existing = await Admin.findOne({ where: { email: account.email } });

    if (!existing) {
      await Admin.create({
        email: account.email,
        password: hashedPassword,
        fullName: account.fullName,
        phoneNumber: account.phoneNumber,
      });
    } else {
      await existing.update({ password: hashedPassword, fullName: account.fullName });
    }
  }

  console.log("Default admins created/updated cleanly.");
}
