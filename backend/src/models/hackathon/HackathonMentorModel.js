import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonMentor = sequelize.define(
  "HackathonMentor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "user_id",
      references: { model: "hackathon_users", key: "id" },
    },
    expertise: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "hackathon_mentors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonMentor;

