import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const User = sequelize.define(
  "User",
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
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "full_name",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "phone_number",
    },
    role: {
      type: DataTypes.ENUM("student", "external"),
      allowNull: false,
      defaultValue: "student",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
