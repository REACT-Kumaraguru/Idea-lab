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
    },
    expertise: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hackathonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "hackathon_id",
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

