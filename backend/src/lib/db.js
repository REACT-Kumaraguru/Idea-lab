import { Sequelize } from "sequelize";
import { ENV } from "./env.js";

export const sequelize = new Sequelize(ENV.MYSQL_URI, {
  dialect: "mysql",
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected");
    // Use sync() without alter to avoid MySQL "Too many keys specified; max 64 keys allowed"
    // when Sequelize alters existing tables. New tables are still created if missing.
    // For new columns (e.g. price_per_hour, duration DECIMAL), run the ALTER statements
    // noted in the Equipment and EquipmentBooking model files.
    await sequelize.sync();
    console.log("Database synced");
  } catch (error) {
    console.error("Error connecting to MySQL:", error.message);
    process.exit(1);
  }
};