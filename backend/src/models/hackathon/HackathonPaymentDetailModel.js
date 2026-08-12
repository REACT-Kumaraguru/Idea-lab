import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonPaymentDetail = sequelize.define(
  "HackathonPaymentDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "team_id",
    },
    paymentEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "payment_email",
    },
    paidPersonName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "paid_person_name",
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "phone",
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "payment_id",
    },
    status: {
      type: DataTypes.ENUM("pending", "verified"),
      allowNull: false,
      defaultValue: "pending",
      field: "status",
    },
    verifiedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "verified_by_user_id",
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "verified_at",
    },
  },
  {
    tableName: "hackathon_payment_details",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonPaymentDetail;
