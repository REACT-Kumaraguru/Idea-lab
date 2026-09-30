import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonAnnouncement = sequelize.define(
  "HackathonAnnouncement",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "info",
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Hackathon Admin",
    },
    hackathonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "hackathon_id",
    },
  },
  {
    tableName: "hackathon_announcements",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonAnnouncement;
