
import { connectDB, sequelize } from "../lib/db.js";
import Admin from "../models/AdminModel.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@example.com";
    const password = "adminpassword"; // Change this!
    const fullName = "Super Admin";
    const phoneNumber = "1234567890";

    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Admin.create({
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
    });

    console.log("Admin created successfully");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
