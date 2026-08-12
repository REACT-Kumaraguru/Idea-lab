
import { connectDB, sequelize } from "../lib/db.js";
import User from "../models/UserModel.js";

const verify = async () => {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Connection successful.");

    console.log("Checking User model...");
    const userCount = await User.count();
    console.log(`Current user count: ${userCount}`);

    console.log("Verification finished successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  }
};

verify();
