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
    await sequelize.sync({ alter: true });
    console.log("Database synced");
  } catch (error) {
    console.error("Error connecting to MySQL:", error.message);
    process.exit(1);
  }
};