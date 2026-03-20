import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonTeamMentor = sequelize.define(
  "HackathonTeamMentor",
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
      unique: true, // One mentor assignment per team
      references: { model: "hackathon_teams", key: "id" },
    },
    mentorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "mentor_id",
      references: { model: "hackathon_mentors", key: "id" },
    },
  },
  {
    tableName: "hackathon_team_mentor",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonTeamMentor;

