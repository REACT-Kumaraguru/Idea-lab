
import { connectDB } from "../lib/db.js";
import Admin from "../models/AdminModel.js";
import bcrypt from "bcryptjs";

const createAdmin = async () => {
  try {
    await connectDB();

    const adminData = {
      fullName: "abdulwahidh",
      email: "abdul2005@gmail.com",
      phoneNumber: "7845096426",
      password: "abdul@2005"
    };

    // Check if email or phone already exists
    const existingAdmin = await Admin.findOne({
      where: {
        email: adminData.email
      }
    });

    if (existingAdmin) {
      console.log(`Admin with email ${adminData.email} already exists.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    await Admin.create({
      ...adminData,
      password: hashedPassword,
    });

    console.log("Admin created successfully:");
    console.log(`Name: ${adminData.fullName}`);
    console.log(`Email: ${adminData.email}`);
    console.log(`Phone: ${adminData.phoneNumber}`);
    console.log(`Password: ${adminData.password}`);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
