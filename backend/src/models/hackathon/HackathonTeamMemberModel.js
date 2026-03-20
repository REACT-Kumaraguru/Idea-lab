import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonTeamMember = sequelize.define(
  "HackathonTeamMember",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "team_id",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      // Ensures: one team per user
      unique: true,
    },
    isLeader: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_leader",
    },
  },
  {
    tableName: "hackathon_team_members",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonTeamMember;

