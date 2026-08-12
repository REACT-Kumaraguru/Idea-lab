import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonTeam = sequelize.define(
  "HackathonTeam",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "team_name",
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "invite_code",
    },
    leaderUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "leader_user_id",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    hackathonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "hackathon_id",
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "hackathon_teams",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonTeam;

