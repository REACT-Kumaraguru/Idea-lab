import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const OtpCode = sequelize.define(
  "OtpCode",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("register", "reset"),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
  },
  {
    tableName: "otp_codes",
    timestamps: false,
    indexes: [{ fields: ["email", "type"] }],
  }
);

export default OtpCode;
