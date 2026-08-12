import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";

const DEFAULT_STUDENT = {
  email: "student@kct.ac.in",
  password: "studentpass123",
  fullName: "Demo Student",
  phoneNumber: "9876543210",
  role: "student",
  isVerified: true,
};

export async function ensureDefaultStudent() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_STUDENT.password, salt);
    const existing = await User.findOne({ where: { email: DEFAULT_STUDENT.email } });

    if (!existing) {
      await User.create({
        email: DEFAULT_STUDENT.email,
        passwordHash: hashedPassword,
        fullName: DEFAULT_STUDENT.fullName,
        phoneNumber: DEFAULT_STUDENT.phoneNumber,
        role: DEFAULT_STUDENT.role,
        isVerified: true,
      });
      console.log("[db] Created default student account:", DEFAULT_STUDENT.email);
    } else {
      await existing.update({ passwordHash: hashedPassword });
      console.log("[db] Updated default student account:", DEFAULT_STUDENT.email);
    }
  } catch (err) {
    console.error("Error creating default student:", err.message);
  }
}
