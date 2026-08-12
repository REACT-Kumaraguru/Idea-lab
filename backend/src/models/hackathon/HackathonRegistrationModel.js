import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonRegistration = sequelize.define(
  "HackathonRegistration",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    hackathonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "hackathon_id",
    },
  },
  {
    tableName: "hackathon_registrations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "hackathon_id"],
      },
    ],
  }
);

export default HackathonRegistration;
