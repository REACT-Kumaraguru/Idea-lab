import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonLog = sequelize.define(
  "HackathonLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hackathonName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "hackathon_name",
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adminName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "admin_name",
    },
    adminEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "admin_email",
    },
  },
  {
    tableName: "hackathon_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonLog;
