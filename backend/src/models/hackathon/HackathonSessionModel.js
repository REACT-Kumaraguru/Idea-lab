import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonSession = sequelize.define(
  "HackathonSession",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "session_id",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    role: {
      type: DataTypes.ENUM("student", "mentor", "admin", "reviewer"),
      allowNull: false,
    },
  },
  {
    tableName: "hackathon_sessions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default HackathonSession;

