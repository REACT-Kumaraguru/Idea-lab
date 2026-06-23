import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonProblem = sequelize.define(
  "HackathonProblem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    teamRegistrationLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "team_registration_limit",
    },
  },
  {
    tableName: "hackathon_problems",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonProblem;
