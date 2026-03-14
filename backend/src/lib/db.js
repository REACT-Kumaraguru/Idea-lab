import { Sequelize } from "sequelize";
import { ENV } from "./env.js";

export const sequelize = new Sequelize(ENV.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected");
    await sequelize.sync();
    console.log("Database synced");
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error.message);
    process.exit(1);
  }
};