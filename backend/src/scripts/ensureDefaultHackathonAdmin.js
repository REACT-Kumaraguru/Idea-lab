import bcrypt from "bcryptjs";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";

const ADMIN_ACCOUNTS = [
  {
    email: "react@kct.ac.in",
    fullName: "Hackathon Admin",
    phone: "0000000000",
    role: "admin",
    password: "react-kct",
  },
  {
    email: "idealab@gmail.com",
    fullName: "Sasikala Mam",
    phone: "0000000000",
    role: "admin",
    password: "idealab@123",
  },
  {
    email: "cse_student@gmail.com",
    fullName: "Adithya 25BCS016",
    phone: "0000000000",
    role: "admin",
    password: "cse_student",
  },
  {
    email: "mentor@kct.ac.in",
    fullName: "Faculty Mentor",
    phone: "0000000000",
    role: "mentor",
    password: "mentorpass123",
  },
];

export async function ensureDefaultHackathonAdmin() {
  try {
    for (const acc of ADMIN_ACCOUNTS) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(acc.password, salt);

      const existing = await HackathonUser.findOne({ where: { email: acc.email } });
      if (!existing) {
        await HackathonUser.create({
          email: acc.email,
          password: hashedPassword,
          fullName: acc.fullName,
          name: acc.fullName,
          phoneNumber: null,
          phone: "0000000000",
          role: acc.role,
        });
        console.log(`Created admin account: ${acc.email} (${acc.fullName})`);
      } else {
        await existing.update({
          password: hashedPassword,
          fullName: acc.fullName,
          phoneNumber: null,
          phone: "0000000000",
          role: acc.role,
        });
        console.log(`Updated admin account: ${acc.email} (${acc.fullName})`);
      }
    }

    await HackathonUser.update(
      { phone: "0000000000", phoneNumber: null },
      { where: { role: "admin" } }
    );
    console.log("Updated phone numbers to 0000000000 for all admin accounts");
  } catch (err) {
    console.error("Error creating default hackathon admins:", err.message);
  }
}
