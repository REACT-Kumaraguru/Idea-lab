import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonUser = sequelize.define(
  "HackathonUser",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // New columns required by hackathon registration form
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "full_name",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "phone_number",
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    college: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "graduation_year",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Hackathon module roles (separate from the core app roles)
    role: {
      type: DataTypes.ENUM("student", "mentor", "admin"),
      allowNull: false,
      defaultValue: "student",
    },
  },
  {
    tableName: "hackathon_users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonUser;

